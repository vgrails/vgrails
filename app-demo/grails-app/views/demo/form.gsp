<!doctype html>
<html>
<head>
    <title>Welcome to VGrails</title>
    <m:resources />
</head>
<body>
<script type="application/javascript">
    webix.ready(function(){

        <m:toolbar id="toolbar"/>
        <m:sidebar id="sidebar"/>;
        <m:chart id="chart1" type="pie" value="count" label="dollars" model="area" action="chart" refresh="1000"/>;
        <m:chart id="chart2" type="line" value="count" label="dollars" model="area" action="chart" refresh="2000"/>;
        <m:grid id="grid" model="organization"/>

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

        // $$('grid').attachEvent("onItemClick", function(id, e, node){
        //     webix.message(id.row);
        // });

        $$("grid").attachEvent("onItemClick", function(id, e, node){
            webix.message(id.row);

            if($$("second")==null){
                var pos = $$("h").index($$("g"));

                $$("h").addView(second, -1);
            }else{
                $$("h").removeView("second");
            }
        });
    });

</script>
</body>
</html>
