

const Mixin = {
	topSplit_setter:function(value){
		if (this.data)
			this.data.$freeze = value;
		return value;
	},
	freezeRow:function(id, mode){
		var index,
			freezeLine = this._settings.topSplit,
			order = this.data.order,
			filterOrder = this.data._filter_order;

		function moveFrozenRow(index, id, mode, order, skipSplitChange){
			var i;
			if (mode && index >= freezeLine){
				if(!skipSplitChange)
					freezeLine++;
				for (i=index; i >= freezeLine; i--){
					order[i] = order[i-1];
				}
				order[freezeLine-1] = id;
			}
			if (!mode && index <freezeLine){
				if(!skipSplitChange)
					freezeLine--;
				for (i=index; i<freezeLine; i++){
					order[i] = order[i+1];
				}
				order[freezeLine] = id;
			}
		}

		if(id){
			index = this.getIndexById(id);
			id = id.toString();
			moveFrozenRow(index, id, mode, order);
			if(filterOrder)
				moveFrozenRow(filterOrder.find(id), id, mode, filterOrder, true);
		}
		else if(!mode)
			freezeLine = 0; // unfreeze all rows

		this.define("topSplit", freezeLine);
		this.refresh();
	}
};

export default Mixin;