package com.vgrails

import com.vgrails.model.MetaDomain
import com.vgrails.model.MetaField
import com.vgrails.model.MetaService
import com.vgrails.utility.FrontHelper
import grails.converters.JSON
import grails.util.Environment

class VgGeneralTagLib {
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
    ${asset.stylesheet(src: "css/vgrails.css")}
    ${asset.javascript(src: "webix/codebase/webix${min}.js")}
    ${asset.javascript(src: "locales/zh-CHS.js")}
    ${asset.javascript(src: "js/vgrails.js")}
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
            out << """{template: "<div id='${id}Grid'></div><div id='${id}Pager'></div>" ${flex},id: "${id}"}"""
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

    //TODO: 菜单需要从服务端或配置加载
    def sidebar = { attrs, body ->
        String id = attrs['id']

        String template = """
        var ${id}={
            view: "sidebar",
            css:"webix_dark",
            collapsed: true,
            data: [
                ${m.sidebarGroup([id:"student", value:"学生"])},
                ${m.sidebarGroup([id:"teacher", value:"老师"])}
            ],
            afterSelect: function(id){
                webix.message("Selected: "+this.getItem(id).value+"("+id+")");
            }
        };""".trim()

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
  """.trim()

        out << template
    }

    def tree = { attrs, body ->
        String id = attrs["id"]
        String model = attrs["model"]
        String action = attrs["action"] ?:"tree"


        String template = """
        var ${id}= {
        view : "tree",
        select : true, 
        borderless : true,
        url: "/${model}/${action}"
    };""".trim()

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
        \$\$("${id}").clearAll();
        \$\$("${id}").load("/${model}/${action}");
    }, ${attrs["refresh"]});
""".trim()
        }

        String template = """
    var ${id} = {
        id: "${id}",
        view : "chart",
        type : "${type}",
        value : "#${value}#",
        label : "#${label}#",
        url: "/${model}/${action}"
    };
    
    ${refresh}
    """.trim()

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

    def layout = { attrs, body->

        Map layout = FrontHelper.Layout(attrs.layout)
        String output = (layout as JSON)

        out << output
    }

    def form = { attrs, body ->
        String model=attrs['model']
        String id= attrs['id']
        String output = """
    {
        view:"form",
        container:"${id}",
        elements:[
"""
        output = output.trim() + "\n"
        MetaDomain domain = MetaService.GetModel(model)

        List<List<String>> fieldLines = domain.form

        for(List<String> fieldLine in fieldLines){
            if(fieldLine.size() == 1){
                //单行单列
                MetaField f = domain.GetMetaField(fieldLine[0])
                output = output + "{view:'text',label:'${f.locale}',id:'form_${f.propertyName}',type:'form'},\n"
            }else{
                //单行多列
                output = output + "{cols:[\n"

                for(String field in fieldLine){
                    MetaField f = domain.GetMetaField(field)
                    output = output + "{view:'text',label:'${f.locale}',id:'form_${f.propertyName}',type:'form'},\n"
                }
                output = output + "]},\n"
            }
        }

        output = output + "]},"

        out << "webix.ui(${output});"
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

    //TODO: 修复 model, controller, action
    def grid = { attrs, body ->

        String id = attrs['id']
        String model = attrs['model'] ?:"demo"
        String action = attrs['action']?:"list"

        String template = """
    var ${id}={
        view:"datatable",
        id:"${id}",
        ${m.gridColumns([model: model])}
        select:"row",
        navigation:false,
        scrollX: false,
        scrollY: false,
        pager:"${id}Pager",
        url: "gridProxy->${g.createLink([controller: "demo", action: "list"])}",
        ready:function(){ webix.delay(update_page_size, this);},
        resize:function(nw,nh,ow,oh){if(oh && oh != nh) webix.delay(update_page_size,this);}
    };
    
    var ${id}Pager ={
        view:"pager",
        id:"${id}Pager",
        template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
    };
    """.trim()
        out << template
    }

    def toolbar = { attrs, body->
        String id = attrs["id"]

        String template = """
    var ${id}={
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
            { view:"button", type:"icon", label:"创建", id:"btn", icon:"mdi mdi-access-point", width:92},
        ]
    };""".trim()

        out << template
    }
}
