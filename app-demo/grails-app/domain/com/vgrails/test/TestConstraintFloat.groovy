package com.vgrails.test

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
        floatMin  min: -10f
        floatCUnique unique: true
        floatCMax  max: 10f
        floatCMin  min: -10f
    }
}
