<!doctype html>
<html>
<head>
    <title>Welcome to VGrails</title>
    <m:resources />
</head>
<body>
<script type="application/javascript">
    webix.ready(function(){

        <% Map layout=[
            rows:[
                [id:"toolbar", comp:"toolbar"],
                [
                    cols:[
                        [id:"sidebar", comp: "sidebar"],
                        [id:"grid", comp: "grid", flex: 2],
                        [id:"tabbar", cells:[
                                [id: "chart1Tab", header: "CHART1", body: [id: "chart1", comp: "chart"]],
                                [id: "chart2Tab", header: "CHART2", body: [id: "chart2", comp: "chart"]],
                        ]]
                    ]
                ]
            ]
        ]
        %>
        <m:layout layout="${layout}"/>

        <m:toolbar id="toolbar"/>
        <m:sidebar id="sidebar" />
        <m:grid id="grid" model="organization"/>

        // //事件响应
        // $$('grid').attachEvent("onItemClick", function(id, e, node){
        //     webix.message(id.row);
        // });

        <m:chart id="chart1" type="line" model="area" value="count" label="dollars"/>
        $$('tabbar').getMultiview().attachEvent('onViewChange', function(prevId, nextId){
            if(nextId == 'chart2') {
                <m:chart id="chart2" type="bar" model="area" value="count" label="dollars"/>
            }
        });
    });

</script>

</body>
</html>
