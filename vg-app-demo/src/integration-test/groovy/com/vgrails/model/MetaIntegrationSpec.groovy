package com.vgrails.model

import com.vgrails.utility.ParallelRunner
import grails.testing.mixin.integration.Integration
import grails.transaction.*
import org.springframework.beans.factory.annotation.Value
import spock.lang.Specification

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
}
