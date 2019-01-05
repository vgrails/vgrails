package com.vgrails.test

import java.text.SimpleDateFormat

class TestConstraintDate {

    Date dateUnique
    Date dateMax
    Date dateMin
    Date dateNullable
    Date dateFormat
    Date dateFormatMax
    
    static constraints = {
        dateUnique unique: true
        dateMax  max: new SimpleDateFormat("yyyy-MM-dd").parse("2018-01-01")+10
        dateMin  min: new SimpleDateFormat("yyyy-MM-dd").parse("2018-01-01")-10
        dateNullable  nullable: true
        dateFormat  attributes:[ format: "yyyyMMdd"]
        dateFormatMax  max: new Date().plus(10), attributes:[ format: "yyyyMMdd"]
    }
}
