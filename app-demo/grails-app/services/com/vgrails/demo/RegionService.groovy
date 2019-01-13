package com.vgrails.demo

import grails.gorm.services.Service

@Service(Region)
interface RegionService {

    Region get(Serializable id)

    List<Region> list(Map args)

    Long count()

    void delete(Serializable id)

    Region save(Region region)

}