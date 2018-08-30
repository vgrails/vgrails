package com.vgrails.demo

class TestConstraintFloat {

    float floatUnique
    float floatMax
    float floatMin
    
    Float floatCUnique
    Float floatCMax
    Float floatCMin
    
    static constraints = {
        floatUnique unique: false
        floatMax  max: 10f
        floatMin  min: 5f
        floatCUnique unique: true
        floatCMax  max: 100f
        floatCMin  min: -1f
    }
}
