import suggest from "../views/suggest";
import {protoUI, $$} from "../ui/core";
import {delay, toArray, bind, isArray} from "../webix/helpers";
import i18n from "../webix/i18n";


const api = {
	name:"multisuggest",
	defaults:{
		separator:",",
		type:"layout",
		button:true,
		width:0,
		filter:function(item,value){
			var itemText = this.getItemText(item.id);
			return (itemText.toString().toLowerCase().indexOf(value.toLowerCase())>-1);
		},
		body:{
			rows:[
				{ view:"list", type:"multilist", borderless:true,  autoheight:true, yCount:5, multiselect:"touch", select:true,
					on:{
						onItemClick: function(id){
							var popup = this.getParentView().getParentView();
							delay(function(){
								popup._toggleOption(id);
							});
						}
					}},
				{ view:"button", click:function(){
					var suggest = this.getParentView().getParentView();
					suggest.setMasterValue({ id:suggest.getValue() });
					suggest.hide();
				}}
			]
		}
	},

	_toggleOption: function(id, ev, all){
		var value = this.getValue();
		var values = all || toArray(value?this.getValue().split(this._settings.separator):[]);
		var master = $$(this._settings.master);
		
		if(!all) {
			if(values.find(id)<0)
				values.push(id);
			else
				values.remove(id);
		}

		if(master){
			master.setValue(values.join(this._settings.separator));
		} else {
			var text = this.setValue(values);
			
			if (this._last_input_target)
				this._last_input_target.value = text.join(this._settings.separator);
		}

		if(ev){ //only for clicks in checksuggest
			var checkbox = this.getList().getItemNode(id).getElementsByTagName("SPAN");
			if(checkbox && checkbox.length) checkbox[0].focus();
		}
	},
	_get_extendable_cell:function(obj){
		return obj.rows[0];
	},
	_set_on_popup_click:function(){
		var button = this.getButton();
		var text = (this._settings.button?(this._settings.buttonText || i18n.combo.select):0);
		if(button){
			if(text){
				button._settings.value = text;
				button.refresh();
			}
			else
				button.hide();
		}
		if (this._settings.selectAll)
			return this.getBody().getChildViews()[0].show();

		var list = this.getList();
		//for standalone suggests we need to have a normal show/hide logic
		//use a wrapper function, so it can later be cleared in multicombo
		list.data.attachEvent("onAfterFilter", bind(function(){
			return this._suggest_after_filter();
		}, this));
	},
	_show_selection: function(){
		var list = this.getList();
		var value = this.getMasterValue();
		if(value){
			value = value.toString().split(this.config.separator);
			if (value[0]){
				for (var i = 0; i < value.length; i++){
					if(list.exists(value[i]))
						list.select(value[i], true);
				}
			}
		}
	},
	getButton:function(){
		return this.getBody().getChildViews()[1];
	},
	getList:function(){
		return this.getBody().getChildViews()[0];
	},
	setValue:function(value){
		var text = [];
		var list = this.getList();
		list.unselect();

		if (value){
			if (!isArray(value))
				value = value.toString().split(this.config.separator);

			if (value[0]){
				for (var i = 0; i < value.length; i++){
					if (list.getItem(value[i])){
						if(list.exists(value[i]))
							list.select(value[i], true);
						text.push(this.getItemText(value[i]));
					}
				}
			}
		}

		this._settings.value = value?value.join(this.config.separator):"";
		return text;
	},
	getValue:function(){
		return this._settings.value;
	}
};


const view = protoUI(api,  suggest.view);
export default {api, view};