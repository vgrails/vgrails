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
    var pagerHeight = 26;
    var gridHeaderHeight = 25;
    var rowHeight = 36;
    var recoderPerPage = parseInt((document.documentElement.clientHeight-pagerHeight - gridHeaderHeight)/rowHeight);
    var gridHeight = recoderPerPage * rowHeight;
    var gridWidth = document.documentElement.clientWidth - 20;




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

    webix.message({type: "info", text: "<h2>loving forever!</h2>"});
});

</script>

<div id="toolbar"></div>
<div id="grid_div"></div>
<div id="pager_div"></div>

</body>
</html>
