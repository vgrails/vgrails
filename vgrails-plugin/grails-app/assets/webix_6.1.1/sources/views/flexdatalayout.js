import datalayout from "../views/datalayout";
import {protoUI} from "../ui/core";
import {extend} from "../webix/helpers";
import FlexLayout from "../core/flexlayout";


const api = {
	$init:function(){
		extend(this, FlexLayout, true);
	},
	name:"flexdatalayout"
};


const view = protoUI(api,  datalayout.view);
export default {api, view};