package com.vgrails.model

import com.vgrails.demo.TestConstraintInteger
import com.vgrails.utility.ParallelRunner
import com.vgrails.utility.VgHelper
import grails.testing.mixin.integration.Integration
import grails.transaction.*
import org.springframework.beans.factory.annotation.Value
import spock.lang.Specification

import java.text.SimpleDateFormat

@Integration
@Rollback
class MetaIntegrationSpec extends Specification {

    @Value('${local.server.port}')
    Integer serverPort

    //-----------------------------------------------------------------------------------------------------------------
    // 模型获取相关
    //-----------------------------------------------------------------------------------------------------------------
    void "获取模型"() {
        MetaDomain metaDomain=MetaService.GetModel("organization")
        expect:
        metaDomain.locale == "组织"
        metaDomain.search.size() == 2
        metaDomain.form.size() == 2
        metaDomain.form[1].size() == 3
        metaDomain.sort.size() == 1

        metaDomain.fields.size() == 4
    }

    void "获取模型无Meta"() {
        MetaDomain metaDomain=MetaService.GetModel("organizationNoMeta")

        expect:
        metaDomain.locale == "organizationNoMeta"
        metaDomain.search.size() == 0
        metaDomain.form.size() == 4
        metaDomain.sort.size() == 0

        metaDomain.fields.size() == 4
    }

    void "获取模型异常值"(String model, Object value) {
        expect:
            MetaService.GetModel(model) == value
        where:
        model   |   value
        ""      |   null
        null    |   null
        "O"     |   null
        "Organization"| null
    }

    void "并行获取模型"() {

        ParallelRunner parallelRunner=new ParallelRunner()

        Closure c = {int i, int j ->
            List<String> models = ["organization", "organizationNoMeta"]
            MetaDomain metaDomain=MetaService.GetModel(models.get(j%2))

            assert metaDomain != null
            assert metaDomain.fields.size() > 0
        }

        parallelRunner.Run(4, 1000000, c)
        println parallelRunner.toString()
        expect:

        assert parallelRunner.elapseInseconds >= 0
        assert parallelRunner.operationPerSecond >= 10000
    }

    //-----------------------------------------------------------------------------------------------------------------
    // 约束相关
    //-----------------------------------------------------------------------------------------------------------------

    void "类型转换"(String domain,String propertyName, Object value, int code, Object result) {

        expect:

        VgReply reply = VgHelper.ConvertParameter(MetaService.GetModel(domain), propertyName, value)

        reply.code == code
        reply.params["value"] == result

        where:
        domain|propertyName|value|code|result
//        "testConstraintInteger"|"intUnique"|"1"|0|1
//        "testConstraintInteger"|"intMax"|"9"|0|9
//        "testConstraintInteger"|"intMin"|"-1"|0|-1
//        "testConstraintInteger"|"integerUnique"|"-1"|0|-1
//        "testConstraintInteger"|"integerMin"|"-1"|0|-1
//        "testConstraintInteger"|"integerMax"|"-1"|0|-1
//        "testConstraintInteger"|"integerMax"|"null"|-1|null
//        "testConstraintInteger"|"integerMax"|null|-1|null
//        "testConstraintInteger"|"integerMax"|"otherthing"|-1|null
//
//        "testConstraintLong"|"longUnique"|"1"|0|1l
//        "testConstraintLong"|"longMax"|"9"|0|9l
//        "testConstraintLong"|"longMin"|"-1"|0|-1l
//        "testConstraintLong"|"longCUnique"|"-1"|0|-1l
//        "testConstraintLong"|"longCMin"|"-1"|0|-1l
//        "testConstraintLong"|"longCMax"|"-1"|0|-1l
//        "testConstraintLong"|"longCMax"|"null"|-1|null
//        "testConstraintLong"|"longCMax"|null|-1|null
//        "testConstraintLong"|"longCMax"|"otherthing"|-1|null
//
//        "testConstraintFloat"|"floatUnique"|"1.15"|0|1.15f
//        "testConstraintFloat"|"floatMax"|"9"|0|9f
//        "testConstraintFloat"|"floatMin"|"-1"|0|-1f
//        "testConstraintFloat"|"floatCUnique"|"-1"|0|-1f
//        "testConstraintFloat"|"floatCMin"|"-1"|0|-1f
//        "testConstraintFloat"|"floatCMax"|"-1"|0|-1f
//        "testConstraintFloat"|"floatCMax"|"null"|-1|null
//        "testConstraintFloat"|"floatCMax"|null|-1|null
//        "testConstraintFloat"|"floatCMax"|"otherthing"|-1|null
//
//        "testConstraintDouble"|"doubleUnique"|"1.1501"|0|1.1501d
//        "testConstraintDouble"|"doubleMax"|"9"|0|9d
//        "testConstraintDouble"|"doubleMin"|"-1"|0|-1d
//        "testConstraintDouble"|"doubleCUnique"|"-1"|0|-1d
//        "testConstraintDouble"|"doubleCMin"|"-1"|0|-1d
//        "testConstraintDouble"|"doubleCMax"|"-1"|0|-1d
//        "testConstraintDouble"|"doubleCMax"|"null"|-1|null
//        "testConstraintDouble"|"doubleCMax"|null|-1|null
//        "testConstraintDouble"|"doubleCMax"|"otherthing"|-1|null

        "testConstraintDate"|"dateUnique"|"2018-01-01"|0|new SimpleDateFormat("yyyy-MM-dd").parse("2018-01-01")
        "testConstraintDate"|"dateMax"|"2018-08-30"|0|new SimpleDateFormat("yyyy-MM-dd").parse("2018-08-30")
        "testConstraintDate"|"dateMin"|"2018-08-30"|0|new SimpleDateFormat("yyyy-MM-dd").parse("2018-08-30")
        "testConstraintDate"|"dateNullable"|"2018-08-30"|0|new SimpleDateFormat("yyyy-MM-dd").parse("2018-08-30")
        "testConstraintDate"|"dateNullable"|"null"|0|null
        "testConstraintDate"|"dateNullable"|null|0|null
        "testConstraintDate"|"dateFormat"|"20180830"|0|new SimpleDateFormat("yyyy-MM-dd").parse("2018-08-30")
        "testConstraintDate"|"dateFormatMax"|"20180830"|0|new SimpleDateFormat("yyyy-MM-dd").parse("2018-08-30")
    }
}
