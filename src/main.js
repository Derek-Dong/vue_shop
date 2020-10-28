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

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 导入NProgess包对应的JS和CSS
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import axios from 'axios'
// 配置根路径
axios.defaults.baseURL = 'http://rambuild.cn:8888/api/private/v1'
    // axios请求拦截
    // 在request拦截器中，展示进度条NProgress.start()
axios.interceptors.request.use(config => {
        // console.log(config)
        NProgress.start()
            // 为请求头对象，添加Token验证Authorization字段
        config.headers.Authorization = window.sessionStorage.getItem('token')
            // 在最后必须return config
        return config
    })
    // 在response拦截器中，隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
    NProgress.done()
    return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
    // 将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)

Vue.filter('dateFormat', function(originVal) {
    const dt = new Date(originVal)

    const y = dt.getFullYear()
        // padStart() 方法用另一个字符串填充当前字符串(如果需要的话，会重复多次)
        // 以便产生的字符串达到给定的长度。从当前字符串的左侧开始填充。
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')

    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')