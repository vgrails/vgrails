package com.vgrails.demo

class TestConstraintDouble {

    double doubleUnique
    double doubleMax
    double doubleMin

    Double doubleCUnique
    Double doubleCMax
    Double doubleCMin

    static constraints = {
        doubleUnique unique: false
        doubleMax  max: 10d
        doubleMin  min: -10d
        doubleCUnique unique: true
        doubleCMax  max: 10d
        doubleCMin  min: -10d
    }
}
