package com.vgrails.demo

import grails.testing.mixin.integration.Integration
import grails.gorm.transactions.Rollback
import spock.lang.Specification
import org.hibernate.SessionFactory

@Integration
@Rollback
class RegionServiceSpec extends Specification {

    RegionService regionService
    SessionFactory sessionFactory

    private Long setupData() {
        // TODO: Populate valid domain instances and return a valid ID
        //new Region(...).save(flush: true, failOnError: true)
        //new Region(...).save(flush: true, failOnError: true)
        //Region region = new Region(...).save(flush: true, failOnError: true)
        //new Region(...).save(flush: true, failOnError: true)
        //new Region(...).save(flush: true, failOnError: true)
        assert false, "TODO: Provide a setupData() implementation for this generated test suite"
        //region.id
    }

    void "test get"() {
        setupData()

        expect:
        regionService.get(1) != null
    }

    void "test list"() {
        setupData()

        when:
        List<Region> regionList = regionService.list(max: 2, offset: 2)

        then:
        regionList.size() == 2
        assert false, "TODO: Verify the correct instances are returned"
    }

    void "test count"() {
        setupData()

        expect:
        regionService.count() == 5
    }

    void "test delete"() {
        Long regionId = setupData()

        expect:
        regionService.count() == 5

        when:
        regionService.delete(regionId)
        sessionFactory.currentSession.flush()

        then:
        regionService.count() == 4
    }

    void "test save"() {
        when:
        assert false, "TODO: Provide a valid instance to save"
        Region region = new Region()
        regionService.save(region)

        then:
        region.id != null
    }
}
