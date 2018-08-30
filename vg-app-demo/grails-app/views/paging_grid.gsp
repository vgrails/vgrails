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
        <div class="row">
            <nav class="navbar navbar-default" role="navigation">
                <div class="container-fluid">
                    <div class="navbar-header">
                        <div class="btn-group">
                            <button class="btn btn-info">创建</button>
                            <button class="btn btn-info">更新</button>
                            <button class="btn btn-info">删除</button>
                        </div>
                    </div>
                    <div class="collapse navbar-collapse navbar-collapse-example">
                        <form class="navbar-form navbar-right" role="search">
                            <div class="form-group">
                                <select data-placeholder="选择条件" class="chosen-select form-control">
                                    <option value="cat">英雄</option>
                                    <option value="fish">动作</option>
                                </select>
                                <input type="text" class="form-control" placeholder="搜索">
                            </div>
                            <button type="submit" class="btn btn-default btn-info">搜索</button>
                        </form>
                    </div>
                </div>
            </nav>
        </div>
        <div class="row">
                <div id="mygrida" class="datagrid">
                    <div class="datagrid-container"></div>
                    <div class="pager"></div>
                </div>
                </div>
            </div>
        </div>
    </div>
    <asset:javascript src="lib/jquery/jquery.js"/>
    <asset:javascript src="js/zui.js"/>
    <asset:javascript src="lib/datagrid/zui.datagrid.js"/>

    <script type="text/javascript">

    recPerPage=Math.floor((document.documentElement.clientHeight - 36 - 52 -75)/36)

    $('#mygrida').datagrid({
        dataSource: {
            cols:[
                {name: 'name', label: '姓名'},
                {name: 'age', label: '年龄'},
                {name: 'familyName', label: '姓氏'},
                {name: 'givenName', label: '名称'}
            ],
            remote: function (params){
                return {
                    url: '<g:createLink controller="employee" action="list" absolute="true"/>',
                    type: 'GET',
                    dataType: 'json'
                };
            }
        },
        showRowIndex: false,
        states: {
            pager: {page: 1, recPerPage: recPerPage}
        },
        height: 'page'
    });

    </script>
</body>
</html>
