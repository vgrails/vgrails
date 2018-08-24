<!doctype html>
<html lang="zh-cn" class="no-js">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <title>VGRAILS</title>
    <meta name="renderer" content="webkit">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <asset:stylesheet src="css/zui.css"/>
    <asset:stylesheet src="lib/datagrid/zui.datagrid.css"/>
</head>
<body>
    <div class="container-fluid">
        <div id="mygrid" class="datagrid">
            <div class="datagrid-container"></div>
            <div class="pager"></div>
        </div>
    </div>
    <asset:javascript src="lib/jquery/jquery.js"/>
    <asset:javascript src="js/zui.js"/>
    <asset:javascript src="lib/datagrid/zui.datagrid.js"/>
    <script type="text/javascript">
    $('#mygrid').datagrid({
        dataSource: {
            cols:[
                {name: 'time', label: '时间'},
                {name: 'hera', label: '英雄'},
                {name: 'action', label: '动作'},
                {name: 'target', label: '目标'},
                {name: 'desc', label: '描述'}
            ],
            array:[
                {time: '00:11:12', hero:'幻影刺客', action: '击杀', target: '斧王', desc: '幻影刺客击杀了斧王。'},
                {time: '00:13:22', hero:'幻影刺客', action: '购买了', target: '隐刀', desc: '幻影刺客购买了隐刀。'},
                {time: '00:19:36', hero:'斧王', action: '购买了', target: '黑皇杖', desc: '斧王购买了黑皇杖。'},
                {time: '00:21:43', hero:'力丸', action: '购买了', target: '隐刀', desc: '力丸购买了隐刀。'}
            ],
            states: {
                pager: {page: 1, recPerPage: 30}
            },
            width: "auto",
            height: 'page'
        }
    });
    </script>
</body>
</html>
