package com.vgrails.model

import grails.compiler.GrailsCompileStatic
import grails.compiler.GrailsTypeChecked

/**
 * 关系类型枚举
 * @author bale_lin
 */
@GrailsCompileStatic
@GrailsTypeChecked
enum Association {
    one_to_one,
    one_to_many,
    many_to_one,
    many_to_many
}