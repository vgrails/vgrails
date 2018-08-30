package com.vgrails.demo

class TestConstraintLong {

    long longUnique
    long longMax
    long longMin
    
    Long longCUnique
    Long longCMax
    Long longCMin
    
    static constraints = {
        longUnique unique: false
        longMax  max: 10l
        longMin  min: 5l
        longCUnique unique: true
        longCMax  max: 100l
        longCMin  min: -1l
    }
}
