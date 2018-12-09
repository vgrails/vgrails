const sort = {
	_init_sorting:function(){
		if(!this.config.sorting) return;

		const locale = webix.i18n.querybuilder;
		this.$view.innerHTML = "<div class='webix_qb_sorting'></div>";

		this._sortby = webix.ui({
			view:"multiselect",
			label:locale.sortby,
			container:this.$view.childNodes[0],
			suggest: {
				body:{
					data: this.config.fields
				}
			},
			align: "right",
			width: 300,
			labelWidth: 57,
			on: {
				onChange: () => {
					this._callChangeMethod();
				}
			}
		});

		this._sortorder = webix.ui(this._sortSelect = {
			view:"richselect",
			container:this.$view.childNodes[0],
			options:[{ id:"asc", value:locale.asc}, { id:"desc", value:locale.desc}],
			value:"asc",
			width: 80,
			on: {
				onChange: () => {
					if(this._getSortingValues().sortBy) {
						this._callChangeMethod();
					}
				}
			}
		});

		this.attachEvent("onDestruct", function(){
			this._sortby.destructor();
			this._sortorder.destructor();
		});
	},
	_getSortingValues() {
		return { sortBy: this._sortby.getValue(), sortAs: this._sortorder.getValue() };
	},
	_setSortingValues(value) {
		if (value.fields){
			var list = this._sortby.getList();
			list.clearAll();
			list.parse(value.fields);
		}

		this._sortby.setValue(value.sortBy);
		this._sortorder.setValue(value.sortAs);
	},
	getSortingHelper() {
		var state = this._getSortingValues();
		if (!state.sortBy) return null;
		
		let values = state.sortBy.split(",").map(id => {
			var item = this._sortby.getList().getItem(id);
			var type = item.type;
			if (type === "number") type = "int";

			return { 
				by: function(obj){ return obj[id]; },
				as: webix.DataStore.prototype.sorting.as[type]
			};
		});
		
		return function(obj1, obj2){
			var order;
			for (var i=0; i<values.length; i++){
				var sorter = values[i];
				var a = sorter.by(obj1);
				var b = sorter.by(obj2);
				order = sorter.as(a, b);
				if (order !== 0) break;
			}

			return order * ((state.sortAs === "asc") ? 1 : -1);
		};
	}
};

export default sort;