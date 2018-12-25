package com.vgrails.demo

import grails.converters.JSON

class DemoController {

    def index() {
    }

    def layout() {
    }

    def form(){

    }

    def test() {
        render(
                template: "/layout/leftUpDown",
                model:[
                        left: "leftGrid", leftModel: "organization",
                        up:"upGrid", upModel: "organization",
                        down: "downGrid", downModel: "organization"
                ]
        )
    }

    def list() {
        println "method: ${request.method}"
        println params

        List<Map<String, String>> datas = []

        int numberOfRecords = 1000

        //{time: '00:11:12', hero:'幻影刺客', action: '击杀', target: '斧王', desc: '幻影刺客击杀了斧王。'},
        for(int i=0;i<numberOfRecords;i++){
            Map<String, String> data = [
                    id: i+1,
                    name: "名称${i}",
                    province: "省份${i}",
                    city: "城市${i}",
                    area: "地区${i}"
            ]

            datas.add(data)
        }

        int start = 0
        int count = 10

        try{
            start = Integer.parseInt(params.start)
            count = Integer.parseInt(params.count)
        }catch(Exception e){}

        int begin = start
        int end = start + count -1

        if(end >= datas.size() -1){
            end = datas.size() -1
        }

        Map output = [
                data: datas[begin..end],
                pos: start,
                total_count: datas.size()
        ]

        println "output:${output}"

        render (output as JSON)
    }
}
