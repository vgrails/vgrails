package com.vgrails.utility

import com.vgrails.model.MetaDomain
import com.vgrails.model.MetaField
import com.vgrails.model.MetaService
import com.vgrails.model.VgReply
import grails.compiler.GrailsCompileStatic
import groovy.transform.TypeCheckingMode

/**
 * 框架助手类，
 */
@GrailsCompileStatic(TypeCheckingMode.SKIP)
class FrontHelper {

    /**
     * 完成前端数据到后端数据的格式转换
     * @param metaDomain
     * @param propertyName
     * @param value
     * @param format
     * @return
     */

    static Formatter formatter =new Formatter()

    static VgReply ConvertParameter(MetaDomain metaDomain, String propertyName, String value){

        if(metaDomain == null){
            return new VgReply(code: -1, message: "无效的模型数据")
        }

        MetaField metaField = metaDomain.GetMetaField(propertyName)

        if(metaField == null){
            return new VgReply(code: -1, message: "无效的${metaDomain.locale}属性:${propertyName}")
        }

        try {
            switch(metaField.type){
                case ["int", "Integer", "long", "Long", "float", "Float", "double", "Double", "boolean", "Boolean"]:
                    String classType = metaField.type.capitalize()
                    String methodType = classType

                    if (classType in ["Int", "Integer"]) {
                        classType = "Integer"
                        methodType = "Int"
                    }
                    return new VgReply(params: [value: Class.forName("java.lang.${classType}")."parse${methodType}"(value)])
                case "String":
                    return new VgReply(params: [value: value])
                case "Date":

                    String format = metaField.constraints["format"]

                    if(format == null) format = "yyyy-MM-dd"
                    return new VgReply(params: [value: Date.parse(format, value)])

                default:
                    //关系类型ASSOCIATION: Organization.get(1)
                    MetaDomain refDomain = MetaService.GetModel(metaField.type)
                    long id = Long.parseLong(value)

                    return new VgReply(params: [value: Class.forName("${refDomain.pkg}.${refDomain.className}").get(id)])
            }

        }catch(Exception e){
            if(metaField.constraints["nullable"]==true){
                return new VgReply(code: 0, message: null, params: [value:null])
            }else{
                return new VgReply(code: -1, message: "无效的${metaField.locale}值:${value}", params: [message: e.message])
            }
        }
    }

    /**
     * 属性值的有效性检查
     * @param metaDomain
     * @param propertyName
     * @param value
     * @return
     */
    static VgReply CheckProperty(MetaDomain metaDomain, String propertyName, String value){

        MetaField metaField = metaDomain.GetMetaField(propertyName)

        if(metaField == null){
            return new VgReply(code: -1, message: "无效的${metaDomain.locale}属性:${propertyName}")
        }

        Object val
        VgReply reply = ConvertParameter(metaDomain, propertyName, value)
        if(reply.code !=0){
            return reply
        }else{
            val = reply.params["value"]
        }

        if(metaField.constraints["nullable"]==false && (val == null || val == "")){
            return new VgReply(code: -1, message: "属性${metaField.locale}值不可为空")
        }

        if(metaField.constraints["min"]!=null && (val < metaField.constraints["min"])){
            return new VgReply(code: -1, message: "属性${metaField.locale}值:${val}不满足最小约束:${metaField.constraints["min"]}")
        }

        if(metaField.constraints["max"]!=null && (val > metaField.constraints["max"])){
            return new VgReply(code: -1, message: "属性${metaField.locale}值:${val}不满足最大约束:${metaField.constraints["max"]}")
        }

        if(metaField.constraints["blank"]!=true && (val.toString().trim().length() == 0)){
            return new VgReply(code: -1, message: "属性${metaField.locale}值不满足BLANK约束")
        }

        if(metaField.constraints["inList"]!=null && (metaField.constraints["inList"].contains(val.toString()) == false)){
            return new VgReply(code: -1, message: "属性${metaField.locale}值不满足列表(inList)约束")
        }

        if(metaField.constraints["maxSize"]!=null && (val.toString().length() > metaField.constraints["maxSize"])){
            return new VgReply(code: -1, message: "属性${metaField.locale}值不满足最大长度约束")
        }

        if(metaField.constraints["minSize"]!=null && (val.toString().length() < metaField.constraints["minSize"])){
            return new VgReply(code: -1, message: "属性${metaField.locale}值不满足最小长度约束")
        }

        if(metaField.constraints["matches"]!=null && (val.toString() ==~ metaField.constraints["matches"])==false){
            return new VgReply(code: -1, message: "属性${metaField.locale}值不满足格式约束")
        }

        Class domain = Class.forName("${metaDomain.pkg}.${metaDomain.className}")

        if(metaField.constraints["unique"]==true && domain."findBy${propertyName.capitalize()}"(val) != null){
            return new VgReply(code: -1, message: "属性${metaField.locale}值不满足唯一约束")
        }

        return new VgReply()
    }

    static Map<String, String> formatedCache=[:]

    static synchronized String FormatOutput(String input){
        String output = formatedCache[input]
        if(output==null) {
            output = ""
            input.eachLine { String line ->
                if(line && line.trim().size() > 0) {
                    output += "${line}\n"
                }
            }

            formatedCache[input]=output
        }

        return output
    }

//    def container = { attrs, body ->
//        String id=attrs['id']
//        String component=attrs['component']
//        String flex=""
//
//        if(attrs['flex']!=null){
//            flex = " ,gravity:${attrs['flex']}"
//        }
//
//        if(component == 'grid') {
//            out << """{template: "<div id='${id}_grid'></div><div id='${id}_pager'></div>" ${flex},id: "${id}"}"""
//        }else if(component == 'toolbar') {
//            out << """{template: "<div id='${id}'></div>", height: 48}"""
//        }else if(component == 'sidebar') {
//            out << """{template: "<div id='${id}'></div>", width: 58}"""
//        }else{
//            out << """{template: "<div id='${id}'></div>" ${flex}}"""
//        }
//    }

    static Map<String, Object> BuildComponent(Map<String, Object> params){
        String id=params['id']
        String comp=params['comp']?:params['component']
        String flex=params['flex']?:params['gravity']

        Map output = [id: id]

        if(flex !=null){
            output.gravity = Integer.parseInt(flex)
        }

        switch(comp){
            case "grid":
                output.template = "<div id='${id}_grid'></div><div id='${id}_pager'></div>"
                break
            case "toolbar":
                output.height = 48
                output.template = "<div id='${id}'></div>"
                break
            case "sidebar":
                output.width = 58
                output.template = "<div id='${id}'></div>"
                break
            default:
                output.template = "<div id='${id}'></div>"
                break
        }

        return output
    }

    static synchronized Map<String, Object> Layout(Map<String, Object> layout){

        Map<String, Object> output = [:]

        if(layout.rows!=null || layout.cols!=null){
            output.type = "clean"
            output.view = "layout"

            List<Map> cells = []



            for(Map cell in (layout.rows?:layout.cols)){
                if(cell.id !=null && cell.comp !=null){
                    cells.add(BuildComponent(cell))
                }else{
                    cells.add(Layout(cell))
                }
            }

            if(layout.rows !=null){
                output.rows = cells
            }else{
                output.cols = cells
            }
        }else if(layout.comp!=null && layout.id!=null){
            output = BuildComponent(layout)
        }

        return output
    }
}
