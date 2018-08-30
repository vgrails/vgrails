package com.vgrails.model

import grails.compiler.GrailsCompileStatic
import grails.gorm.validation.Constraint
import grails.gorm.validation.DefaultConstrainedProperty
import groovy.transform.TypeCheckingMode

/**
 * DomainClass属性基类
 * @author bale_lin
 */

@GrailsCompileStatic(TypeCheckingMode.SKIP)
class MetaField {
    /** 属性名称 */
    String propertyName
    /** 属性类型 */
    String type
    /** 本地化 */
    String locale
    /** 表格列宽 */
    int flex

    Map<String, Object> constraints = [:]


    //类型映射表
    static Map<String, String> typeMapping=[
            int: "Integer",
            long: "Long",
            float: "Float",
            double: "Double",
    ]

    //类型约束映射
    static Map<String, Map<String, Map<String, Object>>> typeConstraints=[
            Integer:[
                    unique:[default: false, type: boolean, nullable: true],
                    max:[default: null, type: Integer, nullable: true],
                    min:[default: null, type: Integer, nullable: true],
            ],
            Long:[
                    unique:[default: false, type: Boolean, nullable: true],
                    max:[default: null, type: Long, nullable: true],
                    min:[default: null, type: Long, nullable: true],
            ],
            Float:[
                    max:[default: null, type: Long, nullable: true],
                    min:[default: null, type: Long, nullable: true],
            ],
            Double:[
                    max:[default: null, type: Double, nullable: true],
                    min:[default: null, type: Double, nullable: true],
            ],
            Date:[
                    unique:[default: false, type: Boolean, nullable: true],
                    nullable:[default: false, type: Boolean, nullable: true],
                    format:[default: "yyyy-MM-dd", type: String, nullable: true],
                    max:[type: Date, nullable: true],
                    min:[type: Date, nullable: true],
            ],
            String:[
                    unique:[default: false, type: Boolean, nullable: true],
                    blank:[default: false, type: Boolean, nullable: true],
                    nullable:[default: false, type: Boolean, nullable: true],
                    inList:[type: List, nullable: true],
                    matches:[type: String, nullable: true],
                    maxSize:[type: Integer, nullable: true],
                    minSize:[type: Integer, nullable: true],
            ],
            ASSOCIATION:[
                    association:[type: String, nullable: false],
                    nullable:[default: false, type: Boolean, nullable: true]
            ]
    ]

    /**
     * 获取类型约束映射表
     * @param type
     * @return
     */
    Map<String, Map<String, Object>> GetConstraintsMap(){
        String mappingType
        if(typeMapping[type]!=null){
            mappingType = typeMapping[type]
        }else{
            mappingType = type
        }

        if(typeConstraints[mappingType]==null){
            mappingType = "ASSOCIATION"
        }

        return typeConstraints[mappingType]
    }

    /**
     * 基于约束设定属性
     * @param c
     */
    MetaField SetByConstraint(DefaultConstrainedProperty c){
        type = c.propertyType.simpleName

        locale = c.attributes?.locale ?:c.propertyName
        propertyName = c.propertyName
        flex = c.attributes?.flex ?:1

        GetConstraintsMap().each{String cName, Map<String, Object> map ->
            //Note: 必须优先采用AppliedConstraints内的值
            if(c.appliedConstraints*.name.contains(cName)){
                for(Constraint constraint in c.appliedConstraints){
                    if(constraint.name == cName){
                        constraints[cName] = constraint.parameter
                        return
                    }
                }
            }else if(c.properties.containsKey(cName) && c.properties[cName]!=null){
                constraints[cName] = c.properties[cName]
            }else if(c.attributes.containsKey(cName) && c.attributes[cName]!=null){
                constraints[cName] = c.attributes[cName]
            }else if(map["nullable"]==true && map["default"]!=null && c.properties.containsKey(cName)==false){
                constraints[cName] = map["default"]
            }else if(map["nullable"]==false && c.properties[cName]==null && c.attributes[cName]==null){
                println "错误:约束值缺失, 属性:${c.propertyName} 约束:${cName}"
            }
        }

        return this
    }
}