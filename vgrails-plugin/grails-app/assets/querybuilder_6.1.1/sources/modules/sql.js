const sql = {
	$init(){
		this.config.sqlDateFormat = this.config.sqlDateFormat || webix.Date.dateToStr("%Y-%m-%d %H:%i:%s", false);
	},
	sqlOperators: {
		equal:            { op: "= ?" },
		not_equal:        { op: "!= ?" },
		less:             { op: "< ?" },
		less_or_equal:    { op: "<= ?" },
		greater:          { op: "> ?" },
		greater_or_equal: { op: ">= ?" },
		between:          { op: "BETWEEN ?",      sep: " AND " },
		not_between:      { op: "NOT BETWEEN ?",  sep: " AND " },
		begins_with:      { op: "LIKE(?)",        mod: "{0}%" },
		not_begins_with:  { op: "NOT LIKE(?)",    mod: "{0}%" },
		contains:         { op: "LIKE(?)",        mod: "%{0}%" },
		not_contains:     { op: "NOT LIKE(?)",    mod: "%{0}%" },
		ends_with:        { op: "LIKE(?)",        mod: "%{0}" },
		not_ends_with:    { op: "NOT LIKE(?)",    mod: "%{0}" },
		is_empty:         { op: "= \"\"", no_val: true },
		is_not_empty:     { op: "!= \"\"", no_val: true },
		is_null:          { op: "IS NULL", no_val: true },
		is_not_null:      { op: "IS NOT NULL", no_val: true }
	},
	toSQL(config) {
		config = config || this.getValue();
		
		const values = [];
		const code = this._getSqlString(config, values, false);
		const sql = this._placeValues(code, values);
		return { code, sql, values };
	},
	_placeValues(code, values){
		let index = 0;
		return code.replace(/\?/g, function(){
			const value = values[index++];
			if (typeof value === "string")
				return `"${value}"`;
			else
				return value;
		});
	},
	_getSqlString(config, values, nested) {
		if(!config) {
			return "";
		}

		if (config.rules && config.rules.length){
			let sql = config.rules.map(a => this._getSqlString(a, values, true)).join(" "+config.glue.toUpperCase()+" ");
			if (nested){
				sql = `( ${sql} )`;
			}
			return sql;
		}
		return this._convertValueToSql(config, values);
	},
	_convertValueToSql(el, values) {
		const format = this.config.sqlDateFormat;
		const value = el.value;

		var match = this.sqlOperators[el.rule];
		if (match){
			let operator = this.sqlOperators[el.rule];
			
			if(!operator.no_val) {
				if(operator.mod) {
					values.push( operator.mod.replace("{0}", `${value}`) );
				} else {
					if(Array.isArray(value)) {
						values.push(value[0]);
						values.push(value[1]);
					} else if (value.start || value.end){
						values.push(format(value.start));
						values.push(format(value.end));
					} else if(value instanceof Date){
						values.push( format(value) );
					} else
						values.push(value);
				}
			}

			let glue = operator.op;
			if (operator.sep)
				glue = glue.replace("?", `?${operator.sep}?`);

			return `${el.key} ${glue} `;
		}

		return "";
	}
};

export default sql;