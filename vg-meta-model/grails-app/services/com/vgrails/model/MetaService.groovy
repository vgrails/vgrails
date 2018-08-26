package com.vgrails.model

import grails.gorm.transactions.Transactional

/**
 * 元数据服务
 * @author bale_lin
 */
@Transactional
class MetaService {

    def GetModel() {
        println "MetaService.GetModel"
    }
}
