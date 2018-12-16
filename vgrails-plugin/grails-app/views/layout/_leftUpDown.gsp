<!doctype html>
<html>
<head>
    <m:resources/>
    <title>joking</title>
</head>
<body>
<script type="application/javascript">
webix.ready(function(){

    //布局：将页面按照左右切分，在将右部切分成上下
    webix.ui({
        type: "clean",
        cols: [
            <m:container id="${left}" component="grid"/>,
            {
                type: "clean",
                rows: [
                    <m:container id="${up}" component="grid"/>,
                    <m:container id="${down}" component="grid"/>
                ]
            }
        ]
    });

    //获取每个Template快的height, width
    <m:containerSize id="${left}" />
    <m:containerSize id="${up}" />
    <m:containerSize id="${down}" />

    //将Template和每个Component绑定
    <m:grid id="${left}" model="${leftModel}"/>
    <m:grid id="${up}" model="${upModel}"/>
    <m:grid id="${down}" model="${downModel}"/>

    //事件响应
    ${left}Grid.attachEvent("onItemClick", function(id, e, node){
        webix.message(id.row);
    });

    ${left}Grid.attachEvent("onItemDblClick", function(id, e, node){
        webix.message(id.column);
    });
});

</script>
</body>
</html>

