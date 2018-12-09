import gridlayout from "../views/gridlayout";
import {offset, pos as getPos, create, remove} from "../webix/html";
import {protoUI, $$} from "../ui/core";
import env from "../webix/env";
import {uid, extend} from "../webix/helpers";
import DragControl from "../core/dragcontrol";


const api = {
	name:"dashboard",
	$init:function(){
		DragControl.addDrag(this.$view, this);
		DragControl.addDrop(this.$view, this, true);
	},
	_isDragNode:function(target){
		if (!target.getAttribute || target.getAttribute("webix_disable_drag") || target.getAttribute("webixignore")) return false;

		var css = (target.className || "").toString();
		if (css.indexOf("panel_drag") != -1)
			return target;
		if (target.parentNode && target != this.$view)
			return this._isDragNode(target.parentNode);

		return false;
	},
	$dragCreate:function(object, e){
		if (!e.target) return;

		if (!this._isDragNode(e.target)) return false;
		
		// ok, it seem the dnd need to be started
		var sview = $$(e);
		if (!sview.$resizeMove)
			sview = sview.queryView(function(a){ return !!a.config.dx; }, "parent" );

		var box = offset(this.$view);
		var pos = getPos(e);

		DragControl._drag_context = { 
			source:sview, from:this,
			dashboard:{
				sx: pos.x - box.x - parseInt(sview.$view.style.left)+ this._settings.margin/2,
				sy: pos.y - box.y - parseInt(sview.$view.style.top)+ this._settings.margin/2
			}
		};

		
		this._addDragMarker(sview._settings.dx, sview._settings.dy);
		return sview.$view;
	},
	_addDragMarker:function(x, y){
		var drag = this._dragMarker = create("div", { "class":"panel_target" });
		var size = this._getActualSize(0,0, x, y);
		drag.style.width = size.dx+"px";
		drag.style.height = size.dy+"px";

		this.$view.appendChild(this._dragMarker);
	},
	$drop:function(){
		var context = DragControl._drag_context;
		var obj = {
			x: context.dashboard.x,
			y: context.dashboard.y
		};

		if (context.from === this){
			var conf = context.source.config;
			this.moveView(conf.id, obj);
		} else {
			obj.name = context.source[0];
			obj.dx = context.dashboard.dx;
			obj.dy = context.dashboard.dy;
			obj.id = obj.name+":"+uid();

			obj = this._settings.factory.call(this, obj);
			if (obj){
				this.addView(obj);
			}
		}
	},
	$dragDestroy:function(target, html){
		html.style.zIndex = 1;
		remove(this._dragMarker);
		this._dragMarker = null;

		this._apply_new_grid();
	},
	_getPosFromCoords:function(x,y){
		var margin = this._settings.margin;
		var paddingX = this._settings.paddingX || this._settings.padding;
		var paddingY = this._settings.paddingY || this._settings.padding;

		var dx = this._settings.cellWidth;
		if (!dx) dx = (this.$width - 2 * paddingX + margin) / this._settings.gridColumns - margin;
		var dy = this._settings.cellHeight;
		if (!dy) dy = (this.$height - 2 * paddingY + margin) / this._actual_rows - margin;

		x = Math.round(-0.2 + (x - paddingX)/(dx+margin/2));
		y = Math.round(-0.2 + (y - paddingX)/(dy+margin/2));

		x = Math.max(0, Math.min(x, this._settings.gridColumns));
		y = Math.max(0, Math.min(y, this._actual_rows));
		
		return {
			x:x, y:y,
			width: dx, height:dy, margin:margin,	
			rx: x*dx+margin*x+paddingX,
			ry: y*dy+margin*y+paddingY
		};
	},
	$dragOut:function(){
		var context = DragControl._drag_context;
		if (this._dragMarker && context.external){
			remove(this._dragMarker);
			this._dragMarker = null;
		}
	},
	$dragIn:function(to, from, e){
		var context = DragControl._drag_context;
		if (!this._dragMarker){
			// drag source must provide getItem method
			if (!context.from || !context.from.getItem) return false;
			// when factory not defined, do not allow external drag-n-drop
			if (!this._settings.factory)
				return false;
		

			context.external = true;
			var item = context.from.getItem(context.source);
			context.dashboard = { dx : item.dx, dy : item.dy };

			this._addDragMarker(item.dx, item.dy);
		}
		if (context.external){
			var drag = this._dragMarker;
			var evObj = env.mouse.context(e);
			var box = offset(this.$view);

			var inpos = this._getPosFromCoords(evObj.x - box.x, evObj.y - box.y);
			extend(context.dashboard , inpos, true);
			drag.style.left = inpos.rx+"px";
			drag.style.top = inpos.ry+"px";
		}

		return true;
	},
	$dragPos: function(pos, e, html){
		var context = DragControl._drag_context;
		html.style.left = "-10000px";

		var evObj = env.mouse.context(e);
		var box = offset(this.$view);
		var dash = context.dashboard;

		var inpos = this._getPosFromCoords(evObj.x - box.x - dash.sx , evObj.y - box.y - dash.sy);
		pos.x = evObj.x - dash.sx - box.x;
		pos.y = evObj.y - dash.sy - box.y;

		//drag marker
		var drag = this._dragMarker;
		drag.style.left = inpos.rx+"px";
		drag.style.top = inpos.ry+"px";

		extend(dash , inpos, true);
	},
};


const view = protoUI(api,  gridlayout.view);
export default {api, view};