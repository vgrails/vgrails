package com.vgrails.demo

import grails.gorm.services.Service

@Service(Org)
interface OrgService {

    Org get(Serializable id)

    List<Org> list(Map args)

    Long count()

    void delete(Serializable id)

    Org save(Org org)

}