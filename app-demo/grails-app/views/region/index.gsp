<!doctype html>
<html>
<head>
    <title>Welcome to VGrails</title>
    <m:resources />
</head>
<body>

<script type="application/javascript">
    webix.ready(function(){

        <m:topbar id="topbar" />;
        <m:sidebar id="sidebar"/>;
        <m:toolbar id="toolbar" />;

        // var toolbar={
        //     view:"toolbar",
        //     height:44,
        //     cols: [
        //         { view:"button", autowidth:true, value: "增加"},
        //         { view:"button", autowidth:true, value: "删除"},
        //         { view:"segmented", value:"one", inputWidth:250, options:[
        //                 { id:"one", value:"One"},
        //                 { id:"two", value:"Two"},
        //                 { id:"three", value:"Three"}
        //             ]},
        //         { },
        //         { view:"select", options:[{id:"name", value:"名称"}, {id:"code", value:"编码"}], width:80},
        //         { view:"search", placeholder:"输入条件...", width: 250 },
        //         { view:"button", autowidth:true, value: "重置"},
        //     ]
        // };

        <m:tree id="tree" model="region" />
        <m:grid id="grid" model="region" />
        <m:form id="form" model="region" />
        <m:chart id="chart" model="region" />

        webix.ui({
            "type":"line",
            "rows":[
                topbar,
                {
                    "type":"clean",
                    id:"h",
                    "cols":[
                        sidebar,

                        {
                            rows:[
                                toolbar,
                                {
                                    cols:[
                                        tree,
                                        {type: "line",id: "g", gravity: 4,rows:[ grid, gridPager ]},
                                        {
                                            id: "ss",type: "line", value: "tab", gravity: 2, view: "tabview", cells: [
                                                {header: "表单", body: form},
                                                {header: "图表", body: chart},
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }

                    ]
                }
            ]
        });

        $$("grid").attachEvent("onItemClick", function(id, e, node){
            webix.message(id.row);
            $$("h").removeView("ss");
        });
    });
</script>
</body>
</html>
