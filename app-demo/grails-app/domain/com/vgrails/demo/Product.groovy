package com.vgrails.demo

class Product {

    static m=[
            locale: "组织",

            search: ["name", "area"],

            form: [
                    ["name"],
                    ["province","city", "area"],
            ],

            sort: ["name"]
    ]

    String name
    String province
    String city
    String area

    static constraints = {
        name        attributes: [locale: "名称"], maxSize: 10, minSize: 4, unique: true
        province    attributes: [locale: "省份", level: 2], maxSize: 4, minSize: 2, blank: false
        city        attributes: [locale: "城市", level: 3, depends: "province"], maxSize: 10, minSize: 2
        area        attributes: [locale: "区域", level: 4, depends: "area"], maxSize: 10, minSize: 2, nullable: true
    }

    String toString(){
        return name
    }
}
