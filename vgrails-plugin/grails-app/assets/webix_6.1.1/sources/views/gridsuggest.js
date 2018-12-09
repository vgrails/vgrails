import suggest from "../views/suggest";
import {protoUI} from "../ui/core";
import {bind} from "../webix/helpers";


const api = {
	name:"gridsuggest",
	defaults:{
		type:"datatable",
		fitMaster:false,
		width:0,
		body:{
			navigation:true,
			autoheight:true,
			autowidth:true,
			select:true
		},
		filter:function(item, value){
			var text = this.config.template(item);
			if (text.toString().toLowerCase().indexOf(value.toLowerCase())===0) return true;
			return false;
		}
	},
	$init:function(obj){
		if (!obj.body.columns)
			obj.body.autoConfig = true;
		if (!obj.template)
			obj.template = bind(this._getText, this);
	},
	_getText:function(item){
		var grid = this.getBody();
		var value = this.config.textValue || grid.config.columns[0].id;
		return grid.getText(item.id, value);
	}
};


const view = protoUI(api,  suggest.view);
export default {api, view};