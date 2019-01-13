package com.vgrails.demo

import grails.gorm.services.Service

@Service(Employee)
interface EmployeeService {

    Employee get(Serializable id)

    List<Employee> list(Map args)

    Long count()

    void delete(Serializable id)

    Employee save(Employee employee)

}