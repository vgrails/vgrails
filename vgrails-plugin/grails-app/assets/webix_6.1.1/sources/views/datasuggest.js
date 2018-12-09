import suggest from "../views/suggest";
import {protoUI} from "../ui/core";


const api = {
	name:"datasuggest",
	defaults:{
		type:"dataview",
		fitMaster:false,
		width:0,
		body:{
			xCount:3,
			autoheight:true,
			select:true
		}
	}
};


const view = protoUI(api,  suggest.view);
export default {api, view};