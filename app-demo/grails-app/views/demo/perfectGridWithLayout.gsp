<!doctype html>
<html>
<head>
    <title>Welcome to VGrails</title>
    <m:resources />
</head>
<body>
<h2>Hello Webix</h2>
<script type="application/javascript">
webix.ready(function(){
    webix.ui(
        {
            type: "line", rows: [
                {
                    type: "line",
                    gravity: 3,
                    cols: [
                        {template: "<div id='grid_div'></div><div id='pager_div'></div>", id: "line1"},
                        {template: "line-3"}
                    ]
                },

                {
                    type: "line",
                    cols: [
                        {template: "head-1"},
                        {template: "head-2"},
                        {template: "head-3"}
                    ]
                },
                {
                    type: "line",
                    cols: [
                        {template: "form-1"},
                        {template: "form-2"},
                        {template: "form-3"}
                    ]
                }
            ]
        }
    );

    webix.$$("line1").$height;


    var div_width = webix.$$("line1").$width;
    var div_height = webix.$$("line1").$height;

    var recoderPerPage = parseInt((div_height-pagerHeight - gridHeaderHeight)/rowHeight+1);
    var gridHeight = recoderPerPage * rowHeight;
    var gridWidth = div_width - 20;




    grid=webix.ui({
        container:"grid_div",
        view:"datatable",
        columns:[
            { id:"time",	header:"时间", fillspace: 2, sort: "server"},
            { id:"action",	header:"动作", fillspace: 1},
            { id:"target",	header:"目标", fillspace: 1},
            { id:"desc",	header:"描述", fillspace: 3}
        ],
        select:"row",
        navigation:false,
        height: gridHeight,
        width: gridWidth,
        scrollX: false,
        scrollY: false,
        pager:{
            template:"{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
            container:"pager_div",
            size:recoderPerPage,
            group:5
        },
        url: "gridProxy-><g:createLink controller='demo' action='list' />"
    });
});

</script>

<div id="toolbar"></div>


</body>
</html>
