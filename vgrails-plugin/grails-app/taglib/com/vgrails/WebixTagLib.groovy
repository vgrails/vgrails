package com.vgrails

import com.vgrails.model.MetaDomain
import com.vgrails.model.MetaField
import com.vgrails.model.MetaService
import com.vgrails.utility.FrontHelper
import grails.converters.JSON
import grails.util.Environment

class WebixTagLib {
    static namespace = "m"
    static defaultEncodeAs = [taglib:'none']

    def resources = { attrs, body ->

        String min = ""
        String debug = ""

        if(Environment.DEVELOPMENT == Environment.getCurrentEnvironment()){
            min = ".min"
            debug = """
    <script type="text/javascript">
        webix.debug({events: true, size:true});
    </script>"""
        }

        String template = """
    <meta charset="UTF-8">
    ${asset.stylesheet(src: "webix/codebase/webix${min}.css")}
    ${asset.stylesheet(src: "webix/codebase/skins/material.css")}
    ${asset.stylesheet(src: "css/materialdesignicons.css")}
    ${asset.javascript(src: "webix/codebase/webix${min}.js")}
    ${asset.javascript(src: "locales/zh-CHS.js")}
    ${asset.javascript(src: "javascripts/proxy.js")}
    ${debug}""".trim()


        out << FrontHelper.FormatOutput(template)
    }

    def container = { attrs, body ->
        String id=attrs['id']
        String component=attrs['component']
        String flex=""

        if(attrs['flex']!=null){
            flex = ",gravity: ${attrs['flex']}"
        }

        if(component == 'grid') {
            out << """{template: "<div id='${id}_grid'></div><div id='${id}_pager'></div>" ${flex},id: "${id}"}"""
        }else if(component == 'toolbar') {
            out << """{template: "<div id='${id}'></div>", height: 48}"""
        }else if(component == 'sidebar') {
            out << """{template: "<div id='${id}'></div>", width: 58}"""
        }else{
            out << """{template: "<div id='${id}'></div>" ${flex}}"""
        }
    }

    def containerSize = { attrs, body ->
        String id=attrs['id']

        out << """${id}_width = webix.\$\$("${id}").\$width-7; ${id}_height = webix.\$\$("${id}").\$height;"""
    }

    def gridColumns = { attrs, body ->
        String model=attrs['model']

        MetaDomain domain = MetaService.GetModel(model)
        out << """columns:[\n"""
        for(MetaField f in domain?.fields){

            String sort = domain?.sort.contains(f.propertyName)==true ? ', sort:"server"': ""

            out << "    "*3 << """{id:"${f.propertyName}", header: "${f.locale}", fillspace: ${f.flex}${sort}}"""
            if(f.propertyName != domain.fields[-1].propertyName){
                out << ","
            }
            out << "\n"
        }
        out << """        ],
"""
    }

    def grid = { attrs, body ->

        String id = attrs['id']
        String model = attrs['model']

        String template = """
    ${id}RecordsPerPage = Math.floor((${id}_height-pagerHeight - gridHeaderHeight)/rowHeight)+1;
    ${id}GridHeight = ${id}RecordsPerPage * rowHeight;
    ${id}GridWidth = ${id}_width - 20;

    ${id}Grid=webix.ui({
        container:"${id}_grid",
        view:"datatable",
        ${m.gridColumns([model: model])}
        select:"row",
        navigation:false,
        height: ${id}GridHeight,
        width: ${id}GridWidth,
        scrollX: false,
        scrollY: false,
        pager:{
            template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
            container: "${id}_pager",
            size: ${id}RecordsPerPage,
            group: 5
        },
        url: "gridProxy->${g.createLink([controller: "demo", action: "list"])}"
    });"""

        out << template
    }

    //TODO: 菜单需要从服务端或配置加载
    def sidebar = { attrs, body ->
        String id = attrs['id']

        String template = """
        var ${id}= webix.ui({
            container: "${id}",
            view: "sidebar",
            css:"webix_dark",
            height: webix.\$\$("${id}").\$height-2,
            collapsed: true,
            data: [
${m.sidebarGroup([id:"student", value:"学生"])},
${m.sidebarGroup([id:"teacher", value:"老师"])}
            ],
            on:{
                onAfterSelect: function(id){
                    webix.message("Selected: "+this.getItem(id).value+"("+id+")");
                }
            }
          });
        """

        out<<template
    }

