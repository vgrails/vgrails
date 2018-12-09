import richselect from "../views/richselect";
import list from "../views/list";

import {protoUI, ui, $$} from "../ui/core";
import {isArray, extend} from "../webix/helpers";

import type from "../webix/type";
import template from "../webix/template";
import editors from "../webix/editors";

const api = {
	name:"multiselect",
	$cssName:"richselect",
	defaults:{
		separator:","
	},
	_suggest_config:function(value){
		var isobj = !isArray(value) && typeof value == "object" && !value.name; 
		var suggest = { view:"checksuggest", separator:this.config.separator, buttonText: this.config.buttonText, button: this.config.button };

		if (this._settings.optionWidth)
			suggest.width = this._settings.optionWidth;
		else
			suggest.fitMaster = true;

		if (isobj)
			extend(suggest, value, true);

		var view = ui(suggest);
		var list = view.getList();
		if (typeof value == "string")
			list.load(value);
		else if (!isobj)
			list.parse(value);

		view.attachEvent("onShow",function(){
			view.setValue($$(view._settings.master).config.value);
		});

		return view;
	},

	$setValue:function(value){
		if (!this._rendered_input) return;
		var popup = this.getPopup();
		var text = "";
		if(popup){
			text = popup.setValue(value);
			if(typeof text == "object"){
				text = text.join(this.config.separator+" ");
			}

		}
		this._settings.text = text;

		var node = this.getInputNode();
		node.innerHTML = text || this._get_div_placeholder();
	},
	getValue:function(){
		return this._settings.value||"";
	},
};

editors.multiselect = extend({
	popupType:"multiselect"
}, editors.richselect);

type(list.view, {
	name:"multilist",
	templateStart:template("<div webix_l_id=\"#!id#\" class=\"{common.classname()}\" style=\"width:{common.widthSize()}; height:{common.heightSize()}; overflow:hidden;\" {common.aria()}>")
}, "default");

type(list.view, {
	name:"checklist",
	templateStart:template("<div webix_l_id=\"#!id#\" {common.aria()} class=\"{common.classname()}\" style=\"width:{common.widthSize()}; height:{common.heightSize()}; overflow:hidden; white-space:nowrap;\">{common.checkbox()}"),
	checkbox: function(obj){
		var icon = (obj.$checked ? "wxi-checkbox-marked" : "wxi-checkbox-blank");
		return "<span role='checkbox' tabindex='-1' aria-checked='"+(obj.$checked?"true":"false")+"' class='webix_icon "+icon+"'></span>";
	},
	aria:function(obj){
		return "role='option' tabindex='-1' "+(obj.$checked?"aria-selected='true'":"");
	},
	template: template("#value#")
}, "default");

const view = protoUI(api,  richselect.view);
export default {api, view};