package com.vgrails.model

import grails.compiler.GrailsCompileStatic
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
                    unique:[default: false, type: boolean, nullable: true],
                    max:[default: null, type: Long, nullable: true],
                    min:[default: null, type: Long, nullable: true],
            ],
            Float:[
                    max:[default: null, type: Long, nullable: true],
                    min:[default: null, type: Long, nullable: true],
                    roundTo:[default: 2, type: Integer, nullable: true],
            ],
            Double:[
                    max:[default: null, type: Double, nullable: true],
                    min:[default: null, type: Double, nullable: true],
                    roundTo:[default: 4, type: Integer, nullable: true],
            ],
            Date:[
                    unique:[default: false, type: boolean, nullable: true],
                    nullable:[default: false, type: Boolean, nullable: true],
                    format:[default: "yyyy-MM-dd", type: String, nullable: true],
                    max:[type: Date, nullable: true],
                    min:[type: Date, nullable: true],
            ],
            String:[
                    unique:[default: false, type: boolean, nullable: true],
                    blank:[default: false, type: boolean, nullable: true],
                    nullable:[default: false, type: Boolean, nullable: true],
                    inList:[type: List, nullable: true],
                    matches:[type: String, nullable: true],
                    maxSize:[type: Integer, nullable: true],
                    minSize:[type: Integer, nullable: true],
            ],
            Association:[
                    association:[type: String, nullable: false],
            ]
    ]
}