import toolbar from "../views/toolbar";
import {getTextSize} from "../webix/html";
import {protoUI} from "../ui/core";
import i18n from "../webix/i18n";


const api = {
	name: "pdfbar",
	reset:function(){
		this.setPage(0);
		this.setValues(0, "auto");
	},
	$init:function(config){
		this.$view.className +=" pdf_bar";
		
		config.cols = [
			{ view:"button", type:"icon", icon:"wxi-angle-left", width:35, click:function(){ this.getParentView()._navigate("prev");}},
			{ view:"text", width:70, value:"0", on:{
				onBlur:function(){ this.getParentView()._navigate(this.getValue());},
				onKeyPress:function(code){ if(code === 13) this.getParentView()._navigate(this.getValue());}
			}},
			{ template:i18n.PDFviewer.of+" #limit#", width:70, data:{limit:0}, borderless:true },
			{ view:"button", type:"icon", icon:"wxi-angle-right", width:35, click:function(){ this.getParentView()._navigate("next");}},
			{},
			{view:"button", type:"icon", icon:"wxi-minus", width:35, click:function(){ this.getParentView().zoom("out");}},
			{view:"richselect", options:[], maxWidth:195, suggest:{
				padding:0, css:"pdf_opt_list", borderless:true, body:{
					type:{ height:25}, scroll:false, yCount:13 }
			},
			on:{ onChange:function(){ this.getParentView().setMasterScale(this.getValue());}}
			},
			{view:"button", type:"icon", icon:"wxi-plus", width:35, click:function(){ this.getParentView().zoom("in");}},
			{view:"button", type:"icon", icon:"wxi-download", width:35, click:function(){ this.getParentView().download();}}
		];
		this.$ready.push(this._setScaleOptions);
	},
	_setScaleOptions:function(){
		var list = this.getChildViews()[6].getPopup().getBody();
		list.clearAll();
		list.parse([
			{ id:"auto", value:i18n.PDFviewer.automaticZoom}, { id:"page-actual", value:i18n.PDFviewer.actualSize},
			{ id:"page-fit", value:i18n.PDFviewer.pageFit}, { id:"page-width", value:i18n.PDFviewer.pageWidth},
			{ id:"page-height", value:i18n.PDFviewer.pageHeight},
			{ id:"0.5", value:"50%"}, { id:"0.75", value:"75%"},
			{ id:"1", value:"100%"}, { id:"1.25", value:"125%"},
			{ id:"1.5", value:"150%"}, { id:"2", value:"200%"},
			{ id:"3", value:"300%"}, { id:"4", value:"400%"}
		]);
		var width = 0;
		list.data.each(function(obj){
			width = Math.max(getTextSize(obj.value, "webixbutton").width, width);
		});
		this.getChildViews()[6].define("width", width+20);
		this.getChildViews()[6].resize();
	},
	_navigate:function(num){
		this.setMasterPage(num);
		this.setPage(this.$master.$pageNum);
	},
	setScale:function(scale){
		var sel = this.getChildViews()[6];
		sel.blockEvent();
		if(sel.getPopup().getList().exists(scale))
			sel.setValue(scale);
		else{
			sel.setValue("");
			sel.getInputNode().innerHTML = (scale*100).toFixed(0)+"%";
		}
		sel.unblockEvent();
	},
	setMasterScale:function(value){
		if(!this.$master) return;
		this.$master.setScale(value);
	},
	setMasterPage:function(num){
		if(!this.$master) return;
		if(num === "prev")
			this.$master.prevPage();
		else if(num==="next")
			this.$master.nextPage();
		else if(!isNaN(parseInt(num)))
			this.$master.renderPage(parseInt(num));
	},
	zoom:function(dir){
		if(!this.$master) return;
		if(dir === "out")
			this.$master.zoomOut();
		else if(dir === "in")
			this.$master.zoomIn();

	},
	setPage:function(num){
		this.getChildViews()[1].setValue(num);
	},
	setValues:function(num, scale){
		this.getChildViews()[2].data.limit = num;
		this.getChildViews()[2].refresh();

		this.setScale(scale);
	},
	download:function(){
		if(!this.$master) return;
		this.$master.download();
	}
};


const view = protoUI(api,  toolbar.view);
export default {api, view};