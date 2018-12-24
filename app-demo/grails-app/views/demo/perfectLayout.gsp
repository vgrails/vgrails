<!doctype html>
<html>
<head>
    <title>Welcome to VGrails</title>
    <m:resources />
</head>
<body>
<script type="application/javascript">
    webix.ready(function(){
        %{--webix.ui({--}%
        %{--"type": "clean", "rows":[--}%
        %{--<m:container id="toolbar" component="toolbar"/>,--}%
        %{--{--}%
        %{--cols:[--}%
        %{--<m:container id="sidebar" component="sidebar"/>,--}%
        %{--<m:container id="grid" component="grid"/>,--}%
        %{--{--}%
        %{--view : "accordion", type : "clean",--}%
        %{--rows : [--}%
        %{--{ header : "Babylon 5", body:{rows:[<m:container id="chart1" component="chart"/>,--}%
        %{--<m:container id="chart2" component="chart"/>]} },--}%
        %{--{ header : "Star Trek", body : "Kirk<br>Sisko<br>Archer<br>Picard<br>Janeway", collapsed : true },--}%
        %{--{ header : "Stargate SG-1", body : "O'Neill<br>Danial<br>Carter<br>Teal'c", collapsed : true }--}%
        %{--]--}%
        %{--}--}%
        %{--]--}%
        %{--}--}%
        %{--]--}%
        %{--});--}%




        %{--<m:chart id="chart1" type="bar" model="area" value="count" label="dollars" refresh="2000"/>--}%
        %{--<m:chart id="chart2" type="pie" model="area" value="count" label="dollars" refresh="3000"/>--}%


        <%
        Map layout=[
                rows:[
                    [id:"toolbar", comp:"toolbar"],
                    [
                        cols:[
                            [id:"sidebar", comp: "sidebar"],
                            [id:"grid", comp: "grid"],
                        ]
                    ]
                ]
        ]
    %>
        <m:layout layout="${layout}"/>

        <m:toolbar id="toolbar"/>
        <m:sidebar id="sidebar" />
        <m:grid id="grid" model="organization"/>
    });

</script>

</body>
</html>