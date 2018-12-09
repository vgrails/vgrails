function _buttonCreate(label, click, type) {
	return {
		view:"button",
		value:label,
		align: "right",
		width:120,
		type,
		click
	};
}

webix.ui.datafilter.queryBuilder = webix.extend({
	getValue(node) {
		let master = webix.$$(node._comp_id);
		return master.getValue();
	},
	setValue(node, value) {
		let master = webix.$$(node._comp_id);
		master.setValue(value);
	},
	refresh(master, node, value) {
		master.registerFilter(node, value, this);
		node._comp_id = master._qb.config.id;
		let qb = webix.$$(node._comp_id).getParentView();

		this.setValue(node, value);
		webix.event(node, "click", () => this._filterShow(node, qb));
	},
	render(master, config) {
		const locale = webix.i18n.querybuilder;
		
		config.css = "webix_ss_filter";

		let filter;
		config.prepare = () => { filter = master._qb.getFilterHelper(); };
		config.compare = (v, i, o) => filter(o);
		
		let qb = {
			view: "querybuilder"
		};
		if (config.queryConfig)
			webix.extend(qb, config.queryConfig);

		let popupView;
		let buttonSave = _buttonCreate(locale.filter, () => {
			if(master._qb) {
				let helper = master._qb.getFilterHelper();
				master.filter(helper);
				popupView.hide();
			}
		}, "form");
		let buttonCancel = _buttonCreate(locale.cancel, () => {
			popupView.hide();
		});

		let body = {margin:5, rows:[qb, {cols:[ buttonSave, buttonCancel, {} ]}]};
		if(config.sorting) {
			body.rows.push(_buttonCreate(locale.sort, () => {
				if(master._qb) {
					master.sort(master._qb.getSortingHelper());
					popupView.hide();
				}
			}));
		}

		let popup = {
			view:"popup",
			width: 900,
			body
		};

		if(config.popupConfig){
			webix.extend(popup, config.popupConfig, true);
		}

		popupView = webix.ui(popup);
		master._qb = popupView.getBody().getChildViews()[0];
		master.attachEvent("onDestruct", () => {
			popupView.destructor();
		});

		return "<div class=\"webix_qb_filter\"><i class=\"webix_qb_filter_icon\" aria-hidden=\"true\"></i></div>"+(config.label||"");
	},
	_filterShow(node, qb) {
		qb.show(node.querySelector(".webix_qb_filter"));
	}
}, webix.EventSystem);
