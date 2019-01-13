package com.vgrails.demo

import grails.testing.mixin.integration.Integration
import grails.gorm.transactions.Rollback
import spock.lang.Specification
import org.hibernate.SessionFactory

@Integration
@Rollback
class OrgServiceSpec extends Specification {

    OrgService orgService
    SessionFactory sessionFactory

    private Long setupData() {
        // TODO: Populate valid domain instances and return a valid ID
        //new Org(...).save(flush: true, failOnError: true)
        //new Org(...).save(flush: true, failOnError: true)
        //Org org = new Org(...).save(flush: true, failOnError: true)
        //new Org(...).save(flush: true, failOnError: true)
        //new Org(...).save(flush: true, failOnError: true)
        assert false, "TODO: Provide a setupData() implementation for this generated test suite"
        //org.id
    }

    void "test get"() {
        setupData()

        expect:
        orgService.get(1) != null
    }

    void "test list"() {
        setupData()

        when:
        List<Org> orgList = orgService.list(max: 2, offset: 2)

        then:
        orgList.size() == 2
        assert false, "TODO: Verify the correct instances are returned"
    }

    void "test count"() {
        setupData()

        expect:
        orgService.count() == 5
    }

    void "test delete"() {
        Long orgId = setupData()

        expect:
        orgService.count() == 5

        when:
        orgService.delete(orgId)
        sessionFactory.currentSession.flush()

        then:
        orgService.count() == 4
    }

    void "test save"() {
        when:
        assert false, "TODO: Provide a valid instance to save"
        Org org = new Org()
        orgService.save(org)

        then:
        org.id != null
    }
}
