package com.vgrails.demo

import grails.converters.JSON

class DemoController {

    def index() {
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
                    time: "00:11:${((i%60) + 100).toString()[1..-1]}",
                    action: ["购买", "出售", "击伤", "击杀"][i%4],
                    target: ["杨颖", "杨幂", "疏影", "亦菲"][i%4],
            ]

            data['desc'] = "${data['id']}${data['action']}${data['target']}"

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

        render (output as JSON)
    }
}
