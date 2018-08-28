<!doctype html>
<html lang="zh-cn" class="no-js" xmlns="http://www.w3.org/1999/html">
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
        <form>
            <input name="user_name" type="text" class="form-control" placeholder="用户名">
            <button class="btn-primary">提交</button>
        </form>
    </div>
    <asset:javascript src="lib/jquery/jquery.js"/>
    <asset:javascript src="js/zui.js"/>
    <asset:javascript src="lib/datagrid/zui.datagrid.js"/>

    <script type="text/javascript">
        $('button').on('click', function() {
            $('form').submit();
        });
    </script>
</body>
</html>
