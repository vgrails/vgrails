import datatable from "../views/datatable";

import {toExcel} from "../webix/export";
import {createCss} from "../webix/html";
import {protoUI, $$} from "../ui/core";
import {bind, isUndefined, copy} from "../webix/helpers";


const api = {
	name:"excelviewer",
	$init:function(){
		this.$ready.push(function(){
			if (this._settings.toolbar)
				$$(this._settings.toolbar).attachEvent("onExcelSheetSelect", bind(this.showSheet, this));
		});
	},
	defaults:{
		datatype:"excel"
	},
	$onLoad:function(data){
		if(data.sheets){
			this._excel_data = data;
			if (this._settings.toolbar)
				$$(this._settings.toolbar).setSheets(data.names);
			var now = data.names[0];
			this.showSheet(now.id || now);
			return true;
		}
		return false;
	},
	$exportView:function(options){
		if(options.export_mode !=="excel" || options.dataOnly) return this;
		
		if(options.sheets === true) 
			options.sheets  = this.getSheets();
		else if(!options.sheets || !options.sheets.length)
			options.sheets = [this._activeSheet];
		else if(typeof options.sheets == "string")
			options.sheets = [options.sheets];

		options.dataOnly = true;
		options.heights = isUndefined(options.heights) && options.styles?"all":options.heights;

		var temp = [];
		var active = this._activeSheet;

		for(var i = 0; i<options.sheets.length; i++){
			this.showSheet(options.sheets[i]);
			temp = temp.concat(toExcel(this, options));
			if(options.styles)
				temp[i].styles = this._getExportStyles(options);
		}
		this.showSheet(active);
		delete options.dataOnly;
		return temp;
	},
	showSheet:function(name){
		this.clearAll();

		var obj = this.data.driver.sheetToArray(this._excel_data.sheets[name], {
			spans:this._settings.spans
		});

		var header = this._settings.excelHeader;
		var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

		var cols = {}, rows = {};
		if(obj.sizes){
			for(let i = 0; i<obj.sizes.length; i++){
				if(obj.sizes[i][0] == "column") cols[obj.sizes[i][1]] = Math.round(obj.sizes[i][2]);
				else if (obj.sizes[i][0] =="row") rows[obj.sizes[i][1]] = Math.round(obj.sizes[i][2]);
			}
		}

		if (!header){
			header = copy(obj.data[0]);
			for (let i = 0; i < header.length; i++)
				header[i] = { header:letters[i], id:"data"+i, width:cols[i],adjust:!cols[i], editor:"text", sort:"string" };
		} else if (header === true) {
			header = obj.data.splice(0,1)[0];
			for (let i = 0; i < header.length; i++)
				header[i] = { header:header[i], id:"data"+i, width:cols[i], adjust:!cols[i], editor:"text", sort:"string" };
		} else
			header = copy(header);

		this.config.columns = header;
		this.refreshColumns();

		this.parse(obj, this._settings.datatype);
		this._activeSheet = name;

		var paintspans = this._paintSpans(obj.spans);
		var paintrows = this._paintRowHeight(rows);
		var paintstyles = this._paintStyles(obj.styles, paintspans);
		
		if(paintspans || paintrows || paintstyles)
			this.refresh();
	},
	getSheets:function(){
		return this._excel_data.names; 
	},
	_getSpanCss:function(spans, id, cid, style){
		var found = false;
		for(var s = 0; s<spans.length; s++){
			if(spans[s][0] === id && spans[s][1] === cid){
				spans[s][5] = createCss(this._toCellStyle(style)); 
				this.addSpan(spans[s][0], spans[s][1], spans[s][2], spans[s][3] ,spans[s][4], spans[s][5]);
				found = true;
				break;
			}
		}
		return found;
	},
	_paintStyles:function(styles, spans){
		var count = 0;
		if(styles && styles.length){
			for(var i = 0; i<styles.length; i++){
				var rind = styles[i][0]-(this.config.excelHeader?1:0);
				if(rind >=0){
					var id = this.getIdByIndex(rind);
					if(this.exists(id)){
						var item = this.getItem(id);
						var cid = this.columnId(styles[i][1]);
						if(cid){
							if(!spans.length || !this._getSpanCss(spans, id, cid, styles[i][2])){
								item.$cellCss = item.$cellCss || {};
								item.$cellCss[cid] = this._toCellStyle(styles[i][2]);
							}
							count++;
						}
					}
				}
			}
			return count;
		}
		return false;
	},
	//ARGB conversion
	_safeColor:function(str){
		str = str || "000000";
		if(str.length === 8) str = str.substring(2);
		return "#"+str;
	},
	_toCellStyle:function(st){
		var res = {};
		if(st.fill && st.fill.fgColor)
			res["background-color"] = this._safeColor(st.fill.fgColor.rgb);
		if(st.font){
			var f = st.font;
			if(f.name) res["font-family"] = f.name;
			if(f.sz) res["font-size"] = f.sz/0.75+"px";
			if(f.color && f.color.rgb) res["color"] = this._safeColor(f.color.rgb);
			if(f.bold) res["font-weight"] = "bold";
			if(f.underline) res["text-decoration"] = "underline";
			if(f.italic) res["font-style"] = "italic";
			if(f.strike) res["text-decoration"] = "line-through";
		}
		if(st.alignment){
			var a = st.alignment;
			if(a.vertical && a.vertical == "center"){
				res["display"] = "flex";
				res["justify-content"] = "flex-start";
				res["align-items"] = "center";
			}
			if(a.vertical && a.vertical == "bottom"){
				res["display"] = "flex";
				res["justify-content"] = "flex-end";
				res["align-items"] = "flex-end";
			}
			if(a.horizontal) {
				if(a.vertical && (a.vertical =="center" || a.vertical =="bottom"))
					res["justify-content"] = "center";
				else
					res["text-align"] = a.horizontal;
			}
			if(a.wrapText) res["white-space"] = "normal";
		}
		if(st.border){
			var b = st.border;
			if(b.top) res["border-top"] = "1px solid "+this._safeColor(b.top.color.rgb);
			if(b.bottom) res["border-bottom"] = "1px solid "+this._safeColor(b.bottom.color.rgb)+" !important";
			if(b.left) res["border-left"] = "1px solid "+this._safeColor(b.left.color.rgb);
			if(b.right) res["border-right"] = "1px solid "+this._safeColor(b.right.color.rgb)+" !important";
		}
		return res;
	},
	_paintRowHeight:function(rows){
		var count = 0;
		for(var i in rows){
			var index = this.config.excelHeader?i-1:i;
			if(index >=0){
				var id = this.getIdByIndex(index);
				if(this.exists(id)){
					this.getItem(id).$height = rows[i];
					count++;
				}
			}
		}
		this.config.fixedRowHeight = !count;
		return count;
	},
	_paintSpans:function(spans){
		var res = [];
		if(this._settings.spans && spans && spans.length){
			this._spans_pull = {};
			for(var i = 0; i<spans.length; i++){
				if(this.config.excelHeader)
					spans[i][0]--;
				if(spans[i][0] >= 0){
					spans[i][0] = this.getIdByIndex(spans[i][0]);
					spans[i][1] = "data"+spans[i][1];
					res.push(spans[i]);
				}
			}
			this.addSpan(res);
			return res;
		}
		return false;
	}
};


const view = protoUI(api,  datatable.view);
export default {api, view};