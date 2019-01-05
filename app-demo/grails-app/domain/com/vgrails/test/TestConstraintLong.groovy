package com.vgrails.test

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
        longMin  min: -10l
        longCUnique unique: true
        longCMax  max: 10l
        longCMin  min: -10l
    }
}
