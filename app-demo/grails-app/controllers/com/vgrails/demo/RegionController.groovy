package com.vgrails.demo

import grails.converters.JSON

class RegionController{

   RegionService regionService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def index() {
    }

    def list() {
        println "method: ${request.method}"
        println params

        Map queryMap = [:]


        params.keySet().each { String key->
            if(key.startsWith("sort_")){
                queryMap["sort"] = key - "sort_"
                queryMap["order"] = params[key]
            }
        }

        List<Map<String, String>> datas = []

        long start = 0
        long count = 10

        try{
            start = Integer.parseInt(params.start)
            count = Integer.parseInt(params.count)
        }catch(Exception e){}

        queryMap["max"]=count
        queryMap["offset"]=start


        List<Region> regions=Region.findAll(queryMap)

        Map output = [
                data: regions,
                pos: start,
                total_count: Region.count
        ]

        String out = (output as JSON)

        println "list: ${out}"
        render out
    }

    def tree() {

        println "tree:"
        println params

        long parentId = 0

        try{
            parentId= Long.parseLong(params.parent)
        }catch(Exception e){}

       Region parent = null

        if(parentId !=0){
            parent =Region.findById(parentId)
        }

        List<Map> children = GetChildren(parent)

        Map output = [
                parent: parentId,
                data: children
        ]
        println "output:${output}"

        render (output as JSON)
    }

    List<Map> GetChildren(Region a){
        List<Map> output = []

        List<Region> children =Region.findAllByParent(a)

        if(children == null){
            return []
        }else{
            for(Region kid in children){

                List<Region> grandson =Region.findAllByParent(kid)

                output.add([
                        id: kid.id,
                        value: kid.name
                ])
                if(grandson!=null && grandson.size()>0){
                    output[-1].webix_kids = true
                }
            }

            return output
        }
    }

    def chart(){

        List output = [
                [ count : new Random().nextInt(1000), dollars : 130, color : "#ff0000", type : "AA" ],
                [ count : new Random().nextInt(1000), dollars : 280, color : "#00ff00", type : "BB" ],
                [ count : new Random().nextInt(1000), dollars : 98, color : "#0000ff", type : "CC" ],
                [ count : new Random().nextInt(1000), dollars : 110, color : "#ffff00", type : "DD" ]
        ]

        render (output as JSON)
    }
}
