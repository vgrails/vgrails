package com.vgrails.demo

import grails.validation.ValidationException
import static org.springframework.http.HttpStatus.*

class OrgController {

    OrgService orgService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def index(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        respond orgService.list(params), model:[orgCount: orgService.count()]
    }

    def show(Long id) {
        respond orgService.get(id)
    }

    def create() {
        respond new Org(params)
    }

    def save(Org org) {
        if (org == null) {
            notFound()
            return
        }

        try {
            orgService.save(org)
        } catch (ValidationException e) {
            respond org.errors, view:'create'
            return
        }

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.created.message', args: [message(code: 'org.label', default: 'Org'), org.id])
                redirect org
            }
            '*' { respond org, [status: CREATED] }
        }
    }

    def edit(Long id) {
        respond orgService.get(id)
    }

    def update(Org org) {
        if (org == null) {
            notFound()
            return
        }

        try {
            orgService.save(org)
        } catch (ValidationException e) {
            respond org.errors, view:'edit'
            return
        }

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.updated.message', args: [message(code: 'org.label', default: 'Org'), org.id])
                redirect org
            }
            '*'{ respond org, [status: OK] }
        }
    }

    def delete(Long id) {
        if (id == null) {
            notFound()
            return
        }

        orgService.delete(id)

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.deleted.message', args: [message(code: 'org.label', default: 'Org'), id])
                redirect action:"index", method:"GET"
            }
            '*'{ render status: NO_CONTENT }
        }
    }

    protected void notFound() {
        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.not.found.message', args: [message(code: 'org.label', default: 'Org'), params.id])
                redirect action: "index", method: "GET"
            }
            '*'{ render status: NOT_FOUND }
        }
    }
}
