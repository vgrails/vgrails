import chart from "../views/chart";
import {create, preventEvent, pos as getPos, addCss, offset, removeCss} from "../webix/html";
import {protoUI} from "../ui/core";
import env from "../webix/env";
import {toNode, bind, extend} from "../webix/helpers";
import i18n from "../webix/i18n";
import {_event, event, eventRemove} from "../webix/htmlevents";
import {assert} from "../webix/debug";

import state from "../core/state";


const api = {
	name:"rangechart",
	$init:function(){
		this.attachEvent("onAfterRender", this._init_frame);
		this._set_full_range();
	},
	_init_frame:function(){
		assert((this._settings.type.indexOf("pie") ===-1 && this._settings.type !=="radar" &&
			this._settings.type !=="donut"), "Not suppored chart type");
		
		if(!this._map._areas.length || this._frame){
			this._setHandle(true);
			return;
		}

		this._setMap();
		this._item_radius = (this._map._areas[0].points[2]-this._map._areas[0].points[0])/2;
		this._rHandle = create("div", {"class":"webix_chart_resizer right", "tabindex":"0", "role":"button", "aria-label":i18n.aria.resizeChart });
		this._lHandle = create("div", {"class":"webix_chart_resizer left", "tabindex":"0", "role":"button", "aria-label":i18n.aria.resizeChart });
		this._frame = create("div",{ "class":"webix_chart_frame"});

		this._viewobj.appendChild(this._lHandle);
		this._viewobj.appendChild(this._frame);
		this._viewobj.appendChild(this._rHandle);

		this._setHandle();

		_event(this._rHandle, env.mouse.down, this._frDown, {bind:this});
		_event(this._lHandle, env.mouse.down, this._frDown, {bind:this});
		_event(this._frame, env.mouse.down, this._frDown, {bind:this});

		_event(toNode(this._rHandle), "keydown", this._keyShift, {bind:this});
		_event(toNode(this._lHandle), "keydown", this._keyShift, {bind:this});

		if (this._value)
			this._settings.range = this._set_full_range(this._value);

		this._refresh_range();
		this.callEvent("onAfterRangeChange", [this._value]);
		this.data.attachEvent("onStoreUpdated", bind(this._refresh_range, this));
	},
	$setSize:function(x, y){
		if (chart.api.$setSize.call(this, x, y)){
			this._setMap();
			this._refresh_range();
		}
	},
	_setHandle:function(update){
		if(this._rHandle && !this._handle_radius){
			this._handle_radius = this._rHandle.clientWidth/2;
			if(update)
				this._refresh_range();
		}
	},
	_setMap:function(){
		var bounds = this._getChartBounds(this._content_width,this._content_height);
		this._mapStart = bounds.start;
		this._mapEnd = bounds.end;
	},
	removeAllSeries: function(){
		this._frame = this._rHandle = this._lHandle = null;
		chart.api.removeAllSeries.apply(this,arguments);
	},
	_keyShift:function(e){
		var code = e.which || e.keyCode;
		if(code === 37 || code ===39){
			preventEvent(e);
			
			var index = e.target.className.indexOf("right")!==-1?"eindex":"sindex";
			var id = e.target.className.indexOf("right")!==-1?"end":"start";
			var range = this._value;
			
			range[index] = range[index] + (code === 37?-1:1);
			if(this._map._areas[range[index]]){
				range[id] = this._get_id_by_index(range[index]);
				this.setFrameRange(range);
			}
		}
	},
	_frDown:function(e){
		if(e.target.className.indexOf("webix_chart_resizer") !==-1)
			this._activeHandle = e.target;
		else if(this._map._areas.length){
			var spos = this._map._areas[this._value.sindex].points[2]-this._item_radius;
			var epos = this._map._areas[this._value.eindex].points[2]-this._item_radius;

			this._activeFrame = {
				ex:getPos(e).x,
				fx:spos+this._mapStart.x,
				fw:epos-spos
			};
		}

		addCss(this._viewobj,"webix_noselect webix_wresize_cursor");

		this._frClear();
		this._resizeHandlerMove = event(document.body, env.mouse.move, this._frMove, {bind:this});
		this._resizeHandlerUp   = event(document.body, env.mouse.up, this._frUp, {bind:this});
	},
	_frClear:function(){
		if(state._events[this._resizeHandlerMove]){
			eventRemove(this._resizeHandlerMove);
			eventRemove(this._resizeHandlerUp);
		}
	},
	_frMove:function(e){
		if(this._activeHandle){
			var pos_x = getPos(e).x-offset(this.$view).x;
			if(pos_x>=this._mapStart.x && pos_x<=this._mapEnd.x){
				if(this._activeHandle.className.indexOf("left")!==-1){
					if(pos_x<this._rHandle.offsetLeft){
						this._activeHandle.style.left = pos_x-this._handle_radius+"px";
						this._frame.style.left = pos_x+"px";
						this._frame.style.width = this._rHandle.offsetLeft-this._lHandle.offsetLeft-1+"px";
					}
				}
				else if(pos_x>this._lHandle.offsetLeft+this._handle_radius){
					this._activeHandle.style.left = pos_x-this._handle_radius+"px";
					this._frame.style.width = this._rHandle.offsetLeft-this._lHandle.offsetLeft-1+"px";
				}
			}
		}
		else if(this._activeFrame){
			var shift = getPos(e).x - this._activeFrame.ex;
			var lx = this._activeFrame.fx+shift;
			var rx = lx+this._activeFrame.fw;

			if(this._mapStart.x<=lx && this._mapEnd.x>=rx){
				extend(this._activeFrame, {lx:lx, rx:rx}, true);
				
				this._lHandle.style.left = lx-this._handle_radius+"px";
				this._rHandle.style.left = rx-this._handle_radius+"px";
				this._frame.style.left = lx+"px";
			}
		}
	},
	_frUp:function(e){
		this._frClear();

		removeCss(this._viewobj,"webix_noselect");
		removeCss(this._viewobj,"webix_wresize_cursor");

		if(!this.count()) return;
		
		if(this._activeHandle){
			var pos_x = env.touch?e.changedTouches[0].pageX:getPos(e).x;
			pos_x -= offset(this.$view).x+this._mapStart.x;

			var ind = this._get_index_by_pos(pos_x);
			var id = this._get_id_by_index(ind);

			if (this._activeHandle === this._lHandle){
				if(ind >= this._value.eindex){
					ind = this._value.eindex;
					id = this._get_id_by_index(ind);
				}
				this._value.start = id;
				this._value.sindex = ind;
			} else{
				if(ind <= this._value.sindex){
					ind = this._value.sindex;
					id = this._get_id_by_index(ind);
				}
				this._value.end = id;
				this._value.eindex = ind;
			}

			this._activeHandle = null;
		}
		else if(this._activeFrame && this._activeFrame.lx){
			var lind = this._value.sindex = this._get_index_by_pos(this._activeFrame.lx-this._mapStart.x);
			var rind = this._value.eindex = this._get_index_by_pos(this._activeFrame.rx-this._mapStart.x);
			this._value.start = this._get_id_by_index(lind);
			this._value.end = this._get_id_by_index(rind);
			
			this._activeFrame = null;
		}

		this._refresh_range();
		this.callEvent("onAfterRangeChange", [this._value.start, this._value.end]);
	},
	_get_id_by_index:function(ind){
		if (ind >= this.data.order.length)
			ind = this.data.order.length-1;
		return this.getItem(this.data.order[ind])[this._settings.frameId || "id"];
	},
	_get_index_by_pos:function(pos){
		var areas = this._map._areas;
		for(var i = 0; i<areas.length; i++)
			if(pos <= areas[i].points[2]-this._item_radius)
				return i;

		return areas.length-1;
	},
	_get_frame_index:function(value){
		var key = this._settings.frameId || "id";
		
		for (var i=0; i<this.data.order.length; i++)
			if (this.getItem(this.data.order[i])[key]==value)
				return i;

		return -1;
	},
	_set_full_range:function(value){
		if(!value)
			value =  { start:0, end:0, sindex:0, eindex: 0 };
		else{
			if(value.start) value.sindex = this._get_frame_index(value.start);
			if(value.end) value.eindex = this._get_frame_index(value.end);
			value.start = value.start || this._get_id_by_index(value.sindex);
			value.end = value.end ||  this._get_id_by_index(value.eindex);
		}
		this._value = value;
	},
	range_setter:function(value){
		this._set_full_range(value);
		return this._value;
	},
	getFrameData:function(){
		var res = [];
		for (var i=this._value.sindex; i<=this._value.eindex; i++){
			var item = this.getItem(this.data.order[i]);
			if(item) res.push(item);
		}
		return res;
	},
	setFrameRange:function(range){
		this._set_full_range(range);
		this._refresh_range();

		this.callEvent("onAfterRangeChange", [range]);
	},
	_refresh_range:function(){
		if(!this._map) return;
		var areas = this._map._areas;
		
		if (areas.length){
			var	sx = areas[this._value.sindex].points[0] + this._mapStart.x+this._item_radius-1;
			var ex = areas[this._value.eindex].points[0] + this._mapStart.x+this._item_radius-1;

			this._lHandle.style.left = sx-this._handle_radius+"px";
			this._rHandle.style.left = ex-this._handle_radius+"px";
			this._frame.style.left = sx+"px";
			this._frame.style.width = (ex-sx)+"px";

			this._settings.range = this._value;
		}
	},
	getFrameRange:function(){
		return this._settings.range;
	}
};


const view = protoUI(api,  chart.view);
export default {api, view};