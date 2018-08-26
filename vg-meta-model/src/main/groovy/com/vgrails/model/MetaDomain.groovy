package com.vgrails.model

import grails.compiler.GrailsCompileStatic
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
    Map<String, List<String>> search =[:]
    /** 排序 */
    List<String> sort = []
    /** 非持久 */
    List<String> transients = []
    /** 关系字段 */
    List<String> associations = []


    private Map<String, MetaField> fieldsMap = null


    /**
     * 获得类名(首字母大写)
     * @return
     */
    String getClassName(){
        return name[0].capitalize() + name[1..-1]
    }

    /**
     * 获取字段
     * @param field 字段名称
     * @return
     */
    synchronized MetaField getMetaField(String field){
        if(field == null || field.size() == 0) return null

        if(fieldsMap == null){
            fieldsMap = [:]
            for(MetaField f in fields){
                fieldsMap[f.propertyName]=f
            }
        }

        return fieldsMap[field]
    }
}