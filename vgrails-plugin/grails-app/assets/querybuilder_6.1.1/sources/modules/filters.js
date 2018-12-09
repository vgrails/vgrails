const locale = webix.i18n.querybuilder;

const text = { "number" : "text", "date" : "datepicker" };
const range = { "number" : "rangeslider", "date" : "daterangepicker" };
const str = { "string" : "text" };

const filters = [
	{id: "less", name:  locale.less, fn: (a, b) => a < b, type: text },
	{id: "less_or_equal", name: locale.less_or_equal, fn: (a, b) => a <= b, type: text  },
	{id: "greater", name: locale.greater, fn: (a, b) => a > b, type: text },
	{id: "greater_or_equal", name: locale.greater_or_equal, fn: (a, b) => a >= b, type: text },
	{id: "between", name: locale.between, fn: (a, b, c) => (!b || a > b) && (!c || a < c), type: range },
	{id: "not_between", name: locale.not_between, fn: (a, b, c) => (!b || a <= b) || (!c || a >= c), type: range },
	{id: "begins_with", name: locale.begins_with, fn: (a, b) => a.lastIndexOf(b, 0) === 0, type: str},
	{id: "not_begins_with", name: locale.not_begins_with, fn: (a, b) => a.lastIndexOf(b, 0) !== 0, type: str},
	{id: "contains", name: locale.contains, fn: (a, b) => a.indexOf(b) !== -1, type: str},
	{id: "not_contains", name: locale.not_contains, fn: (a, b) => b.indexOf(a) === -1, type: str},
	{id: "ends_with", name: locale.ends_with, fn: (a, b) => a.indexOf(b, a.length - b.length) !== -1, type: str},
	{id: "not_ends_with", name: locale.not_ends_with, fn: (a, b) => a.indexOf(b, a.length - b.length) === -1, type: str},
	{id: "is_empty", name: locale.is_empty, fn: (a) => a.length === 0, type: { "string": "none" }},
	{id: "is_not_empty", name: locale.is_not_empty, fn: (a) => a.length > 0, type: { "string": "none" }},
	{id: "equal", name: locale.equal, fn: (a, b) => a === b, type: { any : "text", "date" : "datepicker" }},
	{id: "not_equal", name: locale.not_equal, fn: (a, b) => a !== b, type: { any : "text", "date" : "datepicker" }},
	{id: "is_null", name: locale.is_null, fn: (a) => a === null, type: { "any" : "none" }},
	{id: "is_not_null", name: locale.is_not_null, fn: (a) => a !== null, type: { "any" : "none" }}
];

export default filters;