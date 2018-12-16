package com.vgrails.demo

class Area {

    static m=[
            locale: "地区",

            search: ["name"],

            form: [
                    ["code", "name"],
                    ["parent"]
            ],

            sort: ["name"]
    ]

    String code
    String name
    Area parent

    static constraints = {
        code        attributes: [locale: "编码"], unique: true
        name        attributes: [locale: "名称"], blank: false
        parent      attributes: [locale: "上级"], nullable: true
    }

    String toString(){
        return name
    }
}