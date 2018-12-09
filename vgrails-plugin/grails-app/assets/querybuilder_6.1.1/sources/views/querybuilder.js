import "./querybuilderline";

import sort from "../modules/sort";
import filters from "../modules/filters";
import sql from "../modules/sql";

const qb = {
	name: "querybuilder",
	defaults: {
		type: "space",
		borderless: true,

		fields: [],
		sorting: false,
		filtering: true,
		glue: "and",

		columnMode: false,
		maxLevel: 999,
		inputMaxWidth: 210
	},
	$init(config) {
		config.filters = config.filters || filters;
		if (config.filters && !config.filters.add)
			config.filters = new webix.DataCollection({ data: config.filters });

		this.$view.className += " webix_qb_wrap";
		this.$ready.unshift(this._setLayout);
	},
	_setLayout() {
		let levelIndicator = this.config.maxLevel > 1 ? true:false;
		const locale = webix.i18n.querybuilder;

		let cols = [{
			$id:"buttons",
			borderless: true,
			template:() => {
				const and = this.config.glue === "and";
				return `
<div class="webix_qb_buttons">
<button class="webix_qb_and${and?" webix_active":""}">${locale.and}</button>
<button class="webix_qb_or ${!and?" webix_active":""}">${locale.or}</button>
</div>`;
			},
			onClick:{
				webix_qb_and: () => this._updateGlue("and"),
				webix_qb_or: () => this._updateGlue("or")
			},
			minHeight:35,
			width: 87,
		},
		{
			$id:"rows",
			rows: [
				{
					borderless: true,
					template: `
<div class="webix_qb_add">
${levelIndicator?`<button class="webix_qb_add_group">+ ${locale.add_group}</button>`:""}
<button class="webix_qb_add_rule">+ ${locale.add_rule}</button>
</div>`,
					onClick: {
						webix_qb_add_rule:() => this._addRule(),
						webix_qb_add_group:() => this._addGroup(true)
					},
					height: 22,
					minWidth: 220
				}],
			margin: 5
		}];

		this._init_sorting();

		if (this.config.filtering === false){
			this.config.padding = 0;
			this.cols_setter([{ height: 1}]);
		} else {
			this.cols_setter(cols);
		}
	},
	_updateGlue(mode){
		this.config.glue = mode;
		this.queryView({$id:"buttons"}).refresh();
		this._callChangeMethod();
	},
	_addRow(ui) {
		let layout = this.queryView({$id:"rows"});
		let kids = layout.getChildViews();
		return webix.$$(layout.addView(ui, kids.length-1));
	},
	_deleteRow(el) {
		let layout = this.queryView({$id:"rows"});
		layout.removeView(el);
		this._callChangeMethod();

		if (layout.getChildViews().length <= 1) {
			const parent = this._getParentQuery();
			if (parent){
				parent._deleteRow(this.config.id);
			}
		}
	},
	_addRule() {
		const line = this._addRow({
			view: "querybuilderline",

			inputMaxWidth: this.config.inputMaxWidth,
			fields: this.config.fields,
			filters: this.config.filters,

			columnMode: this.config.columnMode
		});

		return line;
	},
	_addGroup(withRow) {
		let newView = this._addRow({
			view: "querybuilder",

			inputMaxWidth: this.config.inputMaxWidth,
			fields: this.config.fields,
			filtes: this.config.filters,

			columnMode: this.config.columnMode,
			maxLevel:this.config.maxLevel-1
		});

		if (withRow){
			newView._addRule();
		}
		return newView;
	},
	_getParentQuery() {
		return  this.queryView({ view:this.config.view }, "parent");
	},
	_getTopQuery(){
		let parent, now = this;
		while((parent = now._getParentQuery())){
			now = parent;
		}
		return now;
	},
	_callChangeMethod() {
		this._getTopQuery().callEvent("onChange", []);
	},
	
	$getSize(dx, dy){
		if(this.config.sorting && !this.config.filtering){
			dy = dy+50;
		}
		return webix.ui.layout.prototype.$getSize.call(this, dx, dy);
	},
	_setRules(rules) {
		if (rules) {
			rules.forEach(el => {
				let rule;
				if (!el.glue) {
					rule = this._addRule();
				} else {
					rule = this._addGroup();
				}
				webix.$$(rule).setValue(el);
			});
		}
	},
	eachLine(cb){
		let cells = this.queryView(a => !!a.getFilterHelper, "all");
		for (var i=0; i<cells.length; i++) {
			cb(cells[i]);
		}
	},
	getValue() {
		const rules = [];
		this.eachLine(a => {
			const line = a.getValue();
			if (line)
				rules.push(line);
		});

		if(rules.length) {
			return {glue: this.config.glue, rules};
		} else {
			return null;
		}
	},
	setValue(value) {
		if (value.fields){
			this.config.fields = value.fields;
		}

		if (value.query){
			value = value.query;
		}

		if (value.glue){
			this.config.glue = value.glue;
		}

		this.reconstruct();
		if (value.rules){
			this._setRules(value.rules);
		}

		this.queryView({ $id: "buttons" }).refresh();

		if (this.config.sorting){
			this._setSortingValues(value);
		}

		this._callChangeMethod();
	},
	focus() {
		const line = this.queryView({ view:"querybuilderline" });
		if (line) line.focus();
	},

	getFilterHelper() {
		let childsArr = [];
		let glue = this.config.glue;

		this.eachLine(a => {
			var sub = a.getFilterHelper();
			if (sub)
				childsArr.push(sub);
		});

		if(!childsArr.length)
			return () => true;

		return obj => {
			let result;
			if (glue === "and") {
				result = true;
				childsArr.forEach(function(item) {
					if (!item(obj)) {
						result = false;
					}
				});
			} else {
				result = false;
				childsArr.forEach(function(item) {
					if (item(obj)) {
						result = true;
					}
				});
			}
			return result;
		};
	}
};

webix.protoUI(qb, sort, sql, webix.ui.layout, webix.EventSystem);