import {create, insertBefore, remove, createCss} from "../webix/html";
import {protoUI} from "../ui/core";
import {extend, bind} from "../webix/helpers";
import {$active} from "../webix/skin";

import env from "../webix/env";
import template from "../webix/template";
import base from "../views/view";

import AutoTooltip from "../core/autotooltip";
import Group from "../core/group";
import TreeAPI from "../core/treeapi";
import DataMarks from "../core/datamarks";
import SelectionModel from "../core/selectionmodel";
import MouseEvents from "../core/mouseevents";
import Scrollable from "../core/scrollable";
import RenderStack from "../core/renderstack";
import TreeDataLoader from "../core/treedataloader";
import DataLoader from "../core/dataloader";
import EventSystem from "../core/eventsystem";
import TreeStore from "../core/treestore";
import Canvas from "../core/canvas";


/*
	UI:Organogram
*/




const api = {
	name:"organogram",
	defaults:{
		scroll: "auto",
		ariaLabel:"lines"
	},
	$init:function(){
		this._viewobj.className += " webix_organogram";
		//map API of DataStore on self
		this._html = document.createElement("DIV");

		this.$ready.push(this._afterInit);
		extend(this.data, TreeStore, true);
		this.data.provideApi(this,true);
	},
	//attribute , which will be used for ID storing
	_id:"webix_dg_id",
	//supports custom context menu
	on_click:{
		webix_organogram_item:function(e,id){
			if (this._settings.select){
				if (this._settings.select=="multiselect"  || this._settings.multiselect)
					this.select(id, false, (e.ctrlKey || e.metaKey || (this._settings.multiselect == "touch")), e.shiftKey); 	//multiselection
				else
					this.select(id);
				this._no_animation = false;
			}
		}
	},
	on_context:{},
	on_dblclick:{},
	_afterInit:function(){
		this._dataobj.style.position = "relative";
		this.data.attachEvent("onStoreUpdated",bind(this.render,this));
	},
	_toHTMLItem:function(obj){
		var mark = this.data._marks[obj.id];

		this.callEvent("onItemRender",[obj]);
		return this.type.templateStart.call(this,obj,this.type,mark)+(obj.$template?this.type["template"+obj.$template].call(this,obj,this.type,mark):this.type.template.call(this,obj,this.type,mark))+this.type.templateEnd.call(this);
	},
	_toHTML:function(obj){
		//check if related template exist
		var html=this._toHTMLItem(obj);

		if (this.data.branch[obj.id])
			html += this._renderBranch(obj.id);

		return html;
	},
	_isListBlocks: function(){
		return 	this.type.listMarginX || this.type.listMarginY;
	},
	_renderBranch: function(pId, leftOffset){
		var i, id,
			html = "",
			leaves = this.data.branch[pId],
			marks = this.data._marks[pId],
			pItem = this.getItem(pId),
			sizes, totalWidth,
			type = (pItem?pItem.$type:false);

		leftOffset = leftOffset || 0;
		if (type === "list")
			leftOffset += this.type.listMarginX;



		if(!pId){
			this._colHeight = [];
			this.$xy = {};
			totalWidth = this.$width - this.type.padding*2;

			this.$xy[0] = {
				totalWidth: totalWidth,
				start: this.type.padding,
				width: 0,
				height: 0,
				left: totalWidth/2,
				top: this.type.padding||0
			};
		}

		if(leaves){
			sizes = this.$xy[pId];

			// draw items inside list container
			if(type == "list" && !this._isListBlocks()){
				html += this.type.templateListStart.call(this,pItem, this.type, marks);
			}
			// render items and calculate heights
			var sumTotalWidth = 0;

			var childHeight = 0;
			for( i=0; i < leaves.length; i++){
				id = leaves[i];
				totalWidth = this._tw[id];
				let obj = this.getItem(id);

				if(obj.open == undefined)
					obj.open = true;

				if(type == "list")
					this.data.addMark(id, "list_item","", 1, true);

				var height = this._getItemHeight(id);
				if(type == "list"){
					var itemMargin = 0;
					if(this._isListBlocks())
						itemMargin = this.type.listMarginY;
					else if(!i)
						itemMargin = this.type.marginY;

					this.$xy[id] = {
						totalWidth: totalWidth,
						start: sizes.start,
						width: this.type.width,
						height: height,
						left: sizes.start + totalWidth/2 -  this.type.width/2+ leftOffset,
						top: i?(this.$xy[leaves[i-1]].top+this.$xy[leaves[i-1]].height+itemMargin+childHeight):(sizes.top+sizes.height+itemMargin)
					};
					childHeight = this.data.branch[id] ? this._getBranchHeight(id) : 0;
				}
				else{
					this.$xy[id] = {
						totalWidth: totalWidth,
						start: sizes.start + sumTotalWidth,
						width: this.type.width,
						height: height,
						left: sizes.start + sumTotalWidth  + totalWidth/2 -  this.type.width/2 ,
						top: sizes.top + sizes.height + (pId?this.type.marginY:0)
					};

				}
				html += this._toHTMLItem(obj);
				sumTotalWidth += totalWidth;

			}

			// draw child branches
			for( i=0; i < leaves.length; i++){
				id = leaves[i];

				if (this.data.branch[id] && this.getItem(id).open){
					html += this._renderBranch(id, leftOffset);
				}
				else if(pItem){
					if(pItem.$type != "list")
						this._colHeight.push(this.$xy[id].top+this.$xy[id].height);
					else if(i == (leaves.length-1)){
						this._colHeight.push(this.$xy[id].top+this.$xy[id].height);
					}
				}
			}

			var leftmost = 0;
			for (var key in this.$xy){
				let obj = this.$xy[key];
				leftmost = Math.max(obj.left + obj.width, leftmost);
			}
			this._dataobj.style.width = leftmost + this.type.padding + this.type.marginX/2 + "px";

			if(type == "list" && !this._isListBlocks())
				html += this.type.templateListEnd(pItem, this.type, marks);
		}

		return html;
	},

	_getBranchHeight:function(id){
		var items = this.data.branch[id];
		var height = 0;
		for (var i = 0; i < items.length; i++) {
			height += this._getItemHeight(items[i])+this.type.listMarginY;
			if (this.data.branch[items[i]])
				height += this._getBranchHeight(items[i]);
		}
		return height + this.type.marginY;
	},

	_getItemHeight: function(id){
		var item = this.getItem(id);
		var height = this.type.height;
		if( typeof height == "function"){
			height = height.call(item, this.type, this.data._marks[id]);
		}


		if(!this._hDiv){
			this._hDiv = create("div");
			this._dataobj.appendChild(this._hDiv);

		}

		this._hDiv.className = this.type.classname(item,this.type,this.data._marks[id]);
		this._hDiv.style.cssText="width:"+this.type.width+"px;height:"+height+(height=="auto"?"":"px")+";";
		this._hDiv.innerHTML = this.type.template.call(this,item,this.type,this.data._marks[id]);
		return this._hDiv.scrollHeight;
	},
	_calcTotalWidth: function(){
		var tw = {};
		var width = this.type.width;
		var margin = this.type.marginX;
		this.data.each(function(obj){
			tw[obj.id] = width + margin;

			var parentId = this.getParentId(obj.id);
			if(parentId && this.getItem(parentId).$type != "list")
				while(parentId){
					var leaves = this.branch[parentId];
					tw[parentId] = 0;

					for( var i =0; i < leaves.length; i++){
						tw[parentId] += tw[leaves[i]]||0;
					}
					parentId = this.getParentId(parentId);
				}
		});
		this._tw = tw;
		return tw;

	},
	getItemNode:function(searchId){
		if (this._htmlmap)
			return this._htmlmap[searchId];

		//fill map if it doesn't created yet
		this._htmlmap={};

		var t = this._dataobj.childNodes;
		for (var i=0; i < t.length; i++){
			var id = t[i].getAttribute(this._id); //get item's
			if (id)
				this._htmlmap[id]=t[i];
			if(t[i].className.indexOf("webix_organogram_list")!=-1 && !this._isListBlocks()){
				var listNodes = t[i].childNodes;
				for (var j=0; j < listNodes.length; j++){
					id = listNodes[j].getAttribute(this._id); //get item's
					if (id)
						this._htmlmap[id]=listNodes[j];
				}
			}

		}

		//call locator again, when map is filled
		return this.getItemNode(searchId);
	},
	_toHTMLObject:function(obj){
		this._html.innerHTML = this._toHTMLItem(obj);
		return this._html.firstChild;
	},
	render:function(id,data,type){
		if (!this.isVisible(this._settings.id) || this.$blockRender)
			return;

		if(type == "update"){
			var cont = this.getItemNode(id); //get html element of updated item

			var t = this._htmlmap[id] = this._toHTMLObject(data);
			insertBefore(t, cont);
			remove(cont);
			return true;
		}
		else{
			//full reset
			if (this.callEvent("onBeforeRender",[this.data])){
				this._calcTotalWidth();
				this._htmlmap = null;
				this._dataobj.innerHTML = this._renderBranch(0);
				this._hDiv = null;

				this._dataobj.style.height = Math.max.apply(Math, this._colHeight)+this.type.padding+"px";
				this._renderCanvas();
				this.resize();
				this.callEvent("onAfterRender",[]);
			}
		}
		return true;
	},
	_renderCanvas: function(){
		if(this.canvas)
			this.canvas.clearCanvas(true);

		this.canvas = new Canvas({
			container:this._dataobj,
			name:this.name,
			title:this._settings.ariaLabel,
			width: this._dataobj.offsetWidth,
			height:this._dataobj.offsetHeight
		});

		this._drawLines(0);
	},
	_drawLine:function(ctx,x1,y1,x2,y2,color,width){
		ctx.strokeStyle = color;
		ctx.lineCap="square";
		ctx.lineWidth = width;
		ctx.beginPath();
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.stroke();
		ctx.lineWidth = 1;
	},
	_drawLines: function(id,ctx){
		var i, item, leaves, p, s,
			x12,y1,y2,
			start, end;

		if(!ctx)
			ctx = this.canvas.getCanvas();
		if(!this.$xy){
			return;
		}
		id = id||0;
		leaves = this.data.branch[id];
		item = this.getItem(id);
		if(leaves && leaves.length){
			p = this.$xy[id];
			// draw a vertical line between parent and nodes
			if(id){

				x12 = parseInt(p.left+ p.width/2,10) +0.5;
				y1 = parseInt(p.top + p.height,10);
				y2 = parseInt(p.top + p.height+ this.type.marginY/2,10);

				if(item.$type == "list"){
					if(!this._isListBlocks()){
						y2 = parseInt(p.top + p.height+ this.type.marginY,10);
						this._drawLine(ctx,x12, y1, x12, y2, this.type.lineColor);
						return;
					}

				}
				else
					this._drawLine(ctx,x12, y1, x12, y2, this.type.lineColor);
			}


			y1 =  parseInt(p.top + p.height+ this.type.marginY/2,10)+0.5;
			for(i = 0; i < leaves.length; i++){
				if(id){
					s = this.$xy[leaves[i]];
					if(item.$type == "list" && this._isListBlocks()){
						x12 = parseInt(p.left + this.type.listMarginX/2,10) + 0.5;
						if(!i)
							start = x12;
						else if(i == (leaves.length - 1))
							end = x12;
						y2 = parseInt(s.top + s.height/2,10);
						this._drawLine(ctx,x12, y1 - this.type.marginY/2, x12, y2, this.type.lineColor);
						this._drawLine(ctx,x12, y2, x12+this.type.listMarginX/2, y2, this.type.lineColor);
					}
					else{
						x12 = parseInt(s.left+ s.width/2,10) + 0.5;
						if(!i)
							start = x12;
						else if(i == (leaves.length - 1))
							end = x12;
						y2 = parseInt(s.top ,10);
						this._drawLine(ctx,x12, y1, x12, y2, this.type.lineColor);
					}

				}
				if(this.getItem(leaves[i]).open)
					this._drawLines(leaves[i],ctx);
			}
			if(id)
				this._drawLine(ctx,start, y1, end, y1,this.type.lineColor);
		}
	},
	//autowidth, autoheight - no inner scroll
	//scrollable - width, height, auto, with scroll
	$getSize:function(dx,dy){
		var aW = this._settings.autowidth;
		var aH = this._settings.autoheight;
		if(aW){
			dx = this._dataobj.offsetWidth+(this._dataobj.offsetHeight>dy && !aH?env.scrollSize:0);
		}
		if(aH){
			dy = this._dataobj.offsetHeight + (this._dataobj.offsetWidth>dx && !aW?env.scrollSize:0);
		}

		return base.api.$getSize.call(this, dx, dy);
	},
	$setSize:function(x,y){
		if(base.api.$setSize.call(this,x,y)){
			this._dataobj.style.width = this.$width+"px";
			this._dataobj.style.height = this.$height+"px";
			this.render();
		}
	},
	//css class to action map, for dblclick event
	type:{
		width: 120,
		height: "auto",
		padding: 20,
		marginX: 20,
		marginY: 20,
		listMarginX: 0,
		listMarginY: 0,
		lineColor: $active.organogramLineColor || "#90caf9",
		classname:function(obj, common, marks){
			var css = "webix_organogram_item ";
			if (obj.$css){
				if (typeof obj.$css == "object")
					obj.$css = createCss(obj.$css);
				css += " "+obj.$css;
			}

			if(marks && marks.list_item)
				css += " webix_organogram_list_item ";
			if(marks && marks.$css)
				css += marks.$css;
			css += " webix_organogram_level_"+obj.$level;
			return css;
		},
		listClassName: function(obj){
			var css =  "webix_organogram_list webix_organogram_list_"+obj.$level;
			if (obj.$listCss){
				if (typeof obj.$listCss == "object")
					obj.$listCss = createCss(obj.$listCss);
				css += " "+obj.$listCss;
			}
			return css;
		},
		template:template("#value#"),
		templateStart:function(obj,type,marks){
			var style="";
			if((!(marks && marks.list_item) || type.listMarginX || type.listMarginY) && this.$xy){
				var xy = this.$xy[obj.id];
				style += "width: "+ xy.width+"px; height: " + xy.height+"px;";
				style += "top: "+ xy.top+"px; left: " + xy.left+"px;";
			}
			return "<div webix_dg_id=\""+obj.id+"\" class=\""+type.classname.call(this,obj,type,marks)+"\""+(style?"style=\""+style+"\"":"")+"\">";
		},
		templateEnd:template("</div>"),
		templateListStart:function(obj,type,marks){
			var style="";
			if(this.$xy){
				var xy = this.$xy[obj.id];
				style += "width: "+ xy.width+"px;";
				style += "top: "+ (xy.top+xy.height+type.marginY)+"px; left: " + xy.left+"px;";
			}
			return "<div class=\""+type.listClassName.call(this,obj,type,marks)+"\""+(style?"style=\""+style+"\"":"")+"\">";
		},
		templateListEnd:template("</div>")
	}
};


const view = protoUI(api,  AutoTooltip, Group, TreeAPI, DataMarks, SelectionModel, MouseEvents, Scrollable, RenderStack, TreeDataLoader, DataLoader, base.view, EventSystem);
export default {api, view};