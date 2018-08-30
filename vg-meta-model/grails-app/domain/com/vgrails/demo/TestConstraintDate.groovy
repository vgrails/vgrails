package com.vgrails.demo

class TestConstraintDate {

    Date dateUnique
    Date dateMax
    Date dateMin
    Date dateNullable
    Date dateFormat
    Date dateFormatMax
    
    static constraints = {
        dateUnique unique: true
        dateMax  max: new Date().plus(10)
        dateMin  min: new Date().plus(-10)
        dateNullable  nullable: true
        dateFormat  attributes:[ format: "yyyyMMdd"]
        dateFormatMax  max: new Date().plus(10), attributes:[ format: "yyyyMMdd"]
    }
}
