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
                        [id:"chart", comp: "chart"]
                    ]
                ]
            ]
        ]
        %>
        <m:layout layout="${layout}"/>

        <m:toolbar id="toolbar"/>
        <m:sidebar id="sidebar" />
        %{--<m:grid id="grid" model="organization"/>--}%
        <m:chart id="chart" type="bar" model="area" value="count" label="dollars" refresh="2000"/>
        var form = webix.ui({
            id : "myWindow", view : "window", width : 800, height : 1000, move : true, position: "center", modal:true,
            head : "<b>编辑组织</b>",
            body : {
                view:"form",
            elements:[
                {view:'text',label:'名称',type:'form'},
                {cols:[
                        {view:'text',label:'省份',type:'form'},
                        {view:'text',label:'城市',type:'form'},
                        {view:'text',label:'区域',type:'form'},
                    ]},
                {view:'text',label:'名称',type:'form'},
                {cols:[
                        {view:'text',label:'省份',type:'form'},
                        {view:'text',label:'城市',type:'form'},
                        {view:'text',label:'区域',type:'form'},
                    ]},
                {cols:[
                        {},
                        {},
                        {},
                        {view:'button',label:'提交',type:'form'},
                        {view:'button',id: "cancel", label:'取消',type:'danger'}
                    ]},

            ]}
        });

        $$('btn').attachEvent('onItemClick', function(){
            form.show();
        });

        $$('cancel').attachEvent('onItemClick', function(){
            form.hide();
        });

        // {
        //     view:"form",
        //         elements:[
        //     {view:'text',label:'名称',type:'form'},
        //     {cols:[
        //             {view:'text',label:'省份',type:'form'},
        //             {view:'text',label:'城市',type:'form'},
        //             {view:'text',label:'区域',type:'form'},
        //         ]},
        //     {view:'text',label:'名称',type:'form'},
        //     {cols:[
        //             {view:'text',label:'省份',type:'form'},
        //             {view:'text',label:'城市',type:'form'},
        //             {view:'text',label:'区域',type:'form'},
        //         ]},
        //     {cols:[
        //             {},
        //             {},
        //             {},
        //             {view:'button',label:'提交',type:'form'},
        //             {view:'button',id: "cancel", label:'取消',type:'danger'}
        //         ]},
        //
        // ]}

        <% Map dialog=[
            cols:[
                        [id:"formGrid", comp: "grid"],
                        [id:"formForm", comp: "form"],
                    ]
            ]
        %>

        var dialog = webix.ui({
            container: "dialog_complex",
            id : "dialog", view : "window", width : 800, height : 400, move : true, position: "center", modal:true,
            head : "<b>复杂窗口</b>",
            body : <m:layout layout="${dialog}" json="true"/>
        });

        // var formGridWidth = webix.$$("formGrid").$width-7;
        // var formGridHeight = webix.$$("formGrid").$height;
        //
        // var formGridPageSize = Math.floor((formGridHeight-pagerHeight - gridHeaderHeight)/rowHeight)+1;
        // var formGridGridHeight = formGridPageSize * rowHeight;
        // var formGridGridWidth = formGridWidth - 20;
        //
        // webix.ui({
        //     container:"formGridGrid",
        //     view:"datatable",
        //     columns:[
        //         {id:"name", header: "名称", fillspace: 1, sort:"server"},
        //         {id:"province", header: "省份", fillspace: 1},
        //         {id:"city", header: "城市", fillspace: 1},
        //         {id:"area", header: "区域", fillspace: 1}
        //     ],
        //
        //     select:"row",
        //     navigation:false,
        //     height: formGridGridHeight,
        //     width: formGridGridWidth,
        //     scrollX: false,
        //     scrollY: false,
        //     pager:{
        //         template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
        //         container: "formGridPager",
        //         size: formGridPageSize,
        //         group: 5
        //     },
        //     url: "gridProxy->/demo/list"
        // });


        dialog.show();
    });

</script>


    <div id="dialog_complex"></div>
</body>
</html>