    def sidebarGroup = { attrs, body ->

        String id = attrs["id"]
        String value = attrs["value"]

        String template = """
    {id: "${id}", icon: "mdi mdi-light mdi-view-dashboard", value: "${value}",  data:[
        { id: "${id}1", icon: "mdi mdi-light mdi-view-dashboard", value: "${value}1"},
        { id: "${id}2", icon: "mdi mdi-light mdi-view-dashboard", value: "${value}2"}
    ]}
  """

        out << template
    }

    def tree = { attrs, body ->
        String id = attrs["id"]
        String model = attrs["model"]
        String action = attrs["action"] ?:"tree"


        String template = """
        var ${id}= webix.ui({
        container: "${id}",
        view : "tree",
        select : true, borderless : true,
        height: ${id}_height,
        width:${id}_width,
        url: "/${model}/${action}"
    });""".trim()

        out << template
    }

    def chart = { attrs, body ->

        String id = attrs["id"]
        String type = attrs["type"]
        String value = attrs["value"]
        String label = attrs["label"]
        String model = attrs["model"]
        String action = attrs["action"] ?: "chart"

        String refresh = ""

        if (attrs["refresh"] != null) {
            refresh = """
    setInterval(function () {
        ${id}.clearAll();
        ${id}.load("/${model}/${action}");
    }, ${attrs["refresh"]});
""".trim()
        }

        String template = """
    ${m.containerSize(id: id)}
    var ${id} = webix.ui({
        container:'${id}',
        view : "chart",
        type : "${type}",
        value : "#${value}#",
        label : "#${label}#",
        width : ${id}_width, 
        height : ${id}_height,
        url: "/${model}/${action}"
    });
    ${refresh}
    """.trim()

        out << template
    }

    //TODO: 按钮需要从服务端或配置加载
    def toolbar = { attrs, body->
        String id = attrs["id"]

        String template = """
    var ${id}=webix.ui({
        container:"${id}",
        view:"toolbar",
        css:"webix_dark",
        height:44,
        cols: [
            { view:"button", type:"icon", icon:"mdi mdi-access-point", width:39},
            { view:"button", type:"icon", icon:"mdi mdi-access-point", width:39},
            { view:"button", type:"icon", icon:"mdi mdi-access-point", width:39},
            { view:"button", type:"icon", icon:"mdi mdi-access-point", width:39},
            { },
            { view:"button", type:"icon", label:"保存", icon:"mdi mdi-access-point", width:92},
            { view:"button", type:"icon", label:"保存", icon:"mdi mdi-access-point", width:92},
            { view:"button", type:"icon", label:"保存", icon:"mdi mdi-access-point", width:92},
            { view:"button", type:"icon", label:"保存", icon:"mdi mdi-access-point", width:92},
            { view:"button", type:"icon", label:"保存", icon:"mdi mdi-access-point", width:92},
        ]
    });""".trim()

        out << template
    }

    def accordion = {attrs, body ->

        String template = """
{
view : "accordion", type : "clean",
rows : [
{ header : "Babylon 5", body : "Sheridan<br>Delenn<br>Garibaldi<br>G'Kar<br>Londo" },
{ header : "Star Trek", body : "Kirk<br>Sisko<br>Archer<br>Picard<br>Janeway", collapsed : true },
{ header : "Stargate SG-1", body : "O'Neill<br>Danial<br>Carter<br>Teal'c", collapsed : true }
]
}""".trim()
        out << template
    }

//webix.ui({
//    "type": "clean", "rows":[
//            {template: "<div id='toolbar'></div>", height: 48},
//            {
//                cols:[
//                        {template: "<div id='sidebar'></div>", width: 58},
//                        {template: "<div id='grid_grid'></div><div id='grid_pager'></div>" ,id: "grid"},
//                        {
//                            view : "accordion", type : "clean",
//                            rows : [
//                                    { header : "Babylon 5", body:{rows:[{template: "<div id='chart1'></div>" },
//                                                                        {template: "<div id='chart2'></div>" }]} },
//                                    { header : "Star Trek", body : "Kirk<br>Sisko<br>Archer<br>Picard<br>Janeway", collapsed : true },
//                                    { header : "Stargate SG-1", body : "O'Neill<br>Danial<br>Carter<br>Teal'c", collapsed : true }
//                            ]
//                        }
//                ]
//            }
//    ]
//});
    def layout = { attrs, body->

        Map layout = FrontHelper.Layout(attrs.layout)

        println layout

        out << "webix.ui(${layout as JSON});"
    }
}
