// WORKROUND for request can't parse params like: sort[name]=desc
webix.proxy.gridProxy = {
    $proxy: true,
    load: function(view, callback, params){
        if (params && (params.filter || params.sort)){
            var url = this.source+((this.source.indexOf("?")==-1)?"?":"&");;
            var details = [];
            // all params except filter/sort (which has different format)
            for(var d in params){
                if (d != "filter" && d != "sort")
                    details.push(d+"="+params[d]);
            };
            // sorting parameters
            if (params.sort)
                details.push("sort_"+params.sort.id+"="+encodeURIComponent(params.sort.dir));
            // filtering parameters
            if (params.filter)
                for (var key in params.filter){
                    var filterValue = params.filter[key];
                    if (filterValue !== "")
                        details.push("filter_"+key+"="+encodeURIComponent(filterValue));
                };
            // log & load
            console.log(details);
            url += details.join("&");
            webix.ajax().bind(view).get(url, callback);
        }
        // or just load with built-in methods
        else
            webix.ajax().bind(view).get(this.source, params, callback);
    }
};

webix.i18n.setLocale("zh-CHS");

pagerHeight = 31;
gridHeaderHeight = 42;
rowHeight = 36;