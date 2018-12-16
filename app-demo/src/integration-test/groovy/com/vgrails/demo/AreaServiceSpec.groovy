package com.vgrails.demo

import grails.testing.mixin.integration.Integration
import grails.gorm.transactions.Rollback
import spock.lang.Specification
import org.hibernate.SessionFactory

@Integration
@Rollback
class AreaServiceSpec extends Specification {

    AreaService areaService
    SessionFactory sessionFactory

    private Long setupData() {
        // TODO: Populate valid domain instances and return a valid ID
        //new Area(...).save(flush: true, failOnError: true)
        //new Area(...).save(flush: true, failOnError: true)
        //Area area = new Area(...).save(flush: true, failOnError: true)
        //new Area(...).save(flush: true, failOnError: true)
        //new Area(...).save(flush: true, failOnError: true)
        assert false, "TODO: Provide a setupData() implementation for this generated test suite"
        //area.id
    }

    void "test get"() {
        setupData()

        expect:
        areaService.get(1) != null
    }

    void "test list"() {
        setupData()

        when:
        List<Area> areaList = areaService.list(max: 2, offset: 2)

        then:
        areaList.size() == 2
        assert false, "TODO: Verify the correct instances are returned"
    }

    void "test count"() {
        setupData()

        expect:
        areaService.count() == 5
    }

    void "test delete"() {
        Long areaId = setupData()

        expect:
        areaService.count() == 5

        when:
        areaService.delete(areaId)
        sessionFactory.currentSession.flush()

        then:
        areaService.count() == 4
    }

    void "test save"() {
        when:
        assert false, "TODO: Provide a valid instance to save"
        Area area = new Area()
        areaService.save(area)

        then:
        area.id != null
    }
}
