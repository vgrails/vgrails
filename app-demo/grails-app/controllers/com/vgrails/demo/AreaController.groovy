package com.vgrails.demo

import grails.converters.JSON

class AreaController {

    AreaService areaService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def index(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        respond areaService.list(params), model:[areaCount: areaService.count()]
    }

    def grid() {
        areaService
    }

    def tree() {

        println params

        long parentId = 0

        try{
            parentId= Long.parseLong(params.parent)
        }catch(Exception e){}

        Area parent = null

        if(parentId !=0){
            parent = Area.findById(parentId)
        }

        List<Map> children = GetChildren(parent)

        Map output = [
                parent: parentId,
                data: children
        ]
        println "output:${output}"

        render (output as JSON)
    }

    List<Map> GetChildren(Area a){
        List<Map> output = []

        List<Area> children = Area.findAllByParent(a)

        if(children == null){
            return []
        }else{
            for(Area kid in children){

                List<Area> grandson = Area.findAllByParent(kid)

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

//    var chartData = [

//    ];
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
