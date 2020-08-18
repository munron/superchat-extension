import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

window.onload = async () => {
    await new Promise(r => setTimeout(() => r(), 2000));
    appendApp();
};

function appendApp() {
    const el = document.querySelector("#chatframe");
    if (el) {
        el.insertAdjacentHTML(
            'beforebegin',
            '<div id="ex-app"></div>',
        );
        new Vue({
            render: (h) => h(App),
        }).$mount('#ex-app');
    }
}