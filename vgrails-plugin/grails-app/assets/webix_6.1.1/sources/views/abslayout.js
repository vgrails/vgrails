import baselayout from "../views/baselayout";
import {protoUI} from "../ui/core";
import baseview from "../views/baseview";
import {debug_size_box_start, debug_size_box_end} from "../webix/debug";


const api = {
	name:"abslayout",
	$init:function(){
		this.$view.className += " webix_abslayout";
		delete this.rows_setter;
		delete this.cols_setter;
		this._collection = [];
	},
	cells_setter:function(cells){
		this._collection = cells;
	},
	_parse_cells:function(){
		baselayout.api._parse_cells.call(this, this._collection);
	},
	$getSize:function(){
		var self_size = baseview.api.$getSize.call(this, 0, 0);
		var sub = null;

		for (var i=0; i<this._cells.length; i++)
			if (this._cells[i]._settings.relative)
				sub = this._cells[i].$getSize(0,0);

		if (sub){
			//use child settings if layout's one was not defined
			if (self_size[1] >= 100000) self_size[1]=0;
			if (self_size[3] >= 100000) self_size[3]=0;

			self_size[0] = Math.max(self_size[0], sub[0]);
			self_size[1] = Math.max(self_size[1], sub[1]);
			self_size[2] = Math.max(self_size[2], sub[2]);
			self_size[3] = Math.max(self_size[3], sub[3]);
		}

		return self_size;
	},
	$setSize:function(x,y){
		this._layout_sizes = [x,y];
		if (DEBUG) debug_size_box_start(this);

		baseview.api.$setSize.call(this,x,y);
		this._set_child_size(x,y);

		if (DEBUG) debug_size_box_end(this, [x,y]);
	},
	_set_child_size:function(x,y){
		for (var i=0; i<this._cells.length; i++){
			var view = this._cells[i];
			var conf = view._settings;

			var sizes = view.$getSize(0,0);
			if (conf.relative){
				conf.left = conf.top = 0;
				view.$setSize(x,y);
			} else {
				view.$setSize(sizes[0], sizes[2]);
			}

			var node = view.$view;
			var options = ["left", "right", "top", "bottom"];

			for (var j = 0; j < options.length; j++) {
				var key = options[j];
				if (key in conf)
					node.style[key] = conf[key] + "px";
			}
		}
	}
};


const view = protoUI(api,  baselayout.view);
export default {api, view};