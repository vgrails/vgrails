import toolbar from "../views/toolbar";
import {protoUI} from "../ui/core";


const api = {
	name: "excelbar",
	defaults:{
		padding:0,
		type:"line"
	},
	$init:function(config){
		config.cols = [
			{ view:"tabbar", options:[""], optionWidth:200, borderless:true, on:{
				onaftertabclick:function(){
					this.getParentView().callEvent("onExcelSheetSelect", [this.getValue()]);
				}
			}}
		];
	},
	getValue:function(){
		return this.getInput().getValue();
	},
	setValue:function(value){
		return this.getInput().setValue(value);
	},
	getInput:function(){
		return this.getChildViews()[0];
	},
	setSheets:function(sheets){
		var input = this.getInput();
		input.config.options = sheets;
		input.refresh();
	}
};


const view = protoUI(api,  toolbar.view);
export default {api, view};