package com.vgrails.model

import grails.compiler.GrailsCompileStatic
import grails.gorm.validation.DefaultConstrainedProperty
import groovy.transform.TypeCheckingMode

import grails.util.Holders

/**
 * 元数据服务
 * @author bale_lin
 */
@GrailsCompileStatic(TypeCheckingMode.SKIP)
class MetaService {

    static transactional = false
    static Map<String, MetaDomain> metaDomainMap=[:]

    /**
     * 获取模型元数据
     * @param model 首字母小写的模型名称
     * @return
     */
    static synchronized MetaDomain GetModel(String model) {
        if(metaDomainMap[model]!=null){
            return metaDomainMap[model]
        }

        def clazz = Holders.grailsApplication.getArtefactByLogicalPropertyName("Domain", model)?.clazz

        if(clazz == null) return null

        Map m = [:]
        boolean needToGenerateDefaultForm = false

        try{
            m = clazz['m']
        }catch(Exception e){}

        if(m == null || m["form"]==null){
            needToGenerateDefaultForm = true
        }

        MetaDomain metaDomain = new MetaDomain()
        List<MetaField> fields = []
        List<String> associations = []

        List<DefaultConstrainedProperty> constraints = clazz.getConstrainedProperties().values()*.property

        metaDomain.name = model
        metaDomain.locale = m["locale"] ?:model
        metaDomain.pkg = clazz.getPackage().name

        List<String> transients = clazz.transients
        if(transients != null){
            transients.removeAll {it.endsWith("Id")}
        }else{
            transients=[]
        }

        fields.add(new MetaField(
                propertyName: "id",
                type: "long",
                locale: "序号",
                flex: 1
        ))

        for(DefaultConstrainedProperty c in constraints){
            MetaField field = new MetaField().SetByConstraint(c)
            fields.add(field)

            if(field.constraints.association!=null){
                associations.add(field.propertyName)
            }

            if(needToGenerateDefaultForm){
                if(m["form"]==null) m["form"]=[]

                List<String> row = []
                row.add(field.propertyName)

                m["form"].add(row)
            }
        }

        metaDomain.associations = associations
        metaDomain.transients = transients
        metaDomain.fields = fields
        metaDomain.search = m["search"] ?:[]
        metaDomain.form = m["form"]
        metaDomain.sort = m["sort"] ?:[]

        metaDomainMap[model]=metaDomain

        return metaDomain
    }
}
