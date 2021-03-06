package com.vgrails.test

class TestConstraintString {

    String stringUnique
    String stringMaxSize
    String stringMinSize
    String stringNullable
    String stringInList
    String stringMatches
    String stringBlank
    
    static constraints = {
        stringUnique unique: true
        stringMaxSize  maxSize: 10
        stringMinSize  minSize: 1
        stringNullable  nullable: true
        stringInList  inList: ["AA", "BB", "CC"]
        stringMatches  matches: "[0-9]+"
        stringBlank  blank:true
    }
}
