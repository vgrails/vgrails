package com.vgrails.demo

import grails.gorm.services.Service

@Service(Area)
interface AreaService {

    Area get(Serializable id)

    List<Area> list(Map args)

    Long count()

    void delete(Serializable id)

    Area save(Area area)

}