package com.vgrails.model

import grails.compiler.GrailsCompileStatic
import grails.compiler.GrailsTypeChecked

/**
 * 搜索类型枚举
 * @author bale_lin
 */
@GrailsCompileStatic
@GrailsTypeChecked
enum Search {
    /** 不支持搜索 */
    none,
    /** 下拉单字段搜索 */
    standard,
    /** 多字段AJAX搜索 */
    ajax,
    /** 多字段与搜索 */
    combo
}