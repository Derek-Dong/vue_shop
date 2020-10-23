import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 导入vue-table-with-tree-grid树形表格组件
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'
// 配置根路径
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
    // axios请求拦截
axios.interceptors.request.use(config => {
    // 为请求头对象，添加Token验证Authorization字段
    console.log(config)
    config.headers.Authorization = window.sessionStorage.getItem('token')
        // 在最后必须return config
    return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')