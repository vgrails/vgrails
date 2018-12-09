import {addStyle, create, remove} from "../../webix/html";
import template from "../../webix/template";
import {once, bind, copy} from "../../webix/helpers";
import {ui, $$} from "../../ui/core";


const Mixin = {
	subrow_setter:function(value){
		if (value){
			this._init_subrow_once();
			this._settings.fixedRowHeight = false;
			return template(value);
		}
		return false;
	},
	subview_setter:function(value){
		if (value)
			this._settings.subrow = this.subrow_setter("<div></div>");
		return value;
	},
	defaults:{
		subRowHeight:35
	},
	_refresh_sub_all: function(){
		this.data.each(function(obj){
			if (obj)
				obj.$sub = this._settings.subrow(obj, this.type);
		}, this);

		this._resize_sub_all();
	},
	_resize_sub_all: function(resize){
		if (this._settings.subRowHeight === "auto" && this._content_width)
			this._adjustSubRowHeight();
		if (resize && this._settings.subview){
			for (var key in this._subViewStorage){
				var subview = $$(this._subViewStorage[key]);
				if (!subview._settings.hidden)
					subview.adjust();
			}
		}
	},
	_refresh_sub_one:function(id){
		var obj = this.getItem(id);
		obj.$sub = this._settings.subrow(obj, this.type);
		
		if (this._settings.subRowHeight === "auto")
			this._adjustSubRowHeight(obj.id, obj.$sub);
	},
	$init:function(){
		this._init_subrow_once = once(function(){
			var css = "#"+this._top_id +" .webix_cell.webix_dtable_subview { line-height:normal;}";
			//if initial fixedRowHeight is true, preserve white-space for non sub cells
			if(this._settings.fixedRowHeight)
				css += "#"+this._top_id +" .webix_column .webix_cell { white-space: nowrap;}";

			addStyle(css);
			
			this._subViewStorage = {};
			this.attachEvent("onSubViewRender", this._render_sub_view);
			this.data.attachEvent("onStoreUpdated", bind(function(id, data, mode){
				if (!id)
					this._refresh_sub_all();
				else if (mode == "update" || mode == "add")
					this._refresh_sub_one(id);
			}, this));
			this.attachEvent("onResize", function(w,h,wo){
				if (wo != w)
					this._resize_sub_all(true);
			});
		});

		this.type.subrow = function(obj){
			if (obj.$sub){
				if (obj.$subopen)
					return "<div class='webix_tree_open webix_sub_open'></div>";
				else
					return "<div class='webix_tree_close webix_sub_close'></div>";
			} else
				return "<div class='webix_tree_none'></div>";
		};
		this.on_click.webix_sub_open = function(e, id){
			this.closeSub(id);
			return false;
		};
		this.on_click.webix_sub_close = function(e, id){
			this.openSub(id);
			return false;
		};
	},
	openSub:function(id){
		var obj = this.getItem(id);
		if (obj.$subopen) return;

		obj.$row = this._settings.subrow;
		obj.$subHeight = (obj.$subHeight || this._settings.subRowHeight);
		obj.$subopen = true;

		var sub = this._subViewStorage[obj.$subContent];
		if (sub)
			sub.repaintMe = true;

		this.refresh(id);
		this.callEvent("onSubViewOpen", [id]);
	},
	getSubView:function(id){
		var obj = this.getItem(id);
		if (obj){
			var sub = this._subViewStorage[obj.$subContent];
			if (sub)
				return $$(sub);
		}

		return null;
	},
	resizeSubView:function(id){
		var view = this.getSubView(id);
		if (view)
			this._resizeSubView( this.getItem(id), view);
	},
	_resizeSubView:function(obj, view){
		var height = view.$getSize(0,0)[2];
		var eheight = obj.$subHeight || this._settings.subRowHeight;
		var delta = Math.abs(height - (eheight || 0));
		if (delta > 2){
			obj.$subHeight = height;
			this.refresh(obj.id);
		}
	},
	_checkSubWidth: function(view){
		var width = view.$width;
		// if layout
		if(view._layout_sizes){
			var number = view._cells.length-view._hiddencells;
			if (view._vertical_orientation)
				width -= view._paddingX*2+2;
			else
				width -= view._margin*(number-1)+view._paddingX*2+number*2;
		}
		return width > 0;
	},
	_render_sub_view:function(obj, row){
		var sub = this._subViewStorage[obj.$subContent], view;
		if (sub){
			row.firstChild.appendChild(sub);
			view = $$(obj.$subContent);
			if (!this._checkSubWidth(view))
				view.adjust();
			if (sub.repaintMe){
				delete sub.repaintMe;
				view.config.hidden = false;
				view._render_hidden_views();
			}
		} else {
			var subview = this._settings.subview;
			var config; 

			if (typeof subview === "function"){
				view = subview.call(this, obj, row.firstChild);
			} else {
				config = copy(subview);
				config.$scope = this.$scope;
				view = ui(config, row.firstChild);
			}

			view.getMasterView = bind(function(){ return this; }, this);
			obj.$subContent = view.config.id;
			this._subViewStorage[obj.$subContent] = view.$view;
			//special case, datatable inside of datatable
			view.attachEvent("onResize", bind(function(w,h, wo, ho){
				if(h && h != ho) this.refresh(obj.id);
			}, this));

			this.callEvent("onSubViewCreate", [view, obj]);
		}
		this._resizeSubView(obj, (view || $$(sub)));
	},
	_destroy_sub_view:function(id){
		var obj = this.getItem(id);
		var div = this._subViewStorage[obj.$subContent];
		if (div){
			delete obj.$subContent;
			var view = $$(div);
			if (view && view != this)
				view.destructor();
		}
	},
	_adjustSubRowHeight:function(id, text){
		var d = create("DIV",{"class":"webix_measure_size webix_cell webix_dtable_subrow"}, "");
		d.style.cssText = "width:"+this._content_width+"px; height:auto; visibility:hidden; position:absolute; top:0px; left:0px; overflow:hidden;";
		this.$view.appendChild(d);

		this.data.each(function(obj){
			if (obj && !id || obj.id == id && obj.$sub){
				d.innerHTML = text || this._settings.subrow(obj, this.type);
				obj.$subHeight = d.offsetHeight;
			}
		}, this);

		d = remove(d);
	},
	closeSub:function(id){
		var obj = this.getItem(id);
		if (!obj.$subopen) return;

		obj.$row = false;
		obj.$subopen = false;

		var sub = this._subViewStorage[obj.$subContent];
		if (sub)
			$$(sub).config.hidden = true;

		this.refresh(id);
		this.callEvent("onSubViewClose", [id]);
	}
};

export default Mixin;