import {create, _getClassName, offset, preventEvent} from "../../webix/html";
import {copy, extend, uid} from "../../webix/helpers";
import {_event} from "../../webix/htmlevents";


const Mixin = {
	_init_areaselect: function(){
		this._arSelCheckKeys = true;
		this._areaSelStorage = {};
		this.define("select","area");
		this.attachEvent("onAfterScroll", function(){
			this.refreshSelectArea();
		});
		this.attachEvent("onAfterRender", function(){
			this.refreshSelectArea();
		});
		this.attachEvent("onBeforeColumnHide", function(column){
			this._areaSelHiddenIndex = this.getColumnIndex(column);
		});
		this.attachEvent("onAfterColumnHide", function(){
			this._excludeColumnFromAreas(this._areaSelHiddenIndex);
		});
		this.attachEvent("onAfterRender", function(){
			this._setTabindex();
		});

		this._bs_do_select = function(start, end, stopped, ev){
			if(start.row && end.row){
				if(stopped){
					this.addSelectArea(start, end, true);
					this._arSelCheckKeys = true;
					return false;
				}
				else{
					if(this.callEvent("onAreaDrag",[start, end, ev])){
						if(!this._activeAreaSName && this._arSelCheckKeys && !(this._settings.multiselect && ev && ev.ctrlKey) ){
							this.removeSelectArea();
							this._arSelCheckKeys = false;
						}
					}
					else
						return false;
				}
			}
		};
		this.attachEvent("onBeforeAreaAdd", this._span_correct_range);
		_event(this._body, "mousedown", this._ars_down, {bind:this});
	},
	_block_sel_flag: true,
	_excludeColumnFromAreas: function(index){
		var areas = this._areaSelStorage;
		for(var a in areas){
			var area = areas[a];
			if(this.getColumnIndex(area.start.column) <0 ){
				if(area.start.column == area.end.column)
					this.removeSelectArea(area.name);
				else{
					let id = this.columnId(index+1);
					if(id)
						this._updateSelectArea(area.name,{row: area.start.row,column: id},null);
				}
			}
			else if(this.getColumnIndex(area.end.column) <0 ){
				let id = this.columnId(index-1);
				if(id)
					this._updateSelectArea(area.name,null,{row: area.end.row,column: id});
			}
		}
	},
	_extendAreaRange: function(id, area, mode, details){
		var sci, eci, sri, eri, ci, ri, iri, ici;
		
		if (area){
			sci = this.getColumnIndex(area.start.column);
			eci = this.getColumnIndex(area.end.column);
			sri = this.getIndexById(area.start.row);
			eri = this.getIndexById(area.end.row);
			ci = this.getColumnIndex(id.column);
			ri = this.getIndexById(id.row);
			//start cell of area
			iri = this.getIndexById(area.init.row);
			ici = this.getColumnIndex(area.init.column);

			if(sci > ci || mode == "left"){
				if(mode === "left" && details.ctrl) {
					sci = this._extendAreaToData(iri, sci, mode);
					eci = ici;
				}	
				else if(mode === "left" && eci > ici) eci--;
				else sci = ci;
			}
			else if(eci <= ci || mode == "right"){
				if(mode == "right" && details.ctrl){
					eci = this._extendAreaToData(iri, eci, mode);
					sci = ici;
				}
				else if(mode == "right" && sci <ici) sci ++;
				else eci = ci;
			}

			if(sri > ri || mode =="up"){
				if(mode =="up" && details.ctrl) {
					sri = this._extendAreaToData(sri, ici, mode);
					eri = iri;
				}
				else if(mode =="up" && eri > iri ) eri--;
				else sri = ri;
			}
			else if(eri < ri || mode =="down"){
				if(mode == "down" && details.ctrl) {
					eri = this._extendAreaToData(eri, ici, mode);
					sri = iri;
				}
				else if(mode == "down" && sri <iri) sri++;
				else eri = ri;
			}

			var start = { row: this.getIdByIndex(sri), column: this.columnId(sci) };
			var end = { row: this.getIdByIndex(eri), column: this.columnId(eci) };

			if(this.callEvent("onBeforeBlockSelect", [start, end, true])){
				this._updateSelectArea(area.name, start, end);
				this.callEvent("onSelectChange", []);
				this.callEvent("onAfterBlockSelect", [start, end]);
			}
		}
	},
	_extendAreaToData:function(rind, cind, mode){
		var columns = this.config.columns;
		var order = this.data.order;
		var item = this.data.pull[order[rind]];
		var column = columns[cind].id;
		var res = 0;

		//iterate columns
		if(mode == "right"){
			for(let i = cind+1; i<columns.length; i++){
				if(item[columns[i].id]){ res = i; break; }
				else res = i;
			}
		}
		else if (mode =="left"){
			for(let i = cind-1; i>=0; i--){ //check ss
				if(item[columns[i].id]){ res = i; break;}
			}
		}
		//iterate data	
		else if (mode == "down"){
			for(let i = rind+1; i<order.length; i++){
				if(this.getItem(order[i])[column]){ res = i;break;}
				else res = i;
			}
		}
		else if(mode =="up"){
			for(let i = rind-1; i>=0; i--){
				if(this.getItem(order[i])[column]){ res = i;break;}
			}
		}
		return res;
	},
	_updateSelectArea: function(name, start, end, bsUpdate){
		var area = this._areaSelStorage[name];
		if(!area)
			return false;
		var old = copy(area);
		var range = { start:  start||area.start, end: end||area.end};
		this._span_correct_range(range);
		extend(area, range, true);

		this.refreshSelectArea();
		this._setTabindex(old);
		if(bsUpdate)
			this.callEvent("onSelectChange", []);
	},
	areaselect_setter:function(value){
		if(value){
			this._init_areaselect();
			this._init_areaselect = function(){};
		}
		this.define("blockselect",value);
		return value;
	},
	addSelectArea: function(start, end, preserve, name, css, handle){
		var i0, i1, j0, j1, temp;
		i0 = this.getIndexById(start.row);
		i1 = this.getIndexById(end.row);

		j0 = this.getColumnIndex(start.column);
		j1 = this.getColumnIndex(end.column);


		if (i0>i1){
			temp = i0;
			i0 = i1;
			i1 = temp;
		}

		if (j0>j1){
			temp = j0;
			j0 = j1;
			j1 = temp;
		}

		name = name || this._activeAreaSName || uid();

		this._activeAreaSName= null;

		var area = {
			start: { row: this.getIdByIndex(i0), column: this.columnId(j0)},
			end:{ row: this.getIdByIndex(i1), column: this.columnId(j1)}
		};

		if(css)
			area.css = css;
		if(handle || handle === false)
			area.handle = handle;

		if(this._areaSelStorage[name]){
			return this._updateSelectArea(name,area.start,area.end, true);
		}
		else{
			area.handle = true;
		}

		area.name = name;

		area.init = area.start;

		if(this.callEvent("onBeforeAreaAdd",[area])){
			this._lastDefArea = name;
			if(!preserve)
				this.removeSelectArea();
			this._areaSelStorage[area.name] = area;
			this._selected_areas.push(area);
			this.refreshSelectArea();
			this._setTabindex();

			this.callEvent("onAfterAreaAdd",[area]);
			this.callEvent("onSelectChange",[]);
		}
	},
	_renderSelectAreaBox: function(){
		var box = create("DIV");
		box.className = "webix_area_selection_layer";
		box.style.top = this._render_scroll_shift+"px";
		return box;
	},
	refreshSelectArea: function(){
		var xr, yr, name, range,
			r0, r1,
			center = null, left=null, right = null,
			prerender = this._settings.prerender;

		if(!this._render_full_rows)
			return;
		// indexes of visible cols
		xr = this._get_x_range(prerender);
		// indexes of visible rows
		yr = this._get_y_range(prerender === true);

		if (!this._rselect_box){
			this._rselect_box = this._renderSelectAreaBox();
			this._body.childNodes[1].appendChild(this._rselect_box);
			this._rselect_box_left = this._renderSelectAreaBox();
			this._body.childNodes[0].appendChild(this._rselect_box_left);
			this._rselect_box_right = this._renderSelectAreaBox();
			this._body.childNodes[2].appendChild(this._rselect_box_right);
		}

		this._rselect_box.innerHTML = "";
		this._rselect_box_left.innerHTML = "";
		this._rselect_box_right.innerHTML = "";

		var leftSplit = this._settings.leftSplit;
		var rightSplit = this._settings.rightSplit;

		for(name in this._areaSelStorage){
			range = this._areaSelStorage[name];
			var ind = this._calcAreaSelectIndexes(range,xr,yr);
			if (ind === null){
				this.removeSelectArea(name);
				continue;
			}
			var startIndex = this.getColumnIndex(range.start.column);
			var endIndex = this.getColumnIndex(range.end.column);
			if(ind.r0 <= ind.r1){
				if(this._settings.topSplit && r0>=this._settings.topSplit && r1< this._render_scroll_top)
					return false;
				if(startIndex < leftSplit)
					left = this._getSelectAreaCellPositions(ind.r0, startIndex, ind.r1, Math.min(endIndex,leftSplit-1));
				if(ind.c0<=ind.c1)
					center = this._getSelectAreaCellPositions(ind.r0, ind.c0, ind.r1, ind.c1);
				if(rightSplit && endIndex >= this._rightSplit)
					right = this._getSelectAreaCellPositions(ind.r0, Math.max(startIndex,this._rightSplit), ind.r1, endIndex);

				if(left || center || right)
					this._setSelectAreaBorders(left,center,right, name, range.css, range.handle);
			}
		}
	},
	_calcAreaSelectIndexes: function(range, xr, yr){
		var r0, r1, c0, c1;

		var startIndex = this.getIndexById(range.start.row);
		var endIndex = this.getIndexById(range.end.row);

		var startColumn = this.getColumnIndex(range.start.column);
		var endColumn = this.getColumnIndex(range.end.column);

		//return null for broken select areas
		if (startColumn === -1 || endColumn === -1)
			return null;
		if (startIndex === -1 || endIndex === -1)
			return null;

		r1 = Math.min(yr[1],endIndex);
		if(this._settings.topSplit){
			r0 = startIndex;
			if(r0 >= this._settings.topSplit)
				r0 = Math.max(yr[0]-this._settings.topSplit,startIndex);
			if(r1 >= this._settings.topSplit){
				var endPos = this._cellPosition(this.getIdByIndex(endIndex),range.end.column);
				var splitPos = this._cellPosition(this.getIdByIndex(this._settings.topSplit-1),range.end.column);
				if(splitPos.top+splitPos.height > (endPos.top+endPos.height))
					r1 = this._settings.topSplit-1;
			}
		}
		else
			r0 = Math.max(yr[0],this.getIndexById(range.start.row));

		c0 = Math.max(xr[0],startColumn);
		c1 = Math.min(this._rightSplit?xr[1]-1:xr[1],endColumn);

		return {r0: r0, r1: r1, c0: c0, c1: c1};
	},
	_getSelectAreaCellPositions: function(i0, j0, i1, j1){
		var start = this._cellPosition(this.getIdByIndex(i0),this.columnId(j0));
		var end = this._cellPosition(this.getIdByIndex(i1),this.columnId(j1));
		return [start, end];
	},
	_setSelectAreaBorders: function(left, center, right, name,  css, handle){

		var handleBox, handlePos,
			area = this._areaSelStorage[name],
			offset = 0;

		if(this._settings.topSplit)
			offset = this._getTopSplitOffset(area.start, true);

		//include split in calcs
		var renderArea = function(parentNode, start, end, skipLeft, skipRight){
			var bName, height, width, top, left, hor,
				borders = {"top": 1, "right":1, "bottom": 1, "left": 1};
			if(skipLeft)
				delete borders.left;
			if(skipRight)
				delete borders.right;
			height = end.top - start.top + end.height-1;
			width = end.left - start.left + end.width;

			for(bName in borders){
				top = start.top + offset;

				if(bName == "bottom")
					top = end.top + end.height;

				left = start.left;
				if(bName == "right"){
					left = end.left+end.width;
				}

				hor = (bName=="top"||bName =="bottom");

				parentNode.appendChild(create("DIV", {
					"class":"webix_area_selection webix_area_selection_"+bName+(css?" "+css:"") ,
					"style": "left:"+left+"px;top:"+top+"px;"+(hor?("width:"+width+"px;"):("height:"+(height-offset)+"px;")),
					"webix_area_name": name
				}, ""));
				var elem = parentNode.lastChild;
				if(bName == "right")
					elem.style.left = left-elem.offsetWidth+"px";
				if(bName == "bottom")
					elem.style.top = top-elem.offsetHeight+"px";

				if(offset){ //correct top split
					if(bName == "top")
						elem.style.display = "none";
					if(end.height == offset && bName == "bottom")
						elem.style.display = "none";
				}
			}
		};

		if(right)
			renderArea(this._rselect_box_right, right[0], right[1],!!center,false);
		if(center)
			renderArea(this._rselect_box, center[0], center[1],!!left,!!right);
		if(left)
			renderArea(this._rselect_box_left, left[0], left[1],false,!!center);
		
		if(handle){
			handlePos = right?right[1]:(center?center[1]:left[1]);
			handleBox = right?this._rselect_box_right:(center?this._rselect_box:this._rselect_box_left);
			handleBox.appendChild(create("DIV", {
				"class":"webix_area_selection_handle"+(css?" "+css:"") ,
				"style": "left:"+(handlePos.left+handlePos.width)+"px;top:"+(handlePos.top +handlePos.height)+"px;",
				"webix_area_name": name
			}, ""));

			//correct top split
			if(offset && handlePos.height == offset)
				handleBox.lastChild.style.display = "none";
		}

	},
	_removeAreaNodes: function(name){
		if(name){
			var removeNodes = function(parentNode){
				var nodes = parentNode.childNodes;
				for(var i = nodes.length-1; i>=0; i--){
					if(nodes[i].getAttribute("webix_area_name") == name){
						parentNode.removeChild(nodes[i]);
					}
				}
			};
			removeNodes(this._rselect_box);
			removeNodes(this._rselect_box_left);
			removeNodes(this._rselect_box_right);
		}
	},
	removeSelectArea: function(name){
		if(name && this._areaSelStorage[name]){
			if(this.callEvent("onBeforeAreaRemove", [name])){
				this._setTabindex(copy(this._areaSelStorage[name]), true);
				delete this._areaSelStorage[name];
				this._removeAreaNodes(name);
				//reconstruct selected areas
				this._selected_areas = [];
				for (var key in this._areaSelStorage)
					this._selected_areas.push(this._areaSelStorage[key]);

				this.callEvent("onAfterAreaRemove", [name]);
			}
		}
		else {
			for(var n in this._areaSelStorage)
				this.removeSelectArea(n);
		}
	},
	_ars_down: function(e){
		var src = e.target||e.srcElement;
		var css = _getClassName(src);
		if(css && css.indexOf("webix_area_selection_handle")!=-1){
			var name = src.getAttribute("webix_area_name");
			this._activeAreaSName = name;
			// show block selection
			var area = this._areaSelStorage[name];
			var pos0 = this._cellPosition(area.start.row,area.start.column);
			var pos1 = this._cellPosition(area.end.row,area.end.column);

			var prerender = this._settings.prerender;

			var xCorrStart = this.getColumnIndex(area.start.column) < this._settings.leftSplit?0:this._left_width;
			var xCorrEnd = this.getColumnIndex(area.end.column) < this._settings.leftSplit?0:this._left_width;

			this._bs_ready = [pos0.left+1+xCorrStart-this._scrollLeft, pos0.top +1-(prerender?this._scrollTop:0),{
				row:area.start.row, column:area.start.column
			}];
			this._bs_position = offset(this._body);

			this._bs_start(e);
			this._bs_progress = [pos1.left+1+xCorrEnd-this._scrollLeft, pos1.top +1-(prerender?this._scrollTop:0)];
			this._bs_select(false, false, e);
			
			return preventEvent(e);
		}
	},
	getSelectArea: function(name){
		return this._areaSelStorage[name||this._lastDefArea];
	},
	getAllSelectAreas: function(){
		return this._areaSelStorage;
	},
	_span_correct_range: function(range, inner_call){
		var i, j, c0, c1, r0, r1,
			span, spanR0,spanC0,
			minR0, minC0,maxR1, maxC1,
			changed = false,
			start = range.start,
			end = range.end;

		minR0 = r0 = this.getIndexById(start.row);
		minC0 = c0 = this.getColumnIndex(start.column);
		maxR1 = r1 = this.getIndexById(end.row);
		maxC1 = c1 = this.getColumnIndex(end.column);

		for(i = r0; i <= r1; i++){
			var item = this.getItem(this.getIdByIndex(i));
			//check rows
			if(item.$row && !inner_call){
				changed = true;
				maxC1 = this._columns.length-1;
			}
			//check spans
			else if (this.config.spans){
				for(j = c0; j <= c1; j++){
					span = this.getSpan(this.getIdByIndex(i), this.columnId(j));
					if(span){
						spanR0 = this.getIndexById(span[0]);
						spanC0 = this.getColumnIndex(span[1]);
						if(spanR0 < minR0){
							minR0 = spanR0;
							changed = true;
						}
						if(spanC0 < minC0){
							changed = true;
							minC0 = spanC0;
						}
						if(spanR0 + span[3]-1 > maxR1){
							changed = true;
							maxR1 = spanR0 + span[3]-1;
						}
						if(spanC0 + span[2]-1 > maxC1){
							changed = true;
							maxC1 = spanC0 + span[2]-1;
						}
					}
				}
			}
		}
		if(changed){
			range.start = {row: this.getIdByIndex(minR0), column:this.columnId(minC0)};
			range.end = {row: this.getIdByIndex(maxR1), column:this.columnId(maxC1)};
			this._span_correct_range(range, true);
		}
	},
	_setTabindex:function(oldv, removeOnly){
		var node;
		if(oldv){
			node = this.getItemNode({row:oldv.start.row, column:oldv.start.column});
			if(node) node.removeAttribute("tabindex");
		}
		if(!removeOnly && this._selected_areas.length){
			var sel = this.getSelectedId(true)[0];
			node = this.getItemNode(sel);
			if(node) node.setAttribute("tabindex", "1");
		}
	}
};

export default Mixin;