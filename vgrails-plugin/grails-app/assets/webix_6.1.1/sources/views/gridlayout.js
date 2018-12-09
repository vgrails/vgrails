import abslayout from "../views/abslayout";
import {protoUI, $$} from "../ui/core";
import {isUndefined, extend, copy} from "../webix/helpers";
import baselayout from "../views/baselayout";
import baseview from "../views/baseview";


const api = {
	name:"gridlayout",
	defaults:{
		autoplace:true,
		gridColumns:2,
		gridRows:2,
		margin:10,
		padding:10
	},
	gridRows_setter:function(value){
		return (this._actual_rows = value);
	},
	_parse_cells:function(){
		for (var i = 0; i < this._collection.length; i++) {
			this._collection[i]._inner = {};
		}
		baselayout.api._parse_cells.call(this, this._collection);
	},
	removeView:function(id){
		abslayout.api.removeView.call(this, id);
		this._do_compact();
		this.callEvent("onChange", []);
	},
	_check_default_pos:function(config){
		config.dx = config.dx || 1;
		config.dy = config.dy || 1;

		if (isUndefined(config.y) || isUndefined(config.x)){
			var matrix = this._buildMatrix();
			for (var y=0; y<this._actual_rows; y++)
				for (var x=0; x<this._settings.gridColumns; x++){
					if (!matrix[x][y] && this._isFree(matrix, x, y, x+config.dx, y+config.dy)){
						config.x = x;
						config.y = y;
						return;
					}
				}
			config.x = 0;
			config.y = this._actual_rows;
		}

		//ensure that view is not wider than grid
		var exceed = config.x+config.dx - this._settings.gridColumns;
		if (exceed > 0)
			config.dx -= exceed;
	},
	_replace:function(new_view){
		this._check_default_pos(new_view.config);
		this._cells.push(new_view);

		this.$view.appendChild(new_view._viewobj);

		this._reserveSpace(new_view.config, new_view.config.id);
		this._do_compact(true);

		if (!this._silent)
			this.callEvent("onChange", []);
	},
	_isFree:function(matrix, sx,sy, dx, dy){
		for (var x=sx; x<dx; x++)
			for (var y=sy; y<dy; y++){
				if (!matrix[x] || matrix[x][y])
					return false;
			}
		return true;
	},
	_markMatrix:function(matrix, sub, id){
		for (var x=0; x<sub.dx; x++)
			for (var y=0; y<sub.dy; y++)
				matrix[x+sub.x][y+sub.y] = id;
	},
	_canMoveRight:function(matrix, obj, sub){
		var mx = this._settings.gridColumns;
		for (var x=obj.x+obj.dx; (x+sub.dx)<=mx; x++){
			if (this._isFree(matrix, x, sub.y, x+sub.dx, sub.y+sub.dy))
				return x-sub.x;
		}
		return 0;
	},
	_canMoveLeft:function(matrix, obj, sub){
		for (var x=obj.x-sub.dx; x>=0; x--){
			if (this._isFree(matrix, x, sub.y, x+sub.dx, sub.y+sub.dy))
				return sub.x-x;
		}
		return 0;
	},
	_canMoveTop:function(matrix, obj, sub){
		for (var y=obj.y-sub.dy; y>=0; y--){
			if (this._isFree(matrix, sub.x, y, sub.x+sub.dx, y+sub.dy))
				return sub.y-y;
		}
		return 0;
	},
	_buildMatrix:function(id){
		var m = [];
		for (var x=0; x<this._settings.gridColumns; x++)
			m[x] = [];
		for (var i=0; i<this._cells.length; i++){
			var sub = this._cells[i].config;
			if (sub.id === id || sub.hidden) continue;

			this._markMatrix(m, sub, sub.id);
		}
		return m;
	},
	_do_compact:function(force){
		//do not correct places or grid, if autoplace disabled
		if (this._compact() || force)
			this._apply_new_grid();
	},
	_compact:function(){
		if (!this._settings.autoplace) return false;

		var mx = this._settings.gridColumns;
		var my = this._actual_rows;
		var matrix = this._buildMatrix();
		var compacted = false;

		top: for (var y=my-1; y>=0; y--){
			for (var x=mx-1; x>=0; x--)
				if (matrix[x][y])
					continue top;

			compacted = true;
			for (var i=0; i<this._cells.length; i++){
				var sub = this._cells[i].config;
				if (!sub.hidden && sub.y >= y){
					sub.y -= 1;
				}
			}
		}

		return compacted;
	},
	_reserveSpace:function(conf, id){
		//prevent x-overflow
		conf.x -= Math.max(0, conf.x + conf.dx - this._settings.gridColumns);

		//do not move other cells in non-compact mode
		if (!this._settings.autoplace){
			conf.y -= Math.max(0, conf.y + conf.dy - this._settings.gridRows);
			return;
		}

		var cross = [];
		var matrix = this._buildMatrix(id);

		for (let i=0; i<this._cells.length; i++){
			let sub = this._cells[i].config;
			if (sub.id === id || sub.hidden) continue;

			//console.log(sub.y +"<"+ (conf.y+conf.dy), (sub.y+sub.dy) + ">" +conf.y , sub.x +"<"+ (conf.x+conf.dx), (sub.x+sub.dx) + ">" + conf.x);
			if (sub.y < conf.y+conf.dy && sub.y+sub.dy > conf.y &&
				sub.x < conf.x+conf.dx && sub.x+sub.dx > conf.x ){
				//intersection
				cross.push(sub);
			}
		}

		var next = [];
		for (let i=0; i<cross.length; i++){
			// check right
			let sub = cross[i];
			this._markMatrix(matrix, sub, 0);

			var right = this._canMoveRight(matrix, conf, sub);
			if (right){
				sub.x += right;
			} else {
				// check left
				var left = this._canMoveLeft(matrix, conf, sub);
				if (left){
					sub.x -= left;
				} else {
					//check top
					var top = this._canMoveTop(matrix, conf, sub);
					if (top){
						sub.y -= top;
					} else {
						//move bottom
						sub.y = conf.y + conf.dy;
						next.push(sub);
					}
				}
			}

			this._markMatrix(matrix, sub, sub.id);
		}
		
		//when moving bottom, we need to iterate one more time, to resolve new intersections
		for (let i=0; i<next.length; i++){
			//console.log("after correction for "+next[i].id);
			this._reserveSpace(next[i], next[i].id);
		}
	},
	_apply_new_grid:function(){
		var rows = this._settings.gridRows;
		for (var i=0; i<this._cells.length; i++){
			var cell = this._cells[i].config;
			if (!cell.hidden)
				rows = Math.max(rows, cell.y + cell.dy);
		}

		if (this._actual_rows != rows){
			this._actual_rows = rows;
			this.resize();
		}
		this._set_child_size();
	},
	moveView:function(id, obj){
		obj = extend($$(id).config, obj, true);
		this._reserveSpace(obj, id);
		this._do_compact(true);
		this.callEvent("onChange", []);
	},
	serialize:function(serializer){
		var state = [];
		for (var i=0; i<this._cells.length; i++){
			if (serializer){
				state.push(serializer.call(this, this._cells[i]));
			} else {
				var conf = this._cells[i].config;
				state.push({ id:conf.id, name:conf.name, x:conf.x, y:conf.y, dx:conf.dx, dy:conf.dy });
			}
		}
		return state;
	},
	clearAll:function(){
		for (var i=0; i < this._cells.length; i++)
			this._cells[i].destructor();
		this._cells = [];
		this.callEvent("onChange", []);
	},
	restore:function(state, factory){
		factory = factory || this._settings.factory;
		state = copy(state);

		this._silent = true;
		var ids = {};

		for (let i = 0; i < state.length; i++) {
			var conf = state[i];
			var view = $$(conf.id);
			var id;
			if (view){
				extend(view.config, conf, true);
				id = view.config.id;
			} else {
				view = factory.call(this, conf);
				id = this.addView(view);
			}
			ids[id] = 1;
		}
		for (let i = this._cells.length-1; i >= 0; i--) {
			if (!ids[this._cells[i].config.id]){
				this._cells[i].destructor();
				this._cells.splice(i, 1);
			}
		}
		
		this._apply_new_grid();
		this._silent = false;
	},
	$getSize:function(){
		var self_size = baseview.api.$getSize.call(this, 0, 0);

		for (var i=0; i<this._cells.length; i++)
			this._cells[i].$getSize(0,0);

		var width = this._settings.cellWidth;
		var height = this._settings.cellHeight;
		var box = this._getActualSize(0,0, this._settings.gridColumns, this._actual_rows);

		if (width)
			self_size[0] = box.dx+box.x*2;
		if (height)
			self_size[2] = box.dy+box.y*2;

		return self_size;
	},
	_getActualSize:function(x,y,w,h){
		var margin = this._settings.margin;
		var paddingX = this._settings.paddingX || this._settings.padding;
		var paddingY = this._settings.paddingY || this._settings.padding;

		var dx = this._settings.cellWidth;
		if (!dx) dx = (this.$width - 2 * paddingX + margin) / this._settings.gridColumns - margin;
		var dy = this._settings.cellHeight;
		if (!dy) dy = (this.$height - 2 * paddingY + margin) / this._actual_rows - margin;

		var left = paddingX+(dx+margin)*x;
		var top = paddingY+(dy+margin)*y;
		var width = Math.ceil(dx+(dx+margin)*(w-1));
		var height = Math.ceil(dy+(dy+margin)*(h-1));

		return { x:left, y:top, dx:width, dy:height };
	},
	_set_child_size:function(){
		for (var i=0; i<this._cells.length; i++){
			var view = this._cells[i];
			var conf = view._settings;

			var size = this._getActualSize(conf.x, conf.y, conf.dx, conf.dy);			
			view.$getSize(0,0); //need to be called before $setSize
			view.$setSize(size.dx, size.dy);

			var node = view.$view;
			node.style.left = size.x + "px";
			node.style.top = size.y + "px";
		}
	}
};


const view = protoUI(api,  abslayout.view);
export default {api, view};