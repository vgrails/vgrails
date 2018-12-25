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
                        [id:"grid", comp: "grid"]
                    ]
                ]
            ]
        ]
        %>
        <m:layout layout="${layout}"/>

        <m:toolbar id="toolbar"/>
        <m:sidebar id="sidebar" />
        <m:grid id="grid" model="organization"/>

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
    });

</script>

</body>
</html>
