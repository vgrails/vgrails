import base from "../views/view";
import {protoUI} from "../ui/core";
import template from "../webix/template";
import {uid} from "../webix/helpers";
import {assert} from "../webix/debug";


const api = {
	name: "bullet",
	defaults: {
		color: "#394646",
		marker: false,
		layout: "x",
		barWidth: 40,
		flowTime: 500,
		labelWidth: 150,
		minRange: 0,
		maxRange: 100,
		stroke: 8,
		value:0,
		smoothFlow:true,
		tickSize:10,
		bands:[
			{ value:100, color:"#5be5d6"},
			{ value:80, color:"#fff07e" },
			{ value:60, color:"#fd8b8c" } 
		],
		scale: { 
			step:10
		}
	},
	label_setter:template,
	placeholder_setter: template,
	$init:function(obj){
		var ticks = typeof obj.tickSize != "undefined" ? obj.tickSize : this.defaults.tickSize;

		if (obj) {
			if ((!obj.layout || obj.layout === "x") && !obj.height)
				obj.height = obj.scale === false ? 60: (ticks? 76+ticks : 74);
			if (obj.layout === "y" && !obj.width)
				obj.width = obj.scale === false ? 60: (ticks ? 87+ticks : 87);
		}
	},
	scale_setter:function(config){
		if (config){
			config.step = config.step || 10;
			config.template = template(config.template||"#value#");
		}
		return config;
	},
	$setSize: function(x, y) {
		if (base.api.$setSize.call(this, x, y)) {
			this._setDefaultView(this._settings.layout === "y" ? y : x);
			if (this._settings.value || this._settings.value === 0)
				this._animate(0, this._settings.value);
		}
	},
	_safeValue: function(value) {
		return Math.min(Math.max(value, this._settings.minRange), this._settings.maxRange)-this._settings.minRange;
	},
	_animateFrame: function(timestamp) {
		this._dt = timestamp - (this._time || timestamp);
		this._time = timestamp;
		var fps;

		if(this._settings.flowTime > this._dt) {
			fps = this._settings.flowTime / this._dt;
		} else {
			fps = this._settings.flowTime;
		}

		if (fps > 1000 || fps < 5) fps = 30;

		var step = (this._settings.value - this._prevValue)/fps;
		this._nowValue += step;

		if (Math.abs(this._nowValue - this._settings.value) < Math.abs(step))
			this._nowValue = this._settings.value;

		if (this._nowValue != this._settings.value){
			this._requestId = requestAnimationFrame(this._animateFrame.bind(this));
		} else {
			cancelAnimationFrame(this._requestId);
			this._requestId = null;
		}
		this._bulletValue.setAttribute("width", Math.floor(this._safeValue(this._nowValue) * this._scale));
		this._bulletValue.style.fill = this._getColor();
	},
	_animate: function(from, to){
		this._prevValue = this._nowValue = from;
		this._settings.value = this._value = to;

		if (this.isVisible() === true && this._settings.smoothFlow === true && (window.requestAnimationFrame)) {
			if (!this._requestId)
				this._requestId = requestAnimationFrame(this._animateFrame.bind(this));
		} else {
			
			this._bulletValue.setAttribute("width", Math.floor(this._safeValue(to) * this._scale));
			this._bulletValue.style.fill = this._getColor();
		}
	},
	_getColor: function(){
		var color = this._settings.color;
		return typeof color === "function" ? color(this._value) : color;
	},
	_setAttr: function(tag, names, values) {
		for (var i = 0; i < names.length; i++)
			tag.setAttribute(names[i], values[i]);
	},
	_createNS:function(tag, names, values){
		var ns = "http://www.w3.org/2000/svg";
		var el = document.createElementNS(ns, tag);
		if (names)
			this._setAttr(el, names, values);

		return el;
	},
	_dom:function(data){
		var top = this._createNS(data[0], data[1], data[2]);
		var child = data[3];
		if (child)
			for (var i = 0; i < child.length; i++)
				top.appendChild(this._dom(child[i]));

		return top;
	},
	_setView: function() {
		var id = "d"+uid();
		var svg 		= this._createNS("svg", 	["class"], ["webix_bullet_graph_svg"]);
		var container 	= this._createNS("g");
		var containerBand = this._createNS("g");
		let value 		= this._createNS("rect", 	["x","y", "width", "height", "class", "style"], [this._leftStart, this._topStart, 100, this._settings.stroke, "webix_bullet_value","filter:url(#"+id+");fill:"+this._getColor()]);
		
		var valueMarker = this._createNS("rect", ["x","y", "width", "height", "fill"], [0, 5, 3, (this._settings.barWidth - 10), "rgba(0,0,0,0.5)"]);
		var division 	= this._createNS("g", 	["stroke", "stroke-width", "fill"], ["#8b94ac", "2", "none"]);
		var text 		= this._createNS("text", ["text-anchor", "stroke", "fill"], ["end", "none", "#8b94ac"]);
		var leftA = this._settings.layout == "y" ? "50%" : this._leftStart - 10;
		var topA = this._settings.layout == "y" ? 11 : 17;
		var textRow1 	= this._createNS("tspan",["x", "y", "class"], [leftA, topA, "webix_bullet_header"]);
		var textRow2 	= this._createNS("tspan",["x", "y", "class"], [leftA, topA+17, "webix_bullet_subheader"]);
		var range 		= this._createNS("text", ["text-anchor", "stroke", "class", "fill"], ["middle", "none", "webix_bullet_scale", "#8b94ac"]);

		var filter = this._dom(
			["filter", ["id","x","y", "width", "height"], [id, "0","-150%", "110%", "400%"], [
				["feOffset",["in", "dx","dy"],["SourceAlpha", 0, 0 ]],
				["feGaussianBlur",["stdDeviation"],["2"]],
				["feComponentTransfer", 0 ,0, [
					["feFuncA", ["type", "slope"], ["linear", "0.5"]]
				]],
				["feMerge", 0,0, [
					["feMergeNode"],
					["feMergeNode", ["in"], ["SourceGraphic"]]
				]]
			]]
		);

		svg.appendChild(filter);
 
		var tempContainer = document.createElement("div");
		container.appendChild(containerBand);

		if(this._settings.marker !== false) {
			valueMarker.setAttribute("x", (this._leftStart + this._safeValue(this._settings.marker)*this._scale - 2));
			container.appendChild(valueMarker);
		}

		container.appendChild(value);
		text.appendChild(textRow1);
		text.appendChild(textRow2);
		svg.appendChild(text);

		var vertical = this._settings.layout === "y";
		var ticks = this._settings.tickSize;
		if (this._settings.scale){
			var label = this._leftStart;
			for (let i = this._settings.minRange; i <= this._settings.maxRange; i+= this._settings.scale.step){
				var pos = Math.max(i-this._settings.minRange, 0);
				var left = Math.floor(pos*this._scale-(pos?0.1:-1));
				var x = vertical ? (this.$width - this._settings.barWidth)/2 + (ticks ? 2-ticks : 4) : left+label; 
				var y = vertical ? this._chartWidth + label - left + 6 : this._settings.barWidth + (ticks ? 16+ticks : 14);
				var z = vertical ? -4 : this._settings.barWidth+3+ticks;
				var align = vertical ? "end" : "middle";

				var bulletRangeChild = this._createNS("tspan",
					["x", "y", "text-anchor"], [x, y, align]);
				var bulletDivChild = this._createNS("line", 
					["x1", "y1", "x2", "y2", "stroke-width"], [left+label,z,left+label,z-ticks,1]);

				tempContainer.innerHTML = this._settings.scale.template({ value: i });
				bulletRangeChild.appendChild(tempContainer.childNodes[0]);
				range.appendChild(bulletRangeChild);
				division.appendChild(bulletDivChild);
			}

			container.appendChild(division);
			svg.appendChild(range);
		}


		for (let i = 0; i < this._settings.bands.length; i++){
			var obj = this._settings.bands[i];
			var band = this._createNS("path");
			let value = this._safeValue(obj.value)*this._scale;
			band.setAttribute("d", "M "+this._leftStart+",0 l " + value + ",0 l 0,"+this._settings.barWidth+" l -" + value + ",0 z");
			band.setAttribute("fill", obj.color);
			containerBand.appendChild(band);
		}

		svg.appendChild(container);

		if (this._settings.layout === "y"){
			var w = this._settings.scale?(this.$width / 2 - 10):0;
			var h = this.$height + this._leftStart - 28;
			container.setAttribute("transform", "translate("+w+", "+h+") rotate(270)");
			text.setAttribute("text-anchor", "middle");
			text.childNodes[0].setAttribute("x", "55%");
			text.childNodes[1].setAttribute("x", "55%");
			range.setAttribute("text-anchor", "right");
		}
		svg.setAttribute("viewBox", "0 0 " + this.$width  + " " + this.$height  + "");

		return svg;
	},
	_setDefaultView: function(size) {
		assert(this.config.minRange < this.config.maxRange, "Invalid Range Values");
		
		size  = size || (this._settings.layout == "x"?this.$width:this.$height);
		
		var _view = this.$view;
		_view.innerHTML = "";

		var config = this._settings;
		var isLabel = (config.label && config.label(config)) || (config.placeholder && config.placeholder(config));

		this._leftStart =  isLabel ? (config.labelHeight || config.labelWidth) : 7;
		this._topStart =  Math.floor((this._settings.barWidth - this._settings.stroke)/2);
		this._chartWidth = size - this._leftStart - 30;
		this._scale = this._chartWidth / (this._settings.maxRange - this._settings.minRange);

		var svg = this._setView();
		// scale height fix for ie
		svg.setAttribute("height", this.$height); 
		svg.setAttribute("width", this.$width);

		_view.appendChild(svg);
		this._bulletValue = _view.querySelector(".webix_bullet_value");

		var label = this._settings.label;
		if (label)
			this.$view.querySelector(".webix_bullet_header").textContent = label(this._settings);

		var placeholder = this._settings.placeholder;
		if (placeholder)
			this.$view.querySelector(".webix_bullet_subheader").textContent = placeholder(this._settings);
	},
	refresh:function(){
		this._setDefaultView();
		this._animate(this._value, this._settings.value);
	},
	setValue: function(value) {
		if (this._settings.value != value){
			this._animate(this._settings.value, value);
		}
	},
	getValue: function() {
		return this._settings.value;
	}
};


const view = protoUI(api,  base.view);
export default {api, view};