//-----------------------------------
// VGRAILS相关配置
//-----------------------------------

vg {
    app {
        name = "旺财销售管理系统(演示)"
        icon = "mdi-clipboard-pulse-outline"
        version = "1.0.0"
    }

    auth {
        roles = [SYS_USER:"用户", SYS_MANAGER: "经理", SYS_ADMIN: "管理员"]
    }

    sidebar = [
            [id: "purchaseMgr", label: "订单", items: [
                    [id: "personalPurchase", label: "个人订单", exclude: ["SYS_ADMIN"], action: []],
                    [id: "orgnizationPurchase", label: "组织订单", exclude: ["SYS_USER"], action: []]
            ]
            ],
            [id: "employeeMgr", label: "员工", items: [
                    [id: "personalInf", label: "个人信息", action: []],
                    [id: "teamInf", label: "团队信息", action: []],
                    [id: "orgnizationInf", label: "组织订单", exclude: ["SYS_USER"], action: []]
            ]
            ],
            [id: "productMgr", label: "产品", items: [
                    [id: "teamProduct", label: "团队产品", exclude: ["SYS_ADMIN"], action: []],
                    [id: "Products", label: "组织产品", exclude: ["SYS_USER"], action: []]
            ]
            ],
            [id: "reportMgr", label: "报表", items: [
                    [id: "productPurchase", label: "产品销售", exclude: ["SYS_ADMIN"], action: []],
                    [id: "teamPurchase", label: "团队销售", exclude: ["SYS_ADMIN"], action: []],
                    [id: "organizationPruchase", label: "组织销售", exclude: ["SYS_USER"], action: []]
            ]
            ],
            [id: "configMgr", label: "配置", items: [
                    [id: "userConfig", label: "用户配置", include: ["SYS_ADMIN"], action: []],
                    [id: "logMgr", label: "日志管理", include: ["SYS_ADMIN"], action: []]
            ]
            ],
    ]
}



