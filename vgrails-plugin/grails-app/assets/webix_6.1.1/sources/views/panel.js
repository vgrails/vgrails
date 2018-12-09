import layout from "../views/layout";
import ResizeArea from "../core/resizearea";
import {addCss, create} from "../webix/html";
import {protoUI} from "../ui/core";
import {isArray} from "../webix/helpers";


const api = {
	name:"panel",
	$init:function(config){
		if (config.header && config.body){
			var header = config.header;
			if (typeof header !== "object")
				header = { template:config.header, type:"header", css:"webix_header" };
			config.body = [ header, config.body ];
		}

		addCss(this.$view, "panel_drag_view");
		this.$ready.push(this._init_drag_area);
	},
	_init_drag_area:function(){
		var childs = this.getChildViews();
		var parent = childs.length === 1 ? this : childs[1];

		if (this._settings.icon){
			var drag = create("div", { "class":"panel_icon" }, "<span class='webix_icon "+this._settings.icon+" panel_icon_span'></span>");
			if (parent != this)
				parent.$view.style.position = "relative";
			parent.$view.appendChild(drag);
		}
	},
	body_setter:function(value){
		return this.rows_setter(isArray(value) ? value:[value]);
	},
	$resizeEnd:function(pos){
		var parent = this.getParentView();
		if (parent && parent._getPosFromCoords){
			var end = parent._getPosFromCoords(pos.x, pos.y);

			var dx = Math.max(end.x, 1);
			var dy = Math.max(end.y, 1);
			parent.moveView(this._settings.id, { dx:dx, dy:dy });
		}
	},
	$resizeMove:function(pos){
		var parent = this.getParentView();
		if (parent && parent._getPosFromCoords){
			var fx = parent._getPosFromCoords(pos.x, pos.y);
			pos.x = fx.width*fx.x+fx.margin*(fx.x-1);
			pos.y = fx.height*fx.y+fx.margin*(fx.y-1);
		}
	}
};


const view = protoUI(api,  layout.view, ResizeArea);
export default {api, view};