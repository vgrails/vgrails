package vg.app.demo

import com.vgrails.demo.TestConstraintDate
import com.vgrails.demo.TestConstraintDouble
import com.vgrails.demo.TestConstraintFloat
import com.vgrails.demo.TestConstraintInteger
import com.vgrails.demo.TestConstraintLong
import grails.util.Environment

import java.text.SimpleDateFormat

class BootStrap {

    def init = { servletContext ->

        if(Environment.current == Environment.TEST){



            new TestConstraintInteger(intUnique: 1, intMin: 8, intMax: 8, integerUnique: 1, integerMin: 0, integerMax: 98).save(failOnError:true)
            new TestConstraintLong(longUnique: 1, longMin: 8, longMax: 8, longCUnique: 1, longCMin: 0, longCMax: 98).save(failOnError:true)
            new TestConstraintFloat(floatUnique: 1, floatMin: 8, floatMax: 8, floatCUnique: 1, floatCMin: 0, floatCMax: 98).save(failOnError:true)
            new TestConstraintDouble(doubleUnique: 1, doubleMin: 8, doubleMax: 8, doubleCUnique: 1, doubleCMin: 0, doubleCMax: 98).save(failOnError:true)

//            new TestConstraintDate(
//                    dateUnique: new SimpleDateFormat("yyyy-MM-dd").parse("2018-01-01"),
//                    dateMin: new SimpleDateFormat("yyyy-MM-dd").parse("2018-08-30"),
//                    dateMax: new SimpleDateFormat("yyyy-MM-dd").parse("2018-08-30"),
//                    dateNullable: new SimpleDateFormat("yyyy-MM-dd").parse("2018-08-30"),
//                    dateFormat: new SimpleDateFormat("yyyy-MM-dd").parse("2018-08-30"),
//                    dateFormatMax: new SimpleDateFormat("yyyy-MM-dd").parse("2018-08-30")
//            ).save(failOnError:true)

            println "TestConstraintDate:${TestConstraintDate.count}"
        }
    }
    def destroy = {
    }
}
