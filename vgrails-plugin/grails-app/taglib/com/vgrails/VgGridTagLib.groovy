package com.vgrails

import com.vgrails.model.MetaDomain
import com.vgrails.model.MetaField
import com.vgrails.model.MetaService
import com.vgrails.utility.FrontHelper
import grails.converters.JSON
import grails.util.Environment

class VgGridTagLib {
    static namespace = "m"
    static defaultEncodeAs = [taglib:'none']

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
    var ${id}Width = webix.\$\$("${id}").\$width-7;
    var ${id}Height = webix.\$\$("${id}").\$height;

    var ${id}PageSize = Math.floor((${id}Height-pagerHeight - gridHeaderHeight)/rowHeight)+1;
    var ${id}GridHeight = ${id}PageSize * rowHeight;
    var ${id}GridWidth = ${id}Width - 20;

    webix.ui({
        container:"${id}Grid",
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
            container: "${id}Pager",
            size: ${id}PageSize,
            group: 5
        },
        url: "gridProxy->${g.createLink([controller: "demo", action: "list"])}"
    });"""

        out << template
    }
}
