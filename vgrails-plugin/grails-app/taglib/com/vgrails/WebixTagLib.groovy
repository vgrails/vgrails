package com.vgrails

class WebixTagLib {
    static namespace = "m"
    static defaultEncodeAs = [taglib:'none']

    def resources = { attrs, body ->
        out << """<meta charset="UTF-8">"""
        out << asset.stylesheet(src: "codebase/webix.css")
        out << asset.stylesheet(src: "codebase/skins/material.css")
        out << asset.stylesheet(src: "css/materialdesignicons.css")
        out << asset.javascript(src: "codebase/webix.js")
        out << asset.javascript(src: "webix-locales/zh-CHS.js")
        out << asset.javascript(src: "codebase/proxy.js")
    }
}
