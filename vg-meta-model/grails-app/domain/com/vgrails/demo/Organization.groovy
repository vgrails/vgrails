package com.vgrails.demo

class Organization {

    static m=[
            locale: "组织",

            search: [
                    name: ["eq", "like"],
                    area: ["eq", "like"]
            ],

            form: [
                    ["name"],
                    ["province", "city", "area"]
            ],

            sort: ["name"]
    ]


    String name
    String province
    String city
    String area

    static constraints = {
        name        attributes: [locale: "名称"], maxSize: 10, minSize: 4, unique: true
        province    attributes: [locale: "省份"], maxSize: 4, minSize: 2
        city        attributes: [locale: "城市"], maxSize: 10, minSize: 2
        area        attributes: [locale: "区域"], maxSize: 10, minSize: 2
    }

    String toString(){
        return name
    }
}
