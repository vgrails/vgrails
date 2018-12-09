import layout from "../views/layout";
import DataLoader from "../core/dataloader";
import {protoUI} from "../ui/core";
import {bind, extend, copy} from "../webix/helpers";


const api = {
	name:"datalayout",
	$init:function(){
		this.data.provideApi(this, true);
		this.data.attachEvent("onStoreUpdated", bind(this.render, this));
	},
	_parse_cells:function(){
		if (!this._origin_cells){
			this._origin_cells = this._collection;
			this._collection = [{}];
		}

		return layout.api._parse_cells.call(this, this._collection);
	},
	setValue:function(obj){
		this.parse(obj);
	},
	getValue:function(){
		var subcount = this._origin_cells.length;
		for (var i = 0; i < this._cells.length; i++) {
			var id = this.data.order[Math.floor(i/subcount)];
			var item = this.data.getItem(id);
			this._save_data(this._cells[i], item);
		}
		return this.data.serialize();
	},
	_save_data:function(view, prop){
		var name = view._settings.name;
		if (name){
			var data = null;
			if (view.getValues) data = view.getValues();
			else if (view.getValue) data = view.getValue();
			else if (view.serialize) data = view.serialize();

			if (name == "$value")
				extend(prop, data, true);
			else 
				prop[name] = data;
		} else {
			var collection = view._cells;
			if (collection)
				for (var i = 0; i < collection.length; i++)
					this._save_data(collection[i], prop);
		}
	},
	_fill_data:function(view, prop){
		var obj, name = view._settings.name;
		if (name){
			if (name == "$value")
				obj = prop;
			else
				obj = prop[name];

			if (view.setValues) view.setValues(obj);
			else if (view.setValue) view.setValue(obj);
			else if (view.parse){
				//make copy of data for treestore parsers
				if (view.openAll)
					obj = copy(obj);
				view.parse(obj);
			}
		} else {
			var collection = view._cells;
			if (collection)
				for (var i = 0; i < collection.length; i++)
					this._fill_data(collection[i], prop);
		}
	},
	render:function(id, obj, mode){
		var subcount = this._origin_cells.length;

		if (id && mode === "update"){
			//update mode, change only part of layout
			var item = this.getItem(id);
			var index = this.getIndexById(id);

			for(let i=0; i<subcount; i++)
				this._fill_data(this._cells[index*subcount+i], item);
			return;
		}

		//full repainting
		var cells = this._collection = [];
		var order = this.data.order;

		for (let i = 0; i < order.length; i++) {
			if (subcount)
				for (let j = 0; j < subcount; j++)
					cells.push(copy(this._origin_cells[j]));
			else
				cells.push(this.getItem(order[i]));
		}

		if (!cells.length) cells.push({});

		this.reconstruct();

		if (subcount)
			for (let i = 0; i < order.length; i++) {
				var prop = this.getItem(order[i]);
				for (let j = 0; j < subcount; j++) {
					var view = this._cells[i*subcount + j];
					this._fill_data(view, prop);
				}
			}
	}
};


const view = protoUI(api,  DataLoader, layout.view);
export default {api, view};