package com.vgrails.demo

class TestConstraintInteger {

    int intUnique
    int intMax
    int intMin
    
    Integer integerUnique
    Integer integerMax
    Integer integerMin
    
    static constraints = {
        intUnique unique: false
        intMax  max: 10
        intMin  min: 5
        integerUnique unique: true
        integerMax  max: 100
        integerMin  min: -1
    }
}
