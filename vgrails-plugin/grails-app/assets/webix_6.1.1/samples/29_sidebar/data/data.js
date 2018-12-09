var menu_data = [
	{id: "dashboard", icon: "mdi mdi-view-dashboard", value: "Dashboards",  data:[
		{ id: "dashboard1", value: "Dashboard 1"},
		{ id: "dashboard2", value: "Dashboard 2"}
	]},
	{id: "layouts", icon: "mdi mdi-view-column", value:"Layouts", data:[
		{ id: "accordions", value: "Accordions"},
		{ id: "portlets", value: "Portlets"}
	]},
	{id: "tables", icon: "mdi mdi-table", value:"Data Tables", data:[
		{ id: "tables1", value: "Datatable"},
		{ id: "tables2", value: "TreeTable"},
		{ id: "tables3", value: "Pivot"}
	]},
	{id: "uis", icon: "mdi mdi-puzzle", value:"UI Components", data:[
		{ id: "dataview", value: "DataView"},
		{ id: "list", value: "List"},
		{ id: "menu", value: "Menu"},
		{ id: "tree", value: "Tree"}
	]},
	{id: "tools", icon: "mdi mdi-calendar", value:"Tools", data:[
		{ id: "kanban", value: "Kanban Board"},
		{ id: "pivot", value: "Pivot Chart"},
		{ id: "scheduler", value: "Calendar"}
	]},
	{id: "forms", icon: "mdi mdi-pencil", value:"Forms",  data:[
		{ id: "buttons", value: "Buttons"},
		{ id: "selects", value: "Select boxes"},
		{ id: "inputs", value: "Inputs"}
	]},
	{id: "demo", icon: "mdi mdi-book", value:"Documentation"}
];


var menu_data_multi  = [
    { id: "structure", icon: "mdi mdi-view-column", value:"Structuring", data:[
        { id: "layouts", icon:"mdi mdi-circle", value:"Layouts", data:[
        	{ id: "layout", icon:"mdi mdi-circle-outline", value: "Layout"},
            { id: "flexlayout", icon:"mdi mdi-circle-outline", value: "Flex Layout"},
            { id:"strict", icon:"mdi mdi-circle-outline", value:"Precise Positioning", data:[
				{ id: "gridlayout", icon:"mdi mdi-circle-outline", value: "Grid Layout"},
            	{ id: "dashboard",  icon:"mdi mdi-circle-outline", value: "Dashboard"},
            	{ id: "abslayout", icon:"mdi mdi-circle-outline", value: "Abs Layout"}
            ]},
            { id: "datalayouts", icon:"mdi mdi-circle-outline", value:"Data Layouts",  data:[
            	{ id: "datalayout", icon:"mdi mdi-circle-outline", value: "Data Layout"},
            	{ id: "flexdatalayout",  icon:"mdi mdi-circle-outline", value: "Flex Data Layout"},
            ]}
        ]},
        {id: "multiviews", icon:"mdi mdi-circle", value:"Multiviews", data:[
            { id: "multiview", icon:"mdi mdi-circle-outline", value: "MultiView"},
            { id: "tabview",  icon:"mdi mdi-circle-outline", value: "TabView"},
            { id: "accordion",  icon:"mdi mdi-circle-outline", value: "Accordion"},
            { id: "carousel", icon:"mdi mdi-circle-outline", value: "Carousel"}
        ]}
    ]},
    {id: "tools", icon: "mdi mdi-calendar", value:"Tools", data:[
        { id: "kanban", icon:"mdi mdi-circle", value: "Kanban Board"},
        { id: "pivot", icon:"mdi mdi-circle", value: "Pivot Chart"},
        { id: "scheduler", icon:"mdi mdi-circle", value: "Calendar"}
    ]},
    {id: "forms", icon: "mdi mdi-pencil", value:"Forms",  data:[
    	{id: "buttons", icon:"mdi mdi-circle", value: "Buttons", data:[
    		{id: "button", icon:"mdi mdi-circle-outline", value: "Buttons"},
    		{id: "segmented", icon:"mdi mdi-circle-outline", value: "Segmented"},
    		{id: "toggle", icon:"mdi mdi-circle-outline", value: "Toggle"},
    	]},
    	{ id:"texts", icon:"mdi mdi-circle", value:"Text Fields", data:[
    		{ id: "text", icon:"mdi mdi-circle-outline", value: "Text"},
    		{ id: "textarea", icon:"mdi mdi-circle-outline", value: "Textarea"},
    		{ id: "richtext", icon:"mdi mdi-circle-outline", value: "RichText"}
    	]},
    	{ id:"selects", icon:"mdi mdi-circle", value:"Selectors", data:[
    		{ id:"single", icon:"mdi mdi-circle-outline", value:"Single value", data:[
				{ id: "combo", icon:"mdi mdi-circle-outline", value: "Combo"},
				{ id: "richselect", icon:"mdi mdi-circle-outline", value: "RichSelect"},
				{ id: "select", icon:"mdi mdi-circle-outline", value: "Select"}
    		]},
    		{ id:"multi", icon:"mdi mdi-circle-outline", value:"Multiple values", data:[
    			{ id: "multicombo", icon:"mdi mdi-circle-outline", value: "MultiCombo"},
				{ id: "multiselect", icon:"mdi mdi-circle-outline", value: "MultiSelect"}
    		]}
    	]}
    ]},
    {id: "demo", icon: "mdi mdi-book", value:"Documentation"}
];