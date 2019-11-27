import Vue from 'vue';
import vuetify from './plugins/vuetify';
import App from './App.vue';

Vue.use(vuetify);

new Vue(Object.assign(App, { vuetify })).$mount('#app');
