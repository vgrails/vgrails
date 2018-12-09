webix.protoUI({
	name: "querybuilderline",
	defaults: {
		padding: 0, margin: 10, borderless: true, value:{}
	},
	$init(config) {
		const locale = webix.i18n.querybuilder;

		this.$view.className += " webix_qb_line";
		const keyoptions = [
			...config.fields
		];

		const elements = [
			this._selectConfig(config, "webix_qb_value_select", "key", keyoptions),
			this._selectConfig(config, "webix_qb_rule_select", "rule", { body:{ data:[], template:"#name#"}}, true),
			{view:"button", type:"htmlbutton", css:"webix_qb_close", width:26, inputWidth:26, name:"close",
				label: `<span class="webix_icon wxi-trash" title="${locale.delete_rule}"></span>`, click:() => {
					this._getParentQuery()._deleteRow(this);
				}
			}
		];

		if (config.columnMode){
			config.css = (config.css || "") + " webix_column_qb";
			config.margin = config.margin || 0;
			config.rows = elements;
		} else {
			elements.push({gravity: 0.001});
			config.cols = elements;
		}

	},
	_selectConfig(config, css, name, options, hidden){
		const select = {
			view: "richselect",
			minWidth:100,
			maxWidth: config.inputMaxWidth,
			inputPadding: 0,
			options,
			hidden,
			css,
			name,
			on:{
				onChange: () => this._onChange(name)
			}
		};

		return select;
	},
	_inputConfig(config, type, value, hidden){
		let input;
		if (typeof type === "string"){
			input = {
				view:type
			};
		} else {
			input = type;
		}

		input.name="value";
		input.maxWidth=config.inputMaxWidth;
		input.value=value;
		input.on = {
			onChange: () => this._onChange("value")
		};
		input.hidden= hidden;

		if (type === "rangeslider"){
			input.min = 0;
			input.max = 100;
			input.value = [0, 100];
			input.moveTitle = false;
			input.title = obj => {
				const v = obj.value;
				return (v[0] === v[1] ? v[0] : v[0] + " - " + v[1]);
			};
		}

		return input;
	},
	getValue() {
		var state = this.config.value;
		if (state.rule && (
			state.value !== "" ||
			state.rule === "equal" ||
			state.rule === "not_equal" ||
			!this.elements.value
		))
			return this.config.value;
		return null;
	},
	setValue(value) {
		this.config.value = value;
		this._silent = true;

		if (value && value.key){
			this.elements.key.setValue(value.key);
			if (value.rule){
				this.elements.rule.setValue(value.rule);
				if (value.value)
					this.elements.value.setValue(value.value);
			}
		}
		this._silent = false;
	},
	_onChange(key) {
		var select = this.elements[key];
		var value = this.config.value;

		value[key] = select.getValue();
		this._adjustVisible(key, value);

		if (!this._silent){
			this._getTopQuery().callEvent("onChange", [this]);
			this._getTopQuery().callEvent("onKeySelect", [this]);
		}
	},
	_adjustVisible(type, data){
		const field = this.elements.key.getList().getItem(data.key);
		const rule = this.elements.rule;
		let value = this.elements.value;

		if (type === "key"){
			this._updateRuleField(data, field, rule, value);
		} else if (type === "rule"){
			this._updateValueField(data, field, rule, value);
		}
	},
	_fillRules(field, rule){
		const filters = this.config.filters;
		filters.filter(a => {
			return a.type[field.type] || a.type["any"];
		});
		rule.getList().data.importData(filters.data);
	},
	_updateRuleField(data, field, rule, value){
		const oldrule = rule.getValue();
		const filter = oldrule ? rule.getList().getItem(oldrule).type : "";

		if (!this._silent && !filter[field.type])
			data.rule = data.value = "";

		if (data.key){
			rule.show();
			this._fillRules(field, rule);
			rule.setValue(data.rule);

			this._updateValueField(data, field, rule, this.elements.value);
		} else {
			rule.hide();
			if (value)
				value.hide();
		}
	},
	_updateValueField(data, field, rule, value){
		if (data.rule){
			let filter = rule.getList().getItem(data.rule);
			let editor = filter.type[field.type] || filter.type["any"];
			
			if (value && editor === value.name){
				value.show();
				value.setValue(data.value);
			} else {
				if (!this._silent)
					data.value = "";
				if (value)
					this.removeView(value);
				if (editor !== "none"){
					this.addView(this._inputConfig(this.config, editor, data.value), 2);				
				}
			}
		} else {
			if (!this._silent)
				data.value = "";
			if (value)
				value.hide();
		}
	},
	_getParentQuery() {
		return this.queryView({ view:"querybuilder" }, "parent");
	},
	_getTopQuery(){
		return this._getParentQuery()._getTopQuery();
	},
	getFilterHelper() {
		const data = this.config.value;
		if (!this.getValue()) return null;

		const filter = this.elements.rule.getList().getItem(data.rule);
		return  obj => filter.fn(obj[data.key], data.value);
	}
},  webix.ui.form, webix.EventSystem);