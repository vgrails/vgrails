import {bind, extend} from "../../webix/helpers";
import {ui, $$} from "../../ui/core";

import datafilter from "../../ui/datafilter";
import i18n from "../../webix/i18n";


const Mixin = {
	headermenu_setter:function(value){
		if (value){
			if (value.data)
				this._preconfigured_hmenu = true;
			value = this._init_hmenu_once(value);
		}
		return value;
	},
	_init_hmenu_once:function(value){

		var menuobj = {
			view:"contextmenu",
			template:"<span class='webix_icon {common.hidden()}'></span> &nbsp; #value#",
			type:{
				hidden:function(obj){
					if (obj.hidden)
						return "wxi-eye-slash";
					else
						return "wxi-eye";
				}
			},
			on:{
				onMenuItemClick:bind(function(id){
					var menu = $$(this._settings.headermenu);
					var state = menu.getItem(id).hidden;
					menu.getItem(id).hidden = !state;
					menu.refresh(id);
					menu.$blockRender = true;

					var opts = {spans:typeof value == "object" && value.spans};
					if (state)
						this.showColumn(id, opts);
					else
						this.hideColumn(id, opts);

					menu.$blockRender = false;
					return false;
				}, this)
			},
			data:[]
		};
		if (typeof value == "object")
			extend(menuobj, value, true);

		var menu = ui(menuobj);

		menu.attachTo(this._header);
		this._destroy_with_me.push(menu);
		this.attachEvent("onStructureLoad", this._generate_menu_columns);
		this.attachEvent("onStructureUpdate", this._generate_menu_columns);

		this._init_hmenu_once = function(v){ return v; };
		return menu._settings.id;
	},
	_generate_menu_columns:function(){
		var menu = $$(this._settings.headermenu);
		var hhash = this._hidden_column_hash;

		if (menu.$blockRender) return;
		if (this._preconfigured_hmenu){
			menu.data.each(function(obj){
				obj.hidden = !!hhash[obj.id];
			});
			menu.refresh();
			return;
		}
 
		var data = [];
		var order = this._hidden_column_order;
		//if we have not hidden columns, hidden order is empty
		//fallback to the default column order
		if (!order.length)
			order = this._columns;
		for(var  i = 0; i<order.length; i++){
			var column = this.getColumnConfig(order[i].id || order[i]);
			var content = column.header[0];
			var hidden = !!hhash[column.id];
			if (column.headermenu !== false && content)
				data.push({
					id:column.id,
					value:hidden?content.text:(content.groupText || content.text),
					hidden:hidden
				});
		}

		if (data.length)
			menu.data.importData(data);
	}
};

datafilter.headerMenu = {
	getValue:function(){},
	setValue:function(){},
	refresh:function(master, node){
		if (!master._settings.headermenu){
			master.define("headermenu", true);
			master._generate_menu_columns();
		}

		node.onclick = function(){
			$$(master.config.headermenu).show(node);
		};
	},
	render:function(){
		return "<span class='webix_icon wxi-columns' role='button' tabindex='0' aria-label='"+i18n.aria.headermenu+"'>";
	}
};

export default Mixin;