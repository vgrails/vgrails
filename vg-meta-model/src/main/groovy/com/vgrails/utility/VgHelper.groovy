package com.vgrails.utility

import com.vgrails.demo.Organization
import com.vgrails.model.MetaDomain
import com.vgrails.model.MetaField
import com.vgrails.model.MetaService
import com.vgrails.model.VgReply
import grails.compiler.GrailsCompileStatic
import grails.compiler.GrailsTypeChecked
import groovy.transform.TypeCheckingMode

/**
 * 框架助手类，
 */
@GrailsCompileStatic(TypeCheckingMode.SKIP)
class VgHelper {

    /**
     * 完成前端数据到后端数据的格式转换
     * @param metaDomain
     * @param propertyName
     * @param value
     * @param format
     * @return
     */
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

        Map<String, Map<String, Object>> constraintsMap = metaField.GetConstraintsMap()
        
        if(constraintsMap["nullable"]==false && (val == null || val == "")){
            return new VgReply(code: -1, message: "属性${metaField.locale}值不可为空")
        }

        if(constraintsMap["min"]!=null && (val < constraintsMap["min"])){
            return new VgReply(code: -1, message: "属性${metaField.locale}值:${val}不满足最小约束:${constraintsMap["min"]}")
        }

        if(constraintsMap["max"]!=null && (val < constraintsMap["max"])){
            return new VgReply(code: -1, message: "属性${metaField.locale}值:${val}不满足最大约束:${constraintsMap["max"]}")
        }

        if(constraintsMap["blank"]!=true && (val.toString().trim().length() == 0)){
            return new VgReply(code: -1, message: "属性${metaField.locale}值不满足BLANK约束")
        }

        if(constraintsMap["inList"]!=null && (constraintsMap["inList"].containsKey(val.toString()) == false)){
            return new VgReply(code: -1, message: "属性${metaField.locale}值不满足列表(inList)约束")
        }

        if(constraintsMap["maxSize"]!=null && (val.toString().length() > constraintsMap["maxSize"])){
            return new VgReply(code: -1, message: "属性${metaField.locale}值不满足最大长度约束")
        }

        if(constraintsMap["minSize"]!=null && (val.toString().length() < constraintsMap["minSize"])){
            return new VgReply(code: -1, message: "属性${metaField.locale}值不满足最小长度约束")
        }

        if(constraintsMap["matches"]!=null && (val.toString() ==~ constraintsMap["matches"])==false){
            return new VgReply(code: -1, message: "属性${metaField.locale}值不满足格式约束")
        }

        Class domain = Class.forName("${metaDomain.pkg}.${metaDomain.className}")

        if(constraintsMap["unique"]==true && domain."findBy${propertyName.capitalize()}"(val) != null){
            return new VgReply(code: -1, message: "属性${metaField.locale}值不满足唯一约束")
        }

        return new VgReply()
    }
}
