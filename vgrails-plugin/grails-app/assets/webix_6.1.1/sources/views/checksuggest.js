import multisuggest from "../views/multisuggest";
import {protoUI, $$} from "../ui/core";
import {isArray, copy} from "../webix/helpers";
import i18n from "../webix/i18n";


const api = {
	name:"checksuggest",
	defaults:{
		button:false,
		selectAll: false,
		body:{
			rows:[
				{ view:"checkbox", hidden:true, customCheckbox:false, borderless: false, css:"webix_checksuggest_select_all", 
					labelRight:i18n.combo.selectAll, labelWidth:0, value: 0, 
					height:28, inputHeight:20,
					on:{
						onItemClick: function(e){
							var popup = this.getParentView().getParentView();
							var check = popup.getList();
							var values = check.data.order;
							for(var i = 0; i < values.length; i++) {
								var value = check.getItem(values[i]);
								value.$checked = this.getValue();
							}
							var result = this.getValue() ? [].concat(values) : [];
							popup._toggleOption(values[0], e, result);
							check.refresh();
						},
						onChange: function() {
							var link = this.$view.querySelector("label");
							var locale = i18n.combo;
							link.textContent = this.getValue() ? locale.unselectAll : locale.selectAll;
						},
						onAfterRender: function() {
							var popup = this.getParentView().getParentView();
							this.setValue(popup._is_all_selected()*1);
						}
					}},
				{ view:"list",  css:"webix_multilist", borderless:true, autoheight:true, yCount:5,
					type:"checklist",
					on:{
						onItemClick: function(id, e){
							var item = this.getItem(id);
							item.$checked = item.$checked?0:1;
							this.refresh(id);
							var popup = this.getParentView().getParentView();
							popup._click_stamp = new Date();

							popup._toggleOption(id, e);

							if(popup.config.selectAll) {
								if (!item.$checked)
									popup.getBody()._cells[0].setValue(0);
								else if(popup._is_all_selected())
									popup.getBody()._cells[0].setValue(1);
							}
						}
					}
				},
				{ view:"button", click:function(){
					var suggest = this.getParentView().getParentView();
					suggest.setMasterValue({ id:suggest.getValue() });
					suggest.hide();
				}}
			]
		}
	},
	_is_all_selected:function(){
		var all = (this.getValue() || "").split(this.config.separator);
		return (all.length === this.getList().count());
	},
	_get_extendable_cell:function(obj){
		return obj.rows[1];
	},
	getButton:function(){
		return this.getBody().getChildViews()[2];
	},
	getList:function(){
		return this.getBody().getChildViews()[1];
	},
	$init: function(){
		this._valueHistory = {};
		this.$ready.push(this._onReady);
	},
	_onReady: function(){
		var list = this.getList();
		if(list.config.dataFeed){
			var suggest = this;
			list.attachEvent("onAfterLoad", function(){
				suggest.setValue(suggest._settings.value);
			});
			list.getItem = function(id){
				return this.data.pull[id] || suggest._valueHistory[id];
			};
		}
		
		if(this.config.master && !this.config.selectAll)
			this.getBody().getChildViews()[0].hide();
	},
	$enterKey: function(popup,list) {
		if (list.count && list.count()){
			if (popup.isVisible()) {
				var value = list.getSelectedId(false, true);
				if(value){
					this._toggleOption(value);
				}
				popup.hide(true);
			} else {
				popup.show(this._last_input_target);
			}
		} else {
			if (popup.isVisible())
				popup.hide(true);
		}
	},
	_show_selection: function(){
		var list = this.getList();
		if( list.select)
			list.unselect();
	},
	setValue:function(value){
		var i,
			list = this.getList(),
			text = [],
			values = {},
			changed = [];

		value = value || [];

		if (!isArray(value))
			value = value.toString().split(this.config.separator);
		else if(list.config.dataFeed)
			value = this._toMultiValue(value);

		for ( i = 0; i < value.length; i++){
			values[value[i]] = 1;
			if(list.getItem(value[i])){
				if( this._valueHistory)
					this._valueHistory[value[i]] = copy(list.getItem(value[i]));
				text.push(this.getItemText(value[i]));
			}
		}

		list.data.each(function(item){
			if(item.$checked){
				if(!values[item.id]){
					item.$checked = 0;
					changed.push(item.id);
				}
			}
			else{
				if(values[item.id]){
					item.$checked = 1;
					changed.push(item.id);
				}
			}

		},this,true);


		for( i=0; i < changed.length; i++ ){
			list.refresh(changed[i]);
		}
		this._settings.value = value.length?value.join(this.config.separator):"";
		return text;
	},
	getValue:function(){
		return this._settings.value;
	},
	_preselectMasterOption: function(){
		var node, master;
		if (this._settings.master){
			master = $$(this._settings.master);
			node = master.getInputNode();
		}
		node = node || this._last_input_target;
		if(node)
			node.focus();
	},
	_toMultiValue: function(value){
		if(value && isArray(value)){
			var values = [];
			for(var i =0; i < value.length; i++){
				if(value[i].id){
					this._valueHistory[value[i].id] = copy(value[i]);
					values.push(value[i].id);
				}
				else{
					values.push(value[i]);
				}
			}
			value = values;
		}
		return value;
	}
};


const view = protoUI(api,  multisuggest.view);
export default {api, view};