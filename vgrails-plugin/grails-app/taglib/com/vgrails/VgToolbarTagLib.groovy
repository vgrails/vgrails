package com.vgrails

import com.vgrails.utility.FrontHelper
import grails.converters.JSON
import grails.util.Environment

class VgToolbarTagLib {
    static namespace = "m"
    static defaultEncodeAs = [taglib:'none']

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
            { view:"button", type:"icon", label:"创建", id:"btn", icon:"mdi mdi-access-point", width:92},
        ]
    });""".trim()

        out << template
    }
}
