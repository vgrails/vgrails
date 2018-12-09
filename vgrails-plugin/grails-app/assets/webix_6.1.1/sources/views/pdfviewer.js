import {preventEvent, download} from "../webix/html";
import {protoUI, $$} from "../ui/core";
import {bind} from "../webix/helpers";
import {_event, event} from "../webix/htmlevents";

import env from "../webix/env";
import require from "../load/require";

import base from "../views/view";
import EventSystem from "../core/eventsystem";
import AtomDataLoader from "../core/atomdataloader";


const api = {
	name:"pdfviewer",
	defaults:{
		scale:"auto"
	},
	$init:function(config){
		this.$view.className += " webix_pdf";

		var elm_wrapper = document.createElement("DIV");
		elm_wrapper.className="canvas_wrapper";

		var elm = document.createElement("canvas");

		this._currentPage = this.$view;
		this._container = this.$view.appendChild(elm_wrapper);
		this._canvas = this._container.appendChild(elm);
        
		this.$pdfDoc = null;
		this.$pageNum = 0;
		this.$numPages = 0;
		this._pageRendering = false;
		this._pageNumPending = null;
		this._ctx = this._canvas.getContext("2d");

		this._init_scale_value = 0.1;
		this._default_scale_delta = config.scaleDelta || 1.1;
		this._min_scale = config.minScale || 0.25;
		this._max_scale = config.maxScale || 10.0;
		this._max_auto_scale = 1.25;

		this._hPadding = 40;
		this._vPadding = 10;

		this.$ready.push(this._attachHandlers);
	},
	toolbar_setter:function(toolbar){
		if (typeof toolbar == "string"){
			var ui_toolbar = $$(toolbar);
			if (ui_toolbar){
				ui_toolbar.$master = this;
				ui_toolbar.refresh();
			}
			this.attachEvent("onDocumentReady", function(){
				if(ui_toolbar){
					ui_toolbar.setPage(this.$pageNum);
					ui_toolbar.setValues(this.$numPages, this._settings.scale);
				}
				else
					this.toolbar_setter(toolbar);
			});
			return toolbar;
		}
	},
	_attachHandlers:function(){
		delete this._settings.datatype; // cheat(

		this.attachEvent("onScaleChange", function(scale, update){
			if(update && this._settings.toolbar && $$(this._settings.toolbar).setScale)
				$$(this._settings.toolbar).setScale(scale);
		});

		if(env.touch){
			this._touchDelta = false;

			_event(this._viewobj, "touchstart", bind(function(e){
				var touches = e.targetTouches;
				if(touches.length === 2){
					preventEvent(e);
					this._touchDelta = Math.abs(touches[0].pageY - touches[1].pageY);
				}
			}, this));

			_event(this.$view, "touchmove", bind(function(e){
				var touches = e.targetTouches;

				if(touches.length === 2 && this._touchDelta !== false){
					preventEvent(e);

					if(Math.abs(touches[0].pageY - touches[1].pageY)>this._touchDelta)
						this.zoomIn();
					else
						this.zoomOut();
					this._touchDelta = false;
				}
			}, this));

			this.attachEvent("onSwipeX", function(start, end){
				this.$view.scrollLeft = this.$view.scrollLeft - (end.x-start.x);
			});

			this.attachEvent("onSwipeY", function(start, end){
				var ch = this.$view.clientHeight,
					sh = this.$view.scrollHeight,
					oh = this.$view.offsetHeight,
					stop = this.$view.scrollTop,
					delta = end.y-start.y;

				if(ch === sh || (delta<0 && stop > (sh - oh)) || (delta>0 && stop === 0)){
					var page = this.$pageNum + (delta > 0 ? -1 :1);
					if(page>0 && page <=this.$numPages){
						this.$pageNum = page;
						this._queueRenderPage(this.$pageNum);
						this.$view.scrollTop = delta > 0 ? sh : 0;
					}
				}
				else
					this.$view.scrollTop = stop - delta;
			});
		}
		else{
			var evt = env.isFF?"DOMMouseScroll":"mousewheel";
			event(window, evt, function(e){
				var ticks = (e.type === "DOMMouseScroll") ? -e.detail :e.wheelDelta;
				var dir = (ticks < 0) ? "out" : "in";
				if (e.ctrlKey) { // Only zoom the pages, not the entire viewer
					preventEvent(e);
					if(dir == "in")
						this.zoomIn();
					else
						this.zoomOut();
				}
			}, {bind:this, passive:false});
		}
	},
	_getDocument:function(data){
		if(data.name){ //File structure
			var reader = new FileReader();
			reader.onload = bind(function (e) {
				this._getDocument({data:e.target.result});
			}, this);
			reader.readAsArrayBuffer(data);
		}
		else{
			/* global PDFJS */
			PDFJS.getDocument({data:data.data}).then(bind(function (pdfDoc_) {
				this.clear();
				this.$pdfDoc = pdfDoc_;
				this.$numPages = this.$pdfDoc.numPages;
				this.$pageNum = 1;

				this._renderPage(this.$pageNum).then(bind(function(){
					this.callEvent("onDocumentReady");
				}, this));
			}, this));
		}
	},
	$onLoad:function(data){
		if(!window.PDFJS){
			//for cross browser and compatibility
			require([env.cdn + "/extras/pdfjs/compatibility.min.js", env.cdn + "/extras/pdfjs/pdf.min.js"], function(){
				/* global PDFJS */
				PDFJS.workerSrc = env.cdn + "/extras/pdfjs/pdf.worker.min.js";
				this._getDocument(data);
			}, this);
		}
		else
			this._getDocument(data);
		return true;
	},
	_getViewPort:function(page, scale){
		var viewport = page.getViewport(scale);
		this._canvas.height = viewport.height;
		this._canvas.width = viewport.width;
		this._container.style.width = viewport.width+"px";
		this._container.style.height = viewport.height+"px";

		return viewport;
	},
	_renderPage:function(num) {
		var viewer = this;
		viewer._pageRendering = true;
		// Using promise to fetch the page
		return this.$pdfDoc.getPage(num).then(function(page) {
			//Getting 'safe' scale value
			var scale = isNaN(parseFloat(viewer._settings.scale))?viewer._init_scale_value:viewer._settings.scale;
            
			var viewport = viewer._getViewPort(page, scale);
			//recalc viewport if "string" scale is set
			if(scale !== viewer._settings.scale){
				scale =  viewer._getScale(viewer._settings.scale);
				viewport = viewer._getViewPort(page, scale);
				viewer._settings.scale = scale;
			}

			// Render PDF page into canvas context
			var renderContext = {
				canvasContext: viewer._ctx,
				viewport: viewport
			};

			page.cleanupAfterRender = true;

			// Wait for rendering to finish
			return page.render(renderContext).promise.then(function () {
				viewer.callEvent("onPageRender", [viewer.$pageNum]);
				viewer._pageRendering = false;
				
				if (viewer._pageNumPending !== null) {
					// New page rendering is pending
					viewer._renderPage(viewer._pageNumPending);
					viewer._pageNumPending = null;
				}
			});
		});
	},
	_queueRenderPage:function(num) {
		if (this._pageRendering)
			this._pageNumPending = num;
		else
			this._renderPage(num);
	},
	renderPage:function(num){
		if(!this.$pdfDoc || num<0 || num>this.$numPages)
			return;

		this.$pageNum = num;
		this._queueRenderPage(this.$pageNum);
	},
	prevPage:function() {
		if (this.$pageNum <= 1)
			return;
		this.$pageNum--;
		this._queueRenderPage(this.$pageNum);
	},
	nextPage:function() {
		if(this.$pageNum >= this.$numPages)
			return;
		this.$pageNum++;
		this._queueRenderPage(this.$pageNum);
	},
	zoomIn: function (){
		var newScale = this._settings.scale;

		newScale = (newScale * this._default_scale_delta).toFixed(2);
		newScale = Math.ceil(newScale * 10) / 10;
		newScale = Math.min(this._max_scale, newScale);
		this.setScale(newScale, true);
	},
	zoomOut: function (){
		var newScale = this._settings.scale;

		newScale = (newScale / this._default_scale_delta).toFixed(2);
		newScale = Math.floor(newScale * 10) / 10;
		newScale = Math.max(this._min_scale, newScale);

		this.setScale(newScale, true);
	},
	_getScale:function(value){
		if(!isNaN(parseFloat(value)))
			return value;
		if(isNaN(parseFloat(this._settings.scale)))
			this._settings.scale = this._init_scale_value;

		var scale = 1; //default value
		var pageWidthScale = ((this._currentPage.clientWidth - this._hPadding) * this._settings.scale/this._canvas.clientWidth).toFixed(2);
		var pageHeightScale = ((this._currentPage.clientHeight - this._vPadding) * this._settings.scale/this._canvas.clientHeight).toFixed(2);
		switch (value) {
			case "page-actual":
				scale = 1;
				break;
			case "page-width":
				scale = pageWidthScale;
				break;
			case "page-height":
				scale = pageHeightScale;
				break;
			case "page-fit":
				scale = Math.min(pageWidthScale, pageHeightScale);
				break;
			case "auto":
				var isLandscape = (this._currentPage.clientWidth > this._currentPage.clientHeight);
				var horizontalScale = isLandscape ?  Math.min(pageHeightScale, pageWidthScale) : pageWidthScale;
				scale = Math.min(this._max_auto_scale, horizontalScale);
				break;
		}
		return scale;
	},
	setScale: function(value, update) {
		if (!isNaN(parseFloat(value))) {
			this._setScale(value, update);
		} else {
			var scale = this._getScale(value);
			this._setScale(scale, update);
		}
	},
	_setScale:function(newScale, update){
		this._settings.scale = newScale;
		this.renderPage(this.$pageNum);

		this.callEvent("onScaleChange", [newScale, update]);
	},
	download:function(){
		if(!this.$pdfDoc) return;
		
		var filename = (this._settings.downloadName || "document")+".pdf";
		this.$pdfDoc.getData().then(function(data){
			/* global PDFJS */
			var blob = PDFJS.createBlob(data, "application/pdf");
			download(blob, filename);
		});
	},
	clear:function(){
		if(this.$pdfDoc){
			this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
			this._container.style.height = this._container.style.width = this._canvas.width = this._canvas.height = 0;
			this._settings.scale = "auto";
			this.$pageNum = this.$numPages = 0;
			this.$pdfDoc.transport.startCleanup();
			this.$pdfDoc.destroy();
			this.$pdfDoc = null;

			if(this._settings.toolbar && $$(this._settings.toolbar))
				$$(this._settings.toolbar).reset();
		}
	}
};


const view = protoUI(api,  EventSystem, AtomDataLoader, base.view);
export default {api, view};