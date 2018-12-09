import {removeCss, addCss, getTextSize} from "../webix/html";
import {protoUI} from "../ui/core";
import {$active} from "../webix/skin";
import {extend, bind, copy, isUndefined} from "../webix/helpers";
import {event} from "../webix/htmlevents";

import template from "../webix/template";
import i18n from "../webix/i18n";
import wDate from "../core/date";

import layout from "../views/layout";

const api = {
	name:"daterange",
	defaults:{
		button:false,
		icons:false,
		calendarCount:2,
		borderless:false
	},
	$init:function(config){
		config.calendar = config.calendar || {};
		config.value = this._correct_value(config.value);
		delete config.calendar.type; // other types are not implemented
		
		this._viewobj.className += " webix_daterange";
		this._zoom_level = this._types[config.calendar.type] || 0;

		var cols = [],
			skinConf = $active.calendar,
			cheight = skinConf && skinConf.height ? skinConf.height : 250,
			cwidth = skinConf && skinConf.width ? skinConf.width : 250,
			calendar = extend({ view:"calendar", width:cwidth, height:cheight }, config.calendar || {}, true),
			count = config.calendarCount = this._zoom_level === 0 ? (config.calendarCount || this.defaults.calendarCount) : this.defaults.calendarCount,
			basecss = (calendar.css?calendar.css + " ":"")+"webix_range_",
			start = config.value.start || new Date();
		
		for(var i = 0; i<count; i++){
			var date = wDate.add(start, this._steps[this._zoom_level]*i, "month", true);

			extend(calendar, {
				events:bind(this._isInRange, this),
				css:basecss+(count ===1?"":(i === 0 ? "0" : (i+1 == count ? "N" :"1"))),
				timepicker: this._zoom_level === 0?config.timepicker:false,
				borderless:true,
				date:date
			}, true);
			
			cols.push(copy(calendar));
		}


		config.rows = [
			{ type:"clean", cols: cols},
			this._footer_row(config, cwidth*count)
		];
		
		config.height = config.height || (calendar.height+(config.icons || config.button?35:0));
		config.type = "line";
		this.$ready.push(this._after_init);

		event(this.$view, "keydown", bind(function(e){
			this._onKeyPress( e.which || e.keyCode, e);
		}, this));
	},
	value_setter:function(value){
		return this._correct_value(value);
	},
	getValue:function(){
		return this._settings.value;
	},
	setValue:function(value, silent){
		value = this._correct_value(value);
		this._settings.value = value;

		var start = value.start || value.end || new Date();

		if(!silent){
			this._cals[0].showCalendar(value.start);
			
			for(var i = 1; i<this._cals.length; i++){
				this._cals[i]._settings.date = start;
				this._changeDateSilent(this._cals[i], 1, i);
			}
		}
		this.callEvent("onChange", [value]);
		this.refresh();
	},
	refresh:function(){
		for(var i = 0; i<this._cals.length; i++){

			if(this._cals[i]._zoom_level === this._zoom_level){
				removeCss(this._cals[i].$view, "webix_cal_timepicker");
				removeCss(this._cals[i].$view, "webix_range_timepicker");
				

				var rel = this._related_date(this._cals[i].getVisibleDate());
				if(rel.start || rel.end){
					this._cals[i]._settings.date = rel.start || rel.end;
					if(this._settings.timepicker){
						var css = "webix_"+(rel.start && rel.end?"range":"cal")+"_timepicker";
						addCss(this._cals[i].$view, css);
					}
				}
				else
					wDate.datePart(this._cals[i]._settings.date);

				this._cals[i].refresh();
			}
		}
	},
	addToRange:function(date){
		var value = this._add_date(this._string_to_date(date));
		this.setValue(value);
	},
	_icons:[
		{
			template:function(){
				return "<span role='button' tabindex='0' class='webix_cal_icon_today webix_cal_icon'>"+i18n.calendar.today+"</span>";
			},
			on_click:{
				"webix_cal_icon_today":function(){
					var date = new Date();
					if(!this._settings.timepicker)
						date = wDate.datePart(date);
					this.addToRange(date);
					this.callEvent("onTodaySet",[this.getValue()]);
				}
			}
		},
		{
			template:function(){
				return "<span role='button' tabindex='0' class='webix_cal_icon_clear webix_cal_icon'>"+i18n.calendar.clear+"</span>";
			},
			on_click:{
				"webix_cal_icon_clear":function(){
					this.setValue("");
					this.callEvent("onDateClear", []);
				}
			}
		}
	],
	_icons_template:function(icons){
		if(!icons)
			return { width:0};
		else{
			icons = (typeof icons =="object") ? icons:this._icons; //custom or default 
			var icons_template = { css:"webix_cal_footer ", borderless:true, height:30, template:"<div class='webix_cal_icons'>", onClick:{}};

			for(var i = 0; i<icons.length; i++){
				if(icons[i].template){
					var itemplate = (typeof(icons[i].template) == "function"?icons[i].template: template(icons[i].template));
					icons_template.template += itemplate.call(this);
				}	
				if(icons[i].on_click){
					for(var k in icons[i].on_click){
						icons_template.onClick[k] = bind(icons[i].on_click[k], this);
					}
				}
			}
			icons_template.template += "</div>";
			icons_template.width = getTextSize(icons_template.template).width+30;
			return icons_template;
		}
	},
	_footer_row:function(config, width){
		var button = { view:"button", value:i18n.calendar.done,
			minWidth:100, maxWidth:230,
			align:"center", height:30, click:function(){
				this.getParentView().getParentView().hide();
			}};

		var icons = this._icons_template(config.icons);

		var row = { css:"webix_range_footer",  cols:[
			{ width:icons.width }
		]};
		if((config.button || config.icons) && (icons.width*2+button.minWidth) > width)
			row.cols[0].width = 0;

		row.cols.push(config.button ? button : {});
		row.cols.push(icons);

		return row;
	},
	_types:{
		"time":-1,
		"month":1,
		"year":2
	},
	_steps:{
		0:1,
		1:12,
		2:120
	},
	_correct_value:function(value){
		if(!value) value = { start:null, end:null};

		if(!value.start && !value.end)
			value = {start: value};
		
		value.end = this._string_to_date(value.end) || null;
		value.start = this._string_to_date(value.start) || null;

		if((value.end && value.end < value.start) || !value.start)
			value.end = [value.start, value.start = value.end][0];
		return value;
	},
	_string_to_date:function(date){
		if(typeof date == "string"){
			date = i18n.parseFormatDate(date);
		}
		return isNaN(date*1) ? null : date;
	},
	_isInRange:function(date, isOutside){
		if (isOutside) return;
		var v = this._settings.value,
			s = v.start? wDate.datePart(wDate.copy(v.start)) : null,
			e = v.end ? wDate.datePart(wDate.copy(v.end)) : null,
			d = wDate.datePart(date),
			tomorrow = wDate.add(d,1,"day",true),
			yesterday = wDate.add(d,-1,"day",true),
			css = "";

		if(d>=s && e && d<=e){
			css = "webix_cal_range";
			if(wDate.equal(yesterday, s))
				css += " webix_cal_range_first";
			if(wDate.equal(tomorrow, e))
				css += " webix_cal_range_last";
		}
		if(wDate.equal(d, s))
			css = "webix_cal_range_start";
		if(wDate.equal(d, e))
			css = "webix_cal_range_end";

		var holiday =wDate.isHoliday(date)+" " || "";
		return css+" "+holiday;
	},
	_after_init:function(){
		var cals = this._cals = this.getChildViews()[0].getChildViews();
		var range = this;
		var masterId = this.config.id;

		this._cals_hash = {};

		for(var i = 0; i<cals.length; i++){
			cals[i].config.master = masterId;
			this._cals_hash[cals[i].config.id] = i;

			//events
			cals[i].attachEvent("onBeforeDateSelect", function(date){ return range._on_date_select(this, date); });
			cals[i].attachEvent("onBeforeZoom", function(zoom){ return range._before_zoom(this, zoom); });
			
			if(i===0 || i  === cals.length-1){
				cals[i].attachEvent("onAfterMonthChange", bind(this._month_change, this));
				cals[i].attachEvent("onAfterZoom", function(zoom, oldzoom){ range._after_zoom(this, zoom, oldzoom);});
			}
		}
		if(this._settings.timepicker)
			this.refresh();
	},
	_before_zoom:function(view, zoom){
		var ind = this._getIndexById(view.config.id);

		if(zoom >=0 && ind>0 && ind !== this._cals.length-1)
			return false;
		if(zoom ===-1){ //time mode
			var rel = this._related_date(view.getVisibleDate());
			if(rel.start && rel.end) //both dates are in one calendar
				view._settings.date = rel[this._time_mode];
		}
		return true;
	},
	_month_change:function(now, prev){
		var dir = now>prev ? 1: -1;
		var start = now>prev ? this._cals[this._cals.length-1] : this._cals[0];
		var step = start._zoom_logic[start._zoom_level]._changeStep;

		this._shift(dir, step, start);
		this.refresh();
	},
	_after_zoom:function(start, zoom, oldzoom){
		var step = start._zoom_logic[start._zoom_level]._changeStep;
		var ind = this._getIndexById(start.config.id);
		var dir = ind === 0 ? 1 :-1;
		if(!this._cals[ind+dir]) 
			return;
		
		var next = this._cals[ind+dir]._settings.date;
		
		if(oldzoom>zoom && zoom >=0){
			var diff = 0;
			if(zoom === 1){ //year was changed 
				var year = next.getFullYear();
				if(this._zoom_level || (dir === -1 && next.getMonth() === 11) || (dir ===1 && next.getMonth() === 0))
					year = year - dir;
				diff = start._settings.date.getFullYear()-year;
			}
			else if(zoom === 0 ){//month was changed
				var month = next.getMonth()-dir;
				if(month === 12 || month ==-1)
					month = (month === -1) ? 11: 0;
				
				diff = start._settings.date.getMonth()-month;
			}
			this._shift(diff, step, start);
			this.refresh();
		}
	},
	_changeDateSilent:function(view, dir, step){
		view.blockEvent();
		if(view._zoom_level>=0)
			view._changeDate(dir, step);
		view.unblockEvent();
	},
	_getIndexById:function(id){
		return this._cals_hash[id];
	},
	_shift:function(dir, step, start){
		for(var i =0; i<this._cals.length; i++){
			var next = this._cals[i];
			if(!start || next.config.id !==start.config.id)
				this._changeDateSilent(next, dir, step);
		}
	},
	_related_date:function(date){
		var v = this._settings.value;
		var rel = {};
		if(v.start && v.start.getYear() === date.getYear() && v.start.getMonth() === date.getMonth())
			rel.start = v.start;
		if(v.end && v.end.getYear() === date.getYear() && v.end.getMonth() === date.getMonth())
			rel.end = v.end;
		return rel;
	},
	_set_time:function(date, source){
		date.setHours(source.getHours());
		date.setMinutes(source.getMinutes());
		date.setSeconds(source.getSeconds());
		date.setMilliseconds(source.getMilliseconds());
	},
	_add_date:function(date, ind){
		var v = copy(this._settings.value);
		//year, month
		if(this._zoom_level !==0 && !isUndefined(ind)){
			var key = ind?"end":"start";
			v[key] = date;
		}
		else{
			if(v.start && !v.end)
				v.end = date;
			else {
				v.start = date;
				v.end = null;
			}
		}
		
		return v;
	},
	_on_date_select:function(view, date){
		if(this.callEvent("onBeforeDateSelect", [date])){
			var v = this._settings.value;

			if(view._zoom_level<0){ //time set
				var rel = copy(this._related_date(date)),
					reldate;
				
				reldate = (rel.start && rel.end) ? rel[this._time_mode] : rel.start || rel.end;
				if(reldate)
					this._set_time(reldate, date);

				view._zoom_level = 0;

				v = extend(copy(v), rel, true);
			}
			else{
				var vis = view.getVisibleDate();
				var ind = this._getIndexById(view.config.id);
				
				if(date.getMonth() !== vis.getMonth() && (ind ===0 || ind === this._cals.length-1)){
					var dir = date>vis? 1 : -1;
					this._shift(dir, 1);
				}
				v = this._add_date(date, ind);
			}

			if(view._zoom_level !== this._zoom_level)
				view.showCalendar(date);
			
			this.setValue(v, true);
			this.callEvent("onAfterDateSelect", [this.getValue()]);
		}

		return false;
	}
};


const view = protoUI(api,  layout.view);
export default {api, view};