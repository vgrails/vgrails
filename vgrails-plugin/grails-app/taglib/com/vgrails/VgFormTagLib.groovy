package com.vgrails

import com.vgrails.model.MetaDomain
import com.vgrails.model.MetaField
import com.vgrails.model.MetaService
import com.vgrails.utility.FrontHelper
import grails.converters.JSON
import grails.util.Environment

class VgFormTagLib {
    static namespace = "m"
    static defaultEncodeAs = [taglib:'none']

    def form = { attrs, body ->
        String model=attrs['model']
        String id= attrs['id']
        String output = """
    {
        view:"form",
        container:"${id}",
        elements:[
"""
        output = output.trim() + "\n"
        MetaDomain domain = MetaService.GetModel(model)

        List<List<String>> fieldLines = domain.form

        for(List<String> fieldLine in fieldLines){
            if(fieldLine.size() == 1){
                //单行单列
                MetaField f = domain.GetMetaField(fieldLine[0])
                output = output + "{view:'text',label:'${f.locale}',id:'form_${f.propertyName}',type:'form'},\n"
            }else{
                //单行多列
                output = output + "{cols:[\n"

                for(String field in fieldLine){
                    MetaField f = domain.GetMetaField(field)
                    output = output + "{view:'text',label:'${f.locale}',id:'form_${f.propertyName}',type:'form'},\n"
                }
                output = output + "]},\n"
            }
        }

        output = output + "]},"

        out << "webix.ui(${output});"
    }
}
