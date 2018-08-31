package vg.meta.model

import grails.util.Holders

class BootStrap {

    def init = { servletContext ->

        println "Bootstrap from meta.model"

        Holders.grailsApplication.getArtefacts("Domain").each{
            println "${it.packageName}.${it.clazz.simpleName}"
        }

        println Holders.grailsApplication.config

        println new File("ABC.txt").absolutePath

        new File("ABC.txt").delete()
    }
    def destroy = {
    }
}
