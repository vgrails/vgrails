package vg.app.demo

import com.vgrails.demo.TestConstraintDate
import com.vgrails.demo.TestConstraintDouble
import com.vgrails.demo.TestConstraintFloat
import com.vgrails.demo.TestConstraintInteger
import com.vgrails.demo.TestConstraintLong
import com.vgrails.demo.TestConstraintString
import grails.util.Environment

import java.text.SimpleDateFormat

class BootStrap {

    def init = { servletContext ->

        new TestConstraintInteger(intUnique: 1, intMin: 5, intMax: 10, integerUnique: 1, integerMin: 0, integerMax: 98).save(failOnError:true)
        new TestConstraintLong(longUnique: 0, longMin: -10, longMax: 10, longCUnique: 0, longCMin: -10, longCMax: 10).save(failOnError:true)
        new TestConstraintFloat(floatUnique: 0, floatMin: 8, floatMax: 8, floatCUnique: 0, floatCMin: 0, floatCMax: 10).save(failOnError:true)
        new TestConstraintDouble(doubleUnique: 0, doubleMin: 8, doubleMax: 8, doubleCUnique: 0, doubleCMin: 0, doubleCMax: 0).save(failOnError:true)

        new TestConstraintDate(
                dateUnique: new SimpleDateFormat("yyyy-MM-dd").parse("2018-01-01"),
                dateMin: new SimpleDateFormat("yyyy-MM-dd").parse("2018-01-01"),
                dateMax: new SimpleDateFormat("yyyy-MM-dd").parse("2018-01-01"),
                dateNullable: new SimpleDateFormat("yyyy-MM-dd").parse("2018-01-01"),
                dateFormat: new SimpleDateFormat("yyyy-MM-dd").parse("2018-01-01"),
                dateFormatMax: new SimpleDateFormat("yyyy-MM-dd").parse("2018-01-01")
        ).save(failOnError:true)

        new TestConstraintString(
                stringUnique: "unique",
                stringBlank: "1 ",
                stringInList: "AA",
                stringMatches: "11111",
                stringMaxSize: "123",
                stringMinSize: "123"
        ).save(failOnError:true)

        println "TestConstraintFloat:${TestConstraintFloat.count}"
    }
    def destroy = {
    }
}
