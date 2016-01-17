module.exports = [
    {
        name: '内容管理',
        actions: [
            {
                name: '内容列表查看',
                value: 'CONTENT_INDEX',
                description: '内容列表查看'
            },{
                name: '发布内容',
                value: 'CONTENT_CREATE',
                description: '发布内容'
            },{
                name: '单页浏览',
                value: 'CONTENT_DETAIL',
                description: '单页浏览'
            },{
                name: '编辑内容',
                value: 'CONTENT_UPDATE',
                description: '编辑内容'
            },{
                name: '删除内容',
                value: 'CONTENT_DELETE',
                description: '删除内容'
            }
        ]
    },{
        name: '用户管理',
        actions: [
            {
                name: '用户访问',
                value: 'USER_INDEX',
                description: '用户访问'
            },{
                name: '创建用户',
                value: 'USER_CREATE',
                description: '创建用户'
            },{
                name: '查看用户信息',
                value: 'USER_DETAIL',
                description: '查看用户信息'
            },{
                name: '编辑用户',
                value: 'USER_UPDATE',
                description: '编辑用户'
            },{
                name: '删除用户',
                value: 'USER_DELETE',
                description: '删除用户'
            }
        ]
    },{
        name: '分类管理',
        actions: [
            {
                name: '分类访问',
                value: 'CATEGORY_INDEX',
                description: '分类访问'
            },{
                name: '创建分类',
                value: 'CATEGORY_CREATE',
                description: '创建分类'
            },{
                name: '查看分类信息',
                value: 'CATEGORY_DETAIL',
                description: '查看分类信息'
            },{
                name: '编辑分类',
                value: 'CATEGORY_UPDATE',
                description: '编辑分类'
            },{
                name: '删除分类',
                value: 'CATEGORY_DELETE',
                description: '删除分类'
            }
        ]
    },{
        name: '评论管理',
        actions: [
            {
                name: '评论访问',
                value: 'COMMENT_INDEX',
                description: '评论访问'
            },{
                name: '创建评论',
                value: 'COMMENT_CREATE',
                description: '创建评论'
            },{
                name: '查看评论信息',
                value: 'COMMENT_DETAIL',
                description: '查看评论信息'
            },{
                name: '编辑评论',
                value: 'COMMENT_UPDATE',
                description: '编辑评论'
            },{
                name: '删除评论',
                value: 'COMMENT_DELETE',
                description: '删除评论'
            }
        ]
    },{
        name: '文件管理',
        actions: [
            {
                name: '文件访问',
                value: 'FILE_INDEX',
                description: '文件访问'
            },{
                name: '上传文件',
                value: 'FILE_CREATE',
                description: '上传文件'
            },{
                name: '查看文件信息',
                value: 'FILE_DETAIL',
                description: '查看文件信息'
            },{
                name: '编辑文件',
                value: 'FILE_UPDATE',
                description: '编辑文件'
            },{
                name: '删除文件',
                value: 'FILE_DELETE',
                description: '删除文件'
            }
        ]
    },{
        name: '消息管理-message',
        actions: [
            {
                name: '消息访问',
                value: 'MESSAGE_INDEX',
                description: '消息访问'
            },{
                name: '创建消息',
                value: 'MESSAGE_CREATE',
                description: '创建消息'
            },{
                name: '查看消息',
                value: 'MESSAGE_DETAIL',
                description: '查看消息'
            },{
                name: '编辑消息',
                value: 'MESSAGE_UPDATE',
                description: '编辑消息'
            },{
                name: '删除消息',
                value: 'MESSAGE_DELETE',
                description: '删除消息'
            }
        ]
    },{
        name: '通知管理-notification',
        actions: [
            {
                name: '通知访问',
                value: 'NOTIFICATION_INDEX',
                description: '通知访问'
            },{
                name: '创建通知',
                value: 'NOTIFICATION_CREATE',
                description: '创建通知'
            },{
                name: '查看通知信息',
                value: 'NOTIFICATION_DETAIL',
                description: '查看通知信息'
            },{
                name: '编辑通知',
                value: 'NOTIFICATION_UPDATE',
                description: '编辑通知'
            },{
                name: '删除通知',
                value: 'NOTIFICATION_DELETE',
                description: '删除通知'
            }
        ]
    },{
        name: '页面管理',
        actions: [
            {
                name: '页面访问',
                value: 'PAGE_INDEX',
                description: '页面访问'
            },{
                name: '创建页面',
                value: 'PAGE_CREATE',
                description: '创建页面'
            },{
                name: '查看页面信息',
                value: 'PAGE_DETAIL',
                description: '查看页面信息'
            },{
                name: '编辑页面',
                value: 'PAGE_UPDATE',
                description: '编辑页面'
            },{
                name: '删除页面',
                value: 'PAGE_DELETE',
                description: '删除页面'
            }
        ]
    },{
        name: '角色管理',
        actions: [
            {
                name: '角色访问',
                value: 'ROLE_INDEX',
                description: '角色访问'
            },{
                name: '创建角色',
                value: 'ROLE_CREATE',
                description: '创建角色'
            },{
                name: '查看角色信息',
                value: 'ROLE_DETAIL',
                description: '查看角色信息'
            },{
                name: '编辑角色',
                value: 'ROLE_UPDATE',
                description: '编辑角色'
            },{
                name: '删除角色',
                value: 'ROLE_DELETE',
                description: '删除角色'
            }
        ]
    },{
        name: '标签管理',
        actions: [
            {
                name: '标签访问',
                value: 'TAG_INDEX',
                description: '标签访问'
            },{
                name: '创建标签',
                value: 'TAG_CREATE',
                description: '创建标签'
            },{
                name: '查看标签信息',
                value: 'TAG_DETAIL',
                description: '查看标签信息'
            },{
                name: '编辑标签',
                value: 'TAG_UPDATE',
                description: '编辑标签'
            },{
                name: '删除标签',
                value: 'TAG_DELETE',
                description: '删除标签'
            }
        ]
    }
];