import {create, stopEvent} from "../webix/html";
import {ajax} from "../load/ajax";
import {bind, delay, extend} from "../webix/helpers";
import daterange from "../views/daterange";
import {ui, $$} from "../ui/core";
import i18n from "../webix/i18n";


import datafilter from "./datafilter";

datafilter.richSelectFilter = {
	getInputNode:function(node){
		return $$(node.$webix) || null;
	},
	getValue:function(node){
		var ui = this.getInputNode(node);
		return ui?ui.getValue():"";
	},
	setValue:function(node, value){
		var ui = this.getInputNode(node);
		return ui?ui.setValue(value):"";
	},
	compare:function(a,b){
		return a == b;
	},
	refresh:function(master, node, value){
		if (master.$destructed) return;

		var select = $$(value.richselect);

		//IE8 can destory the content of richselect, so recreating
		if (!select.$view.parentNode) {
			var d = create("div", { "class" : "webix_richfilter" });
			d.appendChild(select.$view);
		}

		node.$webix = value.richselect;
		node.style.marginLeft = "-10px";

		value.compare = value.compare || this.compare;
		value.prepare = value.prepare || this.prepare;
		master.registerFilter(node, value, this);

		var data;
		var options = value.options;
		if (options){
			if(typeof options =="string"){
				data = value.options = [];
				ajax(options).then(bind(function(data){
					value.options = data.json();
					var node = document.body.contains(node) ? node : document.body.querySelector("[active_id=\""+value.contentId+"\"]");
					this.refresh(master, node, value);
				}, this));
			} else
				data = options;
		} else
			data = master.collectValues(value.columnId, value.collect);


		var list = select.getPopup().getList();

		var optview = $$(options);
		if(optview && optview.data && optview.data.getRange){
			data = optview.data.getRange();
		}

		//reattaching node back to master container
		node.firstChild.appendChild(select.$view.parentNode);

		//load data in list, must be after reattaching, as callback of parse can try to operate with innerHTML
		if (list.parse){
			list.clearAll();
			list.parse(data);

			if ((!this.$noEmptyOption && value.emptyOption !== false) || value.emptyOption){
				var emptyOption = { id:"", value: value.emptyOption||"", $empty: true };
				list.add(emptyOption,0);
			}
		}

		//set actual value for the filter
		if (value.value) this.setValue(node, value.value);

		//repaint the filter control
		select.render();

		//adjust sizes after full rendering
		delay(select.resize, select);
	},
	render:function(master, config){
		if (!config.richselect){
			var d = create("div", { "class" : "webix_richfilter" });

			var richconfig = {
				container:d,
				view:this.inputtype,
				options:[]
			};

			var inputConfig = extend( this.inputConfig||{}, config.inputConfig||{}, true );
			extend(richconfig, inputConfig);

			if (config.separator)
				richconfig.separator = config.separator;
			if(config.suggest)
				richconfig.suggest = config.suggest;

			var richselect = ui(richconfig);
			richselect.attachEvent("onChange", function(){
				master.filterByAll();
			});
			
			config.richselect = richselect._settings.id;
			master._destroy_with_me.push(richselect);
		}

		config.css = "webix_div_filter";
		return " ";
	},
	inputtype:"richselect"
};

datafilter.serverRichSelectFilter = extend({
	$server:true
}, datafilter.richSelectFilter);

datafilter.multiSelectFilter = extend({
	$noEmptyOption: true,
	inputtype:"multiselect",
	prepare:function(value, filter){
		if (!value) return value;
		var hash = {};
		var parts = value.toString().split(filter.separator || ",");
		for (var i = 0; i < parts.length; i++)
			hash[parts[i]] = 1;
		return hash;
	},
	compare:function(a,b){
		return !b || b[a];
	}
}, datafilter.richSelectFilter);

datafilter.serverMultiSelectFilter = extend({
	$server:true,
	_on_change:function(){
		var id = this._comp_id;
		$$(id).filterByAll();
	}
}, datafilter.multiSelectFilter);

datafilter.multiComboFilter = extend({
	inputtype:"multicombo",
	inputConfig:{
		tagMode: false
	}
}, datafilter.multiSelectFilter);

datafilter.serverMultiComboFilter = extend({
	inputtype:"multicombo",
	inputConfig:{
		tagMode: false
	}
}, datafilter.serverMultiSelectFilter);

datafilter.datepickerFilter = extend({
	prepare:function(value){ return value||""; },
	compare:function(a,b){ return a*1 == b*1; },
	inputtype:"datepicker"
}, datafilter.richSelectFilter);


datafilter.columnGroup = {
	getValue:function(){},
	setValue:function(){},
	getHelper:function(node, config){
		return {
			open:function(){ config.closed = true; node.onclick(); },
			close:function(){ config.closed = false; node.onclick(); },
			isOpened:function(){ return config.closed; }
		};
	},
	refresh:function(master, node, config){
		node.onclick = function(e){
			stopEvent(e);
			var mark = this.firstChild.firstChild;
			if (config.closed){
				config.closed = false;
				mark.className = "webix_tree_open";
			} else {
				config.closed = true;
				mark.className = "webix_tree_close";
			}

			delay(function(){
				master.callEvent("onColumnGroupCollapse", [config.columnId, config.batch, !config.closed]);
				master.showColumnBatch(config.batch, !config.closed);
			});
		};

		if (!config.firstRun){
			config.firstRun = 1;
			if (config.closed)
				master.showColumnBatch(config.batch, false);
		}
	},
	render:function(master, config){
		return "<div role='button' tabindex='0' aria-label='"+i18n.aria[config.closed?"openGroup":"closeGroup"]+"' class='"+(config.closed?"webix_tree_close":"webix_tree_open")+"'></div>"+(config.groupText||"");
	}
};

datafilter.dateRangeFilter = extend({
	prepare:function(value){
		if (!value.start && !value.end) return "";
		return daterange.api._correct_value(value);
	},
	compare:function(a, b){
		return ((!b.start || a>=b.start) && (!b.end || a<=b.end));
	},
	inputtype:"daterangepicker"
}, datafilter.richSelectFilter);

datafilter.serverDateRangeFilter = extend({
	$server:true
}, datafilter.dateRangeFilter);