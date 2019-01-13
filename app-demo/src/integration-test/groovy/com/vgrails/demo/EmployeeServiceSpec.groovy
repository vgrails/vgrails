package com.vgrails.demo

import grails.testing.mixin.integration.Integration
import grails.gorm.transactions.Rollback
import spock.lang.Specification
import org.hibernate.SessionFactory

@Integration
@Rollback
class EmployeeServiceSpec extends Specification {

    EmployeeService employeeService
    SessionFactory sessionFactory

    private Long setupData() {
        // TODO: Populate valid domain instances and return a valid ID
        //new Employee(...).save(flush: true, failOnError: true)
        //new Employee(...).save(flush: true, failOnError: true)
        //Employee employee = new Employee(...).save(flush: true, failOnError: true)
        //new Employee(...).save(flush: true, failOnError: true)
        //new Employee(...).save(flush: true, failOnError: true)
        assert false, "TODO: Provide a setupData() implementation for this generated test suite"
        //employee.id
    }

    void "test get"() {
        setupData()

        expect:
        employeeService.get(1) != null
    }

    void "test list"() {
        setupData()

        when:
        List<Employee> employeeList = employeeService.list(max: 2, offset: 2)

        then:
        employeeList.size() == 2
        assert false, "TODO: Verify the correct instances are returned"
    }

    void "test count"() {
        setupData()

        expect:
        employeeService.count() == 5
    }

    void "test delete"() {
        Long employeeId = setupData()

        expect:
        employeeService.count() == 5

        when:
        employeeService.delete(employeeId)
        sessionFactory.currentSession.flush()

        then:
        employeeService.count() == 4
    }

    void "test save"() {
        when:
        assert false, "TODO: Provide a valid instance to save"
        Employee employee = new Employee()
        employeeService.save(employee)

        then:
        employee.id != null
    }
}
