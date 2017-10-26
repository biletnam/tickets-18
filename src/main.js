import Vue from 'vue'
import App from './App'
import VueResource from 'vue-resource'

Vue.use(VueResource);

Vue.http.options.crossOrigin = true
Vue.http.headers.common['Access-Control-Allow-Origin'] = '*'

Vue.config.productionTip = false

new Vue({
    el: '#app',
    template: '<App/>',
    components: {App}
})
