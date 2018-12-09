import richselect from "../views/richselect";
import {protoUI, ui, $$} from "../ui/core";
import {$active} from "../webix/skin";
import {toArray, copy, isArray, extend, uid, delay} from "../webix/helpers";
import popup from "../views/popup";
import base from "../views/view";
import i18n from "../webix/i18n";
import {_event} from "../webix/htmlevents";
import template from "../webix/template";


const api = {
	name:"multicombo",
	$cssName:"text",
	defaults:{
		keepText: false,
		separator:",",
		icon: false,
		iconWidth: 0,
		tagMode: true,
		tagTemplate: function(values){
			return (values.length?values.length+" item(s)":"");
		},
		template:function(obj,common){
			return common._render_value_block(obj, common);
		}
	},
	$init:function(){
		this.$view.className += " webix_multicombo";

		this.attachEvent("onBeforeRender",function(){
			if(!this._inputHeight)
				this._inputHeight = $active.inputHeight;
			return true;
		});
		this.attachEvent("onAfterRender", function(){
			this._last_size = null;
		});
	},

	on_click: {
		"webix_multicombo_delete": function(e,view,node){
			var value;
			if(!this._settings.readonly && node && (value = node.parentNode.getAttribute("optvalue")))
				this._removeValue(value);
			return false;
		}
	},
	_onBlur:function(){
		var value = this.getInputNode().value;
		//blurring caused by clicks in the suggest list cannot affect new values
		if(value && this._settings.newValues && new Date()-(this.getPopup()._click_stamp ||0)>100){
			this._addNewValue(value);
		}

		if (!this._settings.keepText)
			this._inputValue = "";
		this.refresh();
	},
	_removeValue: function(value){
		var values = this._settings.value;
		var suggest = $$(this.config.suggest);
		if(typeof values == "string")
			values = values.split(this._settings.separator);
		values = toArray(copy(values));
		values.remove(value);

		this.setValue(values.join(this._settings.separator));
		if(suggest && suggest._settings.selectAll) {
			suggest.getBody()._cells[0].setValue(0);
		}
	},
	_addValue: function(newValue){
		var suggest = $$(this.config.suggest);
		var list = suggest.getList();
		var item = list.getItem(newValue);

		if(item){
			var values = suggest.getValue();
			if(values && typeof values == "string")
				values = values.split(suggest.config.separator);
			values = toArray(values||[]);
			if(values.find(newValue)<0){
				values.push(newValue);
				suggest.setValue(values);
				this.setValue(suggest.getValue());
			}
		}
	},
	_addNewValue: function(value){
		var suggest = $$(this.config.suggest);
		var list = suggest.getList();
		var id;
		value = value.replace(/^\s+|\s+$/g,"");

		if(value){
			for(var i in list.data.pull)
				if(suggest.getItemText(i) == value) id = i;
		}

		if(!id && value) id = list.add({id: value, value: value});

		this._addValue(id);
	},
	_suggest_config:function(value){
		var isObj = !isArray(value) && typeof value == "object" && !value.name,
			suggest = { view:"checksuggest", separator:this.config.separator, buttonText: this.config.buttonText, button: this.config.button },
			combo = this;

		if (this._settings.optionWidth)
			suggest.width = this._settings.optionWidth;

		if (isObj)
			extend(suggest, value, true);

		var view = ui(suggest);
		if(!this._settings.optionWidth)
			view.$customWidth = function(){
				this.config.width = combo._get_input_width(combo._settings);
			};
		view.attachEvent("onBeforeShow",function(node,mode, point){
			if(this._settings.master){
				this.setValue($$(this._settings.master).config.value);

				if($$(this._settings.master).getInputNode().value || this.isVisible()){
					this.getList().refresh();
					this._dont_unfilter = true;
				}
				else
					this.getList().filter();

				if(node.tagName && node.tagName.toLowerCase() == "input"){
					popup.api.show.apply(this, [node.parentNode,mode, point]);
					return false;
				}
			}

		});

		var list = view.getList();
		if (typeof value == "string")
			list.load(value);
		else if (!isObj)
			list.parse(value);

		//prevent default show-hide logicfunction(){
		view._suggest_after_filter = function(){};

		return view;
	},
	_render_value_block:function(obj, common){
		var id, input, inputAlign,inputStyle, inputValue, inputWidth,
			height, html, label, list, message, padding, readOnly,  width,
			bottomLabel = "",
			top =  this._settings.labelPosition == "top";

		id = "x"+uid();
		width = common._get_input_width(obj);
		inputAlign = obj.inputAlign || "left";

		height = this._inputHeight - 2*$active.inputPadding -2;

		inputValue = (this._inputValue||"");
		list = "<ul class='webix_multicombo_listbox' style='line-height:"+height+"px'></ul>";

		inputWidth = Math.min(width,(common._inputWidth||7));

		inputStyle = "width: "+inputWidth+"px;height:"+height+"px;max-width:"+(width-20)+"px";

		readOnly = obj.readonly?" readonly ":"";
		input = "<input id='"+id+"' role='combobox' aria-multiline='true' aria-label='"+template.escape(obj.label)+"' tabindex='0' type='text' class='webix_multicombo_input' "+readOnly+" style='"+inputStyle+"' value='"+inputValue+"'/>";
		html = "<div class='webix_inp_static' onclick='' style='line-height:"+height+"px;width: " + width + "px;  text-align: " + inputAlign + ";height:auto' >"+list+input +"</div>";

		label = common.$renderLabel(obj,id);

		padding = this._settings.awidth - width - $active.inputPadding*2;
		message = (obj.invalid ? obj.invalidMessage : "") || obj.bottomLabel;
		if (message)
			bottomLabel =  "<div class='webix_inp_bottom_label' style='width:"+width+"px;margin-left:"+Math.max(padding,$active.inputPadding)+"px;'>"+message+"</div>";

		if (top)
			return label+"<div class='webix_el_box' style='width:"+this._settings.awidth+"px; '>"+html+bottomLabel+"</div>";
		else
			return "<div class='webix_el_box' style='width:"+this._settings.awidth+"px; min-height:"+this._settings.aheight+"px;'>"+label+html+bottomLabel+"</div>";
	},
	_getValueListBox: function(){
		return this._getBox().getElementsByTagName("UL")[0];
	},

	_set_inner_size: function(){
		var popup = this.getPopup();
		if(popup){

			var textArr = (popup ? popup.setValue(this._settings.value) : null);
			if(popup._toMultiValue)
				this._settings.value = popup._toMultiValue(this._settings.value);
			var html = "";
			var listbox = this._getValueListBox();
			var text = textArr && textArr.length;
			if(text){
				var height = this._inputHeight - 2*$active.inputPadding - 8;
				var values = this._settings.value;
				if(typeof values == "string")
					values = values.split(this._settings.separator);

				if(this._settings.tagMode){
					for(var i=0; i < textArr.length;i++){
						var content = "<span>"+textArr[i]+"</span><span class='webix_multicombo_delete' role='button' aria-label='"+i18n.aria.removeItem+"'>x</span>";
						html += "<li class='webix_multicombo_value' style='line-height:"+height+"px;' optvalue='"+ values[i]+"'>"+content+"</li>";
					}
				}
				else{
					html += "<li class='webix_multicombo_tag' style='line-height:"+height+"px;'><span>"+this._settings.tagTemplate(values)+"</span></li>";
				}

			}
			listbox.innerHTML = html;
			// reset placeholder
			var inp = this.getInputNode();
			if(this._settings.placeholder){
				if(text){
					inp.placeholder = "";
					if(!inp.value && inp.offsetWidth > 20)
						inp.style.width = "20px";
				}
				else if(!inp.value){
					inp.placeholder = this._settings.placeholder;
					inp.style.width = this._get_input_width(this._settings)+"px";
				}
			}

			if(!this._settings.tagMode && listbox.firstChild)
				inp.style.width = this._getMultiComboInputWidth() +"px";
		}
		this._resizeToContent();
	},
	_focusAtEnd: function(inputEl){
		inputEl = inputEl||this.getInputNode();
		if (inputEl){
			if(inputEl.value.length){
				if (inputEl.createTextRange){
					var FieldRange = inputEl.createTextRange();
					FieldRange.moveStart("character",inputEl.value.length);
					FieldRange.collapse();
					FieldRange.select();
				}else if (inputEl.selectionStart || inputEl.selectionStart == "0") {
					var elemLen = inputEl.value.length;
					inputEl.selectionStart = elemLen;
					inputEl.selectionEnd = elemLen;
					inputEl.focus();
				}
			}else{
				inputEl.focus();
			}
		}
	},
	_resizeToContent: function(){
		var top = this._settings.labelPosition == "top";
		var inputDiv = this._getInputDiv();
		var inputHeight = Math.max(inputDiv.offsetHeight+ 2*$active.inputPadding, this._inputHeight);

		if(top)
			inputHeight += this._labelTopHeight;

		inputHeight += this._settings.bottomPadding ||0;

		var sizes = this.$getSize(0,0);

		if(inputHeight != sizes[2]){
			var cHeight = inputDiv.offsetHeight + (top?this._labelTopHeight:0);

			var topView =this.getTopParentView();
			clearTimeout(topView._template_resize_timer);
			topView._template_resize_timer = delay(function(){

				var calcHeight = cHeight + 2*$active.inputPadding;
				if (this.config.height != calcHeight){
					this.config.height = calcHeight;
					this.resize();
				}

				if(this._typing){
					this._focusAtEnd(this.getInputNode());
					this._typing = false;
				}
				if(this._enter){
					if(!this._settings.keepText)
						this.getInputNode().value = "";
					else
						this.getInputNode().select();
					this._enter = false;
				}
				if(this.getPopup().isVisible()||this._typing){
					this.getPopup().show(this._getInputDiv());
				}

			}, this);
		}
		if(this._enter){
			this.getInputNode().select();
		}
	},
	_getInputDiv: function(){
		var parentNode = this._getBox();
		var nodes = parentNode.childNodes;
		for(var i=0; i < nodes.length; i++){
			if(nodes[i].className && nodes[i].className.indexOf("webix_inp_static")!=-1)
				return nodes[i];
		}
		return parentNode;
	},
	getInputNode: function(){
		return this._getBox().getElementsByTagName("INPUT")[0];
	},
	$setValue:function(){
		if (this._rendered_input)
			this._set_inner_size();
	},
	getValue:function(config){
		if(typeof config == "object" && config.options)
			return this._getSelectedOptions();

		var value = this._settings.value;
		if (!value) return "";
		return (typeof value != "string"?value.join(this._settings.separator):value);
	},
	getText:function(){
		var value = this._settings.value;
		if(!value) return "";
		
		if(typeof value == "string")
			value = value.split(this._settings.separator);

		var text = [];
		for(var i = 0; i<value.length; i++)
			text.push(this.getPopup().getItemText(value[i]));
		return text.join(this._settings.separator);
	},
	_getSelectedOptions: function(){
		var i, item, popup,
			options = [],
			value = this._settings.value;

		if (!value) return [];

		if(typeof value == "string")
			value = value.split(this._settings.separator);

		popup = this.getPopup();

		for(i = 0; i < value.length; i++){
			item = popup.getList().getItem(value[i]) || (popup._valueHistory?popup._valueHistory[value[i]]:null);
			if(item)
				options.push(item);
		}

		return options;
	},
	$setSize:function(x,y){
		var config = this._settings;
		if(base.api.$setSize.call(this,x,y)){
			if (!x || !y) return;
			if (config.labelPosition == "top"){
				config.labelWidth = 0;
			}
			this.render();
		}
	},
	_calcInputWidth: function(value){
		var tmp = document.createElement("span");
		tmp.className = "webix_multicombo_input";
		tmp.style.visibility = "visible";
		tmp.style.height = "0px";
		tmp.innerHTML = value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
		document.body.appendChild(tmp);
		var width = tmp.offsetWidth+10;
		document.body.removeChild(tmp);
		return width;
	},
	_getMultiComboInputWidth: function(){
		var listbox = this._getValueListBox();
		return listbox.offsetWidth - listbox.firstChild.offsetWidth - 17;
	},
	_init_onchange:function(){
		// input focus and focus styling
		_event(this._getBox(),"click",function(){
			this.getInputNode().focus();
		},{bind:this});
		_event(this.getInputNode(),"focus",function(){
			if(this._getBox().className.indexOf("webix_focused") == -1)
				this._getBox().className += " webix_focused";

		},{bind:this});
		_event(this.getInputNode(),"blur",function(){
			this._getBox().className = this._getBox().className.replace(" webix_focused","");
		},{bind:this});

		// need for clear click ("x") in IE
		_event(this.getInputNode(),"input",function(){
			if(!this.getInputNode().value && this._inputValue){
				this.getInputNode().style.width = "20px";
				this._inputWidth = 20;

				this._inputValue = "";
				this._typing = true;

				this.getPopup().show(this._getInputDiv());
				this._resizeToContent();
			}
		},{bind:this});
		// resize
		_event(this.getInputNode(),"keyup",function(e){
			var inp = this.getInputNode();
			var calcWidth, width;

			e = (e||event);
			// to show placeholder
			if(this._settings.placeholder && !this._settings.value && !inp.value)
				width = this._get_input_width(this._settings);
			else{
				width = calcWidth = this._calcInputWidth(inp.value)+10;
				if(!this._settings.tagMode && this._getValueListBox().firstChild)
					width = this._getMultiComboInputWidth();
			}

			inp.style.width = width +"px";

			if(calcWidth!=this._inputWidth){
				if(this._settings.keepText || e.keyCode !=13){
					this._inputValue = inp.value;
				}
				else{
					this._inputValue = false;
				}
				this._typing = true;

				if(this._inputWidth)
					this.getPopup().show(this._getInputDiv());

				this._inputWidth = calcWidth||width;
				this._resizeToContent();
			}
			else if(this._windowHeight != this.getPopup().$height){
				this.getPopup().show(this._getInputDiv());
			}

			if(inp.value.indexOf(this._settings.separator) > -1 && this._settings.tagMode){
				var newValue = inp.value.replace(this._settings.separator, "");
				if (newValue){
					if (this._settings.newValues)
						this._addNewValue(newValue);
					else{
						var newId = this.getPopup().getItemId(newValue);
						if (newId)
							this._addValue(newId);
					}
				}

				if(this._settings.keepText){
					this._inputValue = newValue;
					inp.value = newValue;
					this._enter = true;
					this._typing = true;
					this._resizeToContent();
				} else{
					inp.value = "";
				}
			}
		},{bind:this});

		// remove the last value on Backspace click
		_event(this.getInputNode(),"keydown",function(e){
			this._enter = false;
			if (this.isVisible()){
				e = (e||event);
				var node = this._getValueListBox().lastChild;
				this._windowHeight = this.getPopup().$height;
				if(e.keyCode == 8 && node){
					if(!this.getInputNode().value && ((new Date()).valueOf() - (this._backspaceTime||0) > 100)){
						this._typing = true;
						this._removeValue(node.getAttribute("optvalue"));
					}
					else{
						this._backspaceTime = (new Date()).valueOf();
					}
				}

				if(e.keyCode == 13 || e.keyCode == 9){
					var input = this.getInputNode();
					var id = "";
					var suggest = $$(this._settings.suggest);
					var list = suggest.getList();
					// if no selected options

					if(!list.getSelectedId()){
						if (input.value)
							id = suggest.getSuggestion(input.value);

						if(this._settings.newValues){
							if(e.keyCode == 13)
								this._enter = true;
							this._addNewValue(input.value);
							if(this._settings.keepText)
								this._inputValue = input.value;
							else
								input.value = "";
						}
						else if(id){
							if(e.keyCode == 9){
								this._typing = false;
								this._inputValue = "";
								this._inputWidth = 10;
								input.value = "";
								this._addValue(id);
							}
							else{
								this._enter = true;
								this._addValue(id);
								if(this._settings.keepText)
									this._inputValue = input.value;
								else
									input.value = "";
							}
						}

					}
					if(e.keyCode == 13){
						this._enter = true;
						this._typing = true;
						if(this._settings.keepText)
							this._inputValue = input.value;
						else
							input.value = "";
					}

				}
			}
		},{bind:this});
		$$(this._settings.suggest).linkInput(this);
	}
};


const view = protoUI(api,  richselect.view);
export default {api, view};