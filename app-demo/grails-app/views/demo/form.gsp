<!doctype html>
<html>
<head>
    <title>Welcome to VGrails</title>
    <m:resources />
</head>
<body>

<script type="application/javascript">
    webix.ready(function(){

        <m:toolbar id="toolbar" />;
        <m:sidebar id="sidebar"/>;
        <m:chart id="chart1" type="pie" value="count" label="dollars" model="area" action="chart"/>;
        <m:chart id="chart2" type="line" value="count" label="dollars" model="area" action="chart"/>;
        <m:grid id="grid" model="organization" />

        webix.ui({
            "type":"clean",
            "rows":[
                toolbar,
                {
                    "type":"clean",
                    id:"h",
                    "cols":[
                        sidebar,
                        {id: "g", rows:[ grid, gridPager ]}
                    ]
                }
            ]
        });

        var second={
            "type":"clean",
            id: "second",
            "rows":[
                chart1,
                chart2
            ]
        };

        $$("grid").attachEvent("onItemClick", function(id, e, node){
            webix.message(id.row);

            $$("grid").clearAll();
            $$("grid").data.columns=[
                {id:"name", header: "名称",  fillspace: 1, sort:"server"},
                {id:"province", header: "省份",  fillspace: 1},
                {id:"city", header: "城市",  fillspace: 1},
                //{id:"area", header: "区域",  fillspace: 1}
            ];
            $$("grid").adjust();
            $$("grid").
            $$("grid").load("gridProxy->/demo/list");
        });
        //
        // $$("grid1").attachEvent("onItemClick", function(id, e, node){
        //     webix.message(id.row);
        //
        //     $$("g").removeView("grid1");
        //     $$("g").removeView("grid1Pager");
        //     $$("g").addView(grid, -1);
        //     $$("g").addView(gridPager, -1);
        // });


        // $$("grid").attachEvent("onItemClick", function(id, e, node){
        //     webix.message(id.row);
        //
        //     if($$("se")==null){
        //         var pos = $$("h").index($$("g"));
        //
        //         $$("h").addView(second, -1);
        //     }else{
        //         $$("h").removeView("second");
        //         $$("h").addView(second, -1);
        //     }
        // });
        //
        // $$("grid").attachEvent("onItemDblClick", function(id){
        //     if($$("second")!=null){
        //         $$("h").removeView("second");
        //     }
        // });
    });

</script>
</body>
</html>
