package com.vgrails.demo

import grails.converters.JSON

class EmployeeController {

    def list() {

        println "list:"
        println params

        List<Map<String, String>> employees = []
        for(int i=0;i<1000;i++){
            employees.add([name: "windy ${i}", age: "${i}", familyName: "木", givenName: "妙"])
        }

        int page = Integer.parseInt(params['page']?:"0")
        int recPerPage = Integer.parseInt(params['recPerPage']?:"20")

        int begin = page * recPerPage
        int end = (page + 1) * recPerPage

        if(end > employees.size() -1 ){
            end = employees.size() -1
        }

        List<Map<String, String>> employeesList = []

        for(int i=begin; i<end;i++){
            employeesList.add(employees[i])
        }
        Map output =[
                result: 200,
                data: employeesList,
                message: "",

                pager: [
                        page: page,
                        recTotal: employees.size(),
                        recPerPage: recPerPage
                ]
        ]

        render (output as JSON)
    }

    def form() {
        println params

        params.each{
            println "${it.key} ${it.value}(${it.value.class.simpleName})"
        }

        redirect(uri: "/")
    }
}
