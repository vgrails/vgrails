import base from "../views/view";
import {protoUI} from "../ui/core";
import type from "../webix/type";
import {clone} from "../webix/helpers";
import Canvas from "../core/canvas";


const api = {
	name: "barcode",
	defaults:{
		type: "ean13",
		height: 160,
		width: 220,
		paddingY: 10,
		paddingX: 20,
		textHeight: 20,
		color: "#000",
		ariaLabel:"bars"
	},
	$init: function(){
		this.$view.className += " webix_barcode";
		if (!this.types){
			this.types = { "default" : this.type };
			this.type.name = "default";
		}
	},
	type:{},
	render: function(){
		if(this.isVisible(this._settings.id)){
			if(this.canvas)
				this.canvas.clearCanvas(true);
			this.$view.innerHTML = "";
			this._renderCanvas();
		}
	},
	_renderCanvas: function(){
		this.canvas = new Canvas({
			container:this.$view,
			name:this.name,
			title:this._settings.ariaLabel,
			width: this.$width,
			height:this.$height
		});
		this._drawBars();
	},
	_drawBars: function(){
		var code, ctx, i, len,
			value = this._settings.value,
			type = this._settings.type;

		if(!type || !this.types[type] || !value)
			return false;

		code = this.type.encode(value);
		len = code.length;

		ctx = this.canvas.getCanvas();
		if(len){
			var unitWidth = (this.$width - this.config.paddingX*2)/len;
			var unitNum = 0;

			for( i = 0; i < len ; i++ ){
				var ch1 = parseInt(code.charAt(i),10);
				if(ch1){
					unitNum++;
					if(i == (len-1)){
						this._drawBar(ctx,i+1,unitWidth,unitNum,len);
					}
				}
				else if(unitNum){
					this._drawBar(ctx,i,unitWidth,unitNum,len);
					unitNum=0;
				}
			}

			// add text
			this._addText(value, unitWidth);
		}
	},
	_drawBar: function(ctx,i,unitWidth,unitNum,num){
		var x0, x1, y0, y1;

		x1 = parseInt(i*unitWidth+this.config.paddingX,10);
		x0 = parseInt(x1 - unitNum*unitWidth,10);
		y0 = this.config.paddingY;
		y1 = this.$height - this.config.paddingY - this.config.textHeight;

		if(this._isEAN() && ( i<4 || i>(num-4) || (i < (num/2+2) && i>(num/2-2)))){
			y1 += this.config.textHeight/2;
		}
		ctx.fillStyle = this.config.color;
		ctx.beginPath();
		ctx.moveTo(x0,y0);
		ctx.lineTo(x1,y0);
		ctx.lineTo(x1,y1);
		ctx.lineTo(x0,y1);
		ctx.lineTo(x0,y0);
		ctx.fill();
	},
	_addText: function(value, barWidth){
		var i, len, x;

		if(this.type.template)
			value = this.type.template(value);

		if(this._isEAN()){
			if(this.type.firstDigit){
				this.canvas.renderTextAt(true,"left", this.config.paddingX,this.$height-this.config.paddingY, value.charAt(0));
				value = value.slice(1);
			}

			len = value.length;

			if(this.type.lastDigit)
				len--;

			if(len){
				var tUnitWidth = (this.$width - this.config.paddingX*2 - barWidth*11)/len;

				for( i = 0; i < len; i++ ){
					x = this.config.paddingX + i*tUnitWidth + (i<len/2?3:8)*barWidth +tUnitWidth/2;
					this.canvas.renderTextAt(true, true, x, this.$height - this.config.paddingY, value.charAt(i));
				}

				if(this.type.lastDigit){
					x = this.config.paddingX + len*tUnitWidth + 11*barWidth;
					this.canvas.renderTextAt(true, false, x, this.$height-this.config.paddingY, value.charAt(len));
				}
			}
		}
		else{
			this.canvas.renderTextAt( true, true, this.$width/2, this.$height - this.config.paddingY, value );
		}
	},
	setValue: function(value){
		this._settings.value = value;
		this.render();
		return value;
	},
	getValue: function(){
		var value = this._settings.value;
		return this.type.template?this.type.template(value):value;
	},
	type_setter:function(value){
		if(!this.types[value])
			this.customize(value);
		else {
			this.type = clone(this.types[value]);
			if (this.type.css)
				this._contentobj.className+=" "+this.type.css;
		}
		return value;
	},
	_isEAN: function(){
		var type = this.config.type;
		return (type.indexOf("ean")===0 || type.indexOf("upcA")!=-1);
	},
	$setSize:function(x,y){
		if(base.api.$setSize.call(this,x,y)){
			this.render();
		}
	}
};


const view = protoUI(api, base.view);
export default {api, view};

type(view, {
	name:"upcA",
	firstDigit: true,
	lastDigit: true,
	encode: function(value){
		if (value.length < 12) {
			value = "0" + value;
		}
		return ean13.encode(value);
	},
	template: function(value){
		return value.replace(/[^0-9]/g,"").substring(0, 11)  + this.checksum(value);
	},
	checksum: function (value){
		if (value.length < 12) {
			value = "0" + value;
		}
		return ean13.checksum(value);
	}
});


/*
 * EAN8
 * */
type(view, {
	name:"ean8",
	encodings: [
		["0001101", "1110010"],
		["0011001", "1100110"],
		["0010011", "1101100"],
		["0111101", "1000010"],
		["0100011", "1011100"],
		["0110001", "1001110"],
		["0101111", "1010000"],
		["0111011", "1000100"],
		["0110111", "1001000"],
		["0001011", "1110100"]
	],
	encode: function(value){
		var code, i;
		value = value.replace(/[^0-9]/g,"").substring(0, 7);
		if(value.length != 7)
			return "";

		value = value + this.checksum(value);

		code = "101";

		for(i=0; i<4; i++){
			code += this.encodings[parseInt(value.charAt(i),10)][0];
		}

		code += "01010";

		for(i=4; i<8; i++){
			code += this.encodings[parseInt(value.charAt(i),10)][1];
		}

		code += "101";
		return code;
	},
	template: function(value){
		return value.replace(/[^0-9]/g,"").substring(0, 7) + this.checksum(value);
	},
	checksum: function (value){
		value = value.substring(0, 7);
		var i,
			odd = true,
			sum = 0;

		for(i=0; i<7; i++){
			sum += (odd ? 3 : 1) * parseInt(value.charAt(i),10);
			odd = !odd;
		}
		return ((10 - sum % 10) % 10).toString();
	}
});

/*
 * EAN13
 * */
const ean13 = {
	name:"ean13",
	firstDigit: true,
	encodings: [
		["0001101", "0100111", "1110010", "000000"],
		["0011001", "0110011", "1100110", "001011"],
		["0010011", "0011011", "1101100", "001101"],
		["0111101", "0100001", "1000010", "001110"],
		["0100011", "0011101", "1011100", "010011"],
		["0110001", "0111001", "1001110", "011001"],
		["0101111", "0000101", "1010000", "011100"],
		["0111011", "0010001", "1000100", "010101"],
		["0110111", "0001001", "1001000", "010110"],
		["0001011", "0010111", "1110100", "011010"]
	],
	encode: function(value){
		var code, columnIndexes, i;

		value = value.replace(/[^0-9]/g,"").substring(0, 12);

		if (value.length != 12)
			return "";

		value += this.checksum(value);

		code = "101";

		columnIndexes = this.encodings[parseInt(value.charAt(0),10) ][3];

		for(i=1; i<7; i++){
			code += this.encodings[parseInt(value.charAt(i),10)][ parseInt(columnIndexes.charAt(i-1),10)];
		}

		code += "01010";

		for(i=7; i<13; i++){
			code += this.encodings[parseInt(value.charAt(i),10)][2];
		}

		code += "101";
		return code;
	},
	template: function(value){
		return value.replace(/[^0-9]/g,"").substring(0, 12)  + this.checksum(value);
	},
	checksum: function (value){
		var i,
			odd = false,
			sum = 0;

		value = value.substring(0, 12);
		for(i=0; i<12; i++){
			sum += (odd ? 3 : 1) * parseInt(value.charAt(i),10);
			odd = !odd;
		}
		return ((10 - sum % 10) % 10).toString();
	}
};

type(view, ean13);