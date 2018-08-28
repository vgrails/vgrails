package com.vgrails.demo

class OrganizationNoMeta {

    String name
    String province
    String city
    String area

    static constraints = {
        name        maxSize: 10, minSize: 4, unique: true
        province    maxSize: 4, minSize: 2, blank: false
        city        maxSize: 10, minSize: 2
        area        maxSize: 10, minSize: 2, nullable: true
    }

    String toString(){
        return name
    }
}
