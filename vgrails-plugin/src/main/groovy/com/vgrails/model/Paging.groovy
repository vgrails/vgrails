package com.vgrails.model

import grails.compiler.GrailsCompileStatic
import groovy.transform.TypeCheckingMode

/**
 * 分页
 * @author bale_lin
 */

@GrailsCompileStatic
class Paging {
    /** 总记录数 */
    long total
    /** 分页大小 */
    long size
    /** 当前页 */
    long page
}
