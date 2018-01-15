// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

import VueSocketio from 'vue-socket.io'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'animate.css/animate.css'

import App from './App'
import router from './router'

Vue.config.productionTip = false
let removePort = address => (address.split(':').length > 1 ? address.split(':', 2).join(':') : address)

Vue.use(ElementUI)
Vue.use(VueSocketio, `${removePort(window.location.origin)}:3000`)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
