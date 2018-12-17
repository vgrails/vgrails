<!doctype html>
<html>
<head>
    <title>Welcome to VGrails</title>
    <m:resources />
</head>
<body>
<script type="application/javascript">
webix.ready(function(){

    webix.ui(
        {
            type: "wide", rows:[
                {cols: [
                <m:container id="chart1" component="chart"/>,
                <m:container id="chart2" component="chart"/>,
                <m:container id="chart3" component="chart"/>,
                <m:container id="chart4" component="chart"/>
            ]},
                {cols: [
                            <m:container id="chart5" component="chart"/>,
                            <m:container id="chart6" component="chart"/>,
                            <m:container id="chart7" component="chart"/>,
                            <m:container id="chart8" component="chart"/>
                        ]}
    ]}
        );

    <m:chart id="chart1" type="bar" model="area" value="count" label="dollars" refresh="2000"/>
    <m:chart id="chart2" type="pie" model="area" value="count" label="dollars" refresh="3000"/>
    <m:chart id="chart3" type="line" model="area" value="count" label="dollars" refresh="1500"/>
    <m:chart id="chart4" type="barH" model="area" value="count" label="dollars" refresh="4000"/>
    <m:chart id="chart8" type="bar" model="area" value="count" label="dollars" refresh="2000"/>
    <m:chart id="chart7" type="pie" model="area" value="count" label="dollars" refresh="3000"/>
    <m:chart id="chart6" type="line" model="area" value="count" label="dollars" refresh="1500"/>
    <m:chart id="chart5" type="barH" model="area" value="count" label="dollars"/>
});

</script>

</body>
</html>
