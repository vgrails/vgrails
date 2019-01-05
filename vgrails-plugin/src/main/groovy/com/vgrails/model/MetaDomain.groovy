package com.vgrails.model

import grails.compiler.GrailsCompileStatic
import groovy.json.JsonOutput
import groovy.transform.TypeCheckingMode

/**
 * DomainClass属性基类
 * @author bale_lin
 */

@GrailsCompileStatic(TypeCheckingMode.SKIP)
class MetaDomain {
    /** 首字母小写 */
    String name
    /** 包名 */
    String pkg
    /** 本地化 */
    String locale
    /** 属性 */
    List<MetaField> fields = []
    /** 表单 */
    List<List<String>> form = []
    /** 搜索 */
    List<String> search =[]
    /** 排序 */
    List<String> sort = []
    /** 非持久 */
    List<String> transients = []
    /** 关系字段 */
    List<String> associations = []


    private Map<String, MetaField> fieldsMap = [:]


    /**
     * 获得类名(首字母大写)
     * @return
     */
    String getClassName(){
        return name[0].capitalize() + name[1..-1]
    }

    /**
     * 获取字段
     * @param fieldName 字段名称
     * @return
     */
    synchronized MetaField GetMetaField(String fieldName){
        if(fieldName == null || fieldName.size() == 0) return null

        if(fieldsMap == null || (fieldsMap.size() != fields.size())){
            for(MetaField f in fields){
                fieldsMap[f.propertyName]=f
            }
        }

        return fieldsMap[fieldName]
    }


}