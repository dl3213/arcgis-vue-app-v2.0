import Vue from 'vue'
import Index from './Index.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

// import echarts from 'echarts'
// Vue.prototype.$echarts = echarts

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(Index)
}).$mount('#app')
