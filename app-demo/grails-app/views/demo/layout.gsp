<!doctype html>
<html>
<head>
    <title>Welcome to VGrails</title>
    <m:resources />
</head>
<body>
<script type="application/javascript">

    function buttons(size){
        return  null;
    }
webix.ready(function(){
    webix.ui({
        type: "clean", rows:[
            <m:container id="toolbar" component="toolbar"/>,
            {
                cols:[
                    <m:container id="sidebar" component="sidebar"/>,
                    <m:container id="grid" component="grid"/>,
                ]
            }
        ]
    });

    <m:toolbar id="toolbar"/>
    <m:containerSize id="grid" />
    <m:sidebar id="sidebar" />
    <m:grid id="grid" model="organization"/>
});

</script>

</body>
</html>
