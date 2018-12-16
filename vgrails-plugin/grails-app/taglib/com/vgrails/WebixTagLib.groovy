package com.vgrails

import com.vgrails.model.MetaDomain
import com.vgrails.model.MetaField
import com.vgrails.model.MetaService
import grails.util.Environment

class WebixTagLib {
    static namespace = "m"
    static defaultEncodeAs = [taglib:'none']

    def resources = { attrs, body ->

        String min = ""
        String debug = ""

        if(Environment.DEVELOPMENT != Environment.getCurrentEnvironment()){
            min = ".min"
            debug = """
<script type="text/javascript">
    webix.debug({events: true, size:true});
</script>
""".trim()
        }

        String template = """
<meta charset="UTF-8">
${asset.stylesheet(src: "codebase/webix${min}.css")}${asset.stylesheet(src: "codebase/skins/material.css")}${asset.stylesheet(src: "css/materialdesignicons.css")}${asset.javascript(src: "codebase/webix${min}.js")}${asset.javascript(src: "webix-locales/zh-CHS.js")}${asset.javascript(src: "codebase/proxy.js")}
${debug}
""".trim()
        out << template
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
        }else{
            out << """{template: "<div id='${id}'></div>" ${flex}}"""
        }
    }

    def containerSize = { attrs, body ->
        String id=attrs['id']

        out << """${id}_width = webix.\$\$("${id}").\$width; ${id}_height = webix.\$\$("${id}").\$height;"""
    }

    def gridColumns = { attrs, body ->
        String model=attrs['model']

        MetaDomain domain = MetaService.GetModel(model)

        println MetaService.GetModel("organization").fields
        println MetaService.GetModel("Organization")
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

    def sidebar = { attrs, body ->
        String template = """
          { 
            view: "sidebar",
            collapsed: true,
            data: [
${m.sidebarGroup([id:"student", value:"学生"])},
${m.sidebarGroup([id:"teacher", value:"老师"])},
${m.sidebarGroup([id:"course", value:"课程"])},
${m.sidebarGroup([id:"classroom", value:"教师"])},
${m.sidebarGroup([id:"playground", value:"操场"])},
${m.sidebarGroup([id:"book", value:"图书"])},
${m.sidebarGroup([id:"book1", value:"图书1"])},
${m.sidebarGroup([id:"book2", value:"图书2"])},
${m.sidebarGroup([id:"book3", value:"图书3"])},
${m.sidebarGroup([id:"book4", value:"图书4"])},
${m.sidebarGroup([id:"book5", value:"图书5"])},
${m.sidebarGroup([id:"book6", value:"图书6"])},
${m.sidebarGroup([id:"book7", value:"图书7"])},
${m.sidebarGroup([id:"book8", value:"图书8"])},
${m.sidebarGroup([id:"book9", value:"图书9"])},
{},
${m.sidebarGroup([id:"book10", value:"图书10"])},
${m.sidebarGroup([id:"book11", value:"图书11"])},
${m.sidebarGroup([id:"book12", value:"图书12"])}
            ],
            on:{
                onAfterSelect: function(id){
                    webix.message("Selected: "+this.getItem(id).value+"("+id+")");
                }
            }
          }
        """

        out<<template
    }

    def sidebarGroup = { attrs, body ->

        String id = attrs["id"]
        String value = attrs["value"]

        String template = """
    {id: "${id}", icon: "mdi mdi-view-dashboard", value: "${value}",  data:[
        { id: "${id}1", value: "${value}1"},
        { id: "${id}2", value: "${value}2"},
        { id: "${id}3", value: "${value}3"},
        { id: "${id}4", value: "${value}4"},
        { id: "${id}5", value: "${value}5"}
  ]}"""

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
}
