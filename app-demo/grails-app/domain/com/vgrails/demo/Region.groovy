package com.vgrails.demo

class Region{

    static m=[
            locale: "地区",

            search: ["name"],

//            form: [
//                    ["code", "name"],
//                    ["parent"]
//            ],

            sort: ["name", "code"]
    ]

    String  code
    int     level
    String  name
    Region  parent

    static constraints = {
        code        attributes: [locale: "编码"], unique: true
        level       attributes: [locale: "层级"]
        name        attributes: [locale: "名称"]
        parent      attributes: [locale: "上级"], nullable: true
    }

    String toString(){
        return name
    }
}