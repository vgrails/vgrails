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

    def sidebar = { attrs, body ->
        String id = "sidebar"

        List<Map> config = grailsApplication.config.get("vg.sidebar")

        String template = """
        var ${id}={
            view: "sidebar",
            css:"webix_dark",
            collapsed: true,
            data: [""".trim()

        for(Map group in config){
            template += m.sidebarGroup(group)
        }

        template+="""],
            afterSelect: function(id){
                webix.message("Selected: "+this.getItem(id).value+"("+id+")");
            }
        };""".trim()

        out<<template
    }

    def sidebarGroup = { attrs, body ->

        String id = attrs["id"]
        String value = attrs["label"]
        List<Map> items=attrs["items"]
        String template = """
            {id: "${id}", icon: "mdi mdi-light mdi-view-dashboard", value: "${value}",  data:[""".trim()

        for(Map item in items) {
            template +="""{ id: "${item.id}", icon: "mdi mdi-light mdi-view-dashboard", value: "${item.label}"},\n"""
        }
        template += """]}, """.trim()

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
        String type = attrs["type"]?:"bar"
        String value = attrs["value"] ?: "count"
        String label = attrs["label"] ?: "dollars"
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
    var ${id}={
        view:"form",
        id:"${id}",
        height: 1000,
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

        output = output + "]};"

        out << output
    }

    def gridColumns = { attrs, body ->
        String model=attrs['model']
        boolean search =attrs['search']? true : false

        MetaDomain domain = MetaService.GetModel(model)
        out << """columns:[\n"""
        for(MetaField f in domain?.fields){

            String sort = domain?.sort.contains(f.propertyName)==true ? ', sort:"server"': ""
            String header = """header: "${f.locale}", """

            if(search && domain?.search.contains(f.propertyName)==true){
                header = """header: ["${f.locale}", {content: "serverFilter"}], """
            }

            out << "    "*3 << """{id:"${f.propertyName}", ${header} fillspace: ${f.flex}${sort}}"""
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
        boolean search =attrs['search']? true : null

        String template = """
    var ${id}={
        view:"datatable",
        headermenu: true,
        id:"${id}",
        ${m.gridColumns([model: model, search: search])}
        select:"row",
        navigation:false,
        scrollX: false,
        scrollY: false,
        pager:"${id}Pager",
        url: "gridProxy->${g.createLink([controller: model, action: action])}",
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
        String viewAction = "${controllerName}_${actionName}"

        String buttons = ""
        String searchButtons = ""

        List<Map> buttonsConfig = grailsApplication.config.get("vg.toolbar.${viewAction}")

        if(buttonsConfig != null)
        for(Map btn in buttonsConfig){
            if(btn.id != null){
                String buttonTemplate = """{view:"button", autowidth:true, type:"danger", id:"${viewAction}_${btn.id}", value:"${btn.value}"},"""
                buttons += buttonTemplate
            }else if(btn.search == "standard"){
                searchButtons = """
                 { view:"select", options:[{id:"name", value:"名称"}, {id:"code", value:"编码"}], width:80},
                 { view:"search", placeholder:"输入条件...", width: 250 },
                 { view:"button", autowidth:true, value: "重置"},
                 """

            }
        }else{
            buttons = """{view:"button", autowidth:true, value: "待配", type:"form"},"""
        }

        String template = """
    var ${id}={
        view:"toolbar",
        height:44,
        cols: [
        ${buttons}
        { },
        ${searchButtons}
        { view:"button", autowidth:true, value: "新增", type:"icon", id:"help", icon:"mdi mdi-access-point", width: 24},
        ]
    };""".trim()

        out << template
    }

    def topbar = { attrs, body->
        String id = attrs["id"]

        String template = """
    var menuConfig = {
            view: "sidemenu",
            id: "menu",
            width: 200,
            position: "right",
            body:{
                view:"list",
                borderless:true,
                scroll: false,
                template: "<span class='webix_icon mdi mdi-#icon#'></span> #value#",
                data:[
                    {id: 1, value: "Customers", icon: "account"},
                    {id: 2, value: "Products", icon: "cube"},
                    {id: 3, value: "Reports", icon: "chart-bar"},
                    {id: 4, value: "Archives", icon: "database"},
                    {id: 5, value: "Settings", icon: "cogs"}
                ],
                select:true,
                type:{
                    height: 40
                }
            }
        }

    var menu = null;

    var ${id}={
        view:"toolbar",
        css:"webix_dark",
        height:44,
        cols: [
            { view:"button", type:"icon", icon:"mdi ${grailsApplication.config.get('vg.app.icon')?:'mdi-access-point'}", width:24},
            { view:"label", label:"${grailsApplication.config.get('vg.app.name')?:'VGRAILS演示系统'}<sub class='version_string'>${grailsApplication.config.get('vg.app.version')?:'0.0.1'}</sub>", width: 300},
            { },
            { view:"button", type:"icon", id:"btn", badge: 5, icon:"mdi mdi-access-point", width: 42},
            {
                view: "icon", icon: "mdi mdi-menu",
                click: function(){
                    
                    if(menu == null){
                        menu = webix.ui(menuConfig);
                    }
                    
                    if( menu.config.hidden){
                        menu.show();
                    }else
                        menu.hide();
                    }
            }
        ]
    };""".trim()

        out << template
    }
    
    def property = { attrs, body ->
        String id = attrs["id"]

        String template = """
    var ${id} = {
        view:"property",  id:"id", gravity: 1,
        elements:[
            { label:"Editors",       type:"label"},
            { label:"Password",      type:"password"     , id:"a1",   value: "pass"},
            { label:"Text",          type:"text"         , id:"a2",   value: "pass"},
            { label:"Select",        type:"select"       , id:"a3",   value: "pass", options:colors },
            { label:"Rich Select",   type:"text"   , id:"a4",   value: "1", suggest:colors },
            { label:"Multi Select",  type:"multiselect"  , id:"a5",   value: "1,3" , options:colors },
            { label:"Date Picker",   type:"date"   , id:"a6",   value: "1980-01-02"},
            { label:"Color Picker",  type:"color"  , id:"a7",   value: "#ff88a8"}
        ]
    };
"""
    }
}
