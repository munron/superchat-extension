import Vue from 'vue';
import App from './App.vue';
import { CombinedVueInstance } from 'vue/types/vue';

Vue.config.productionTip = false;

chrome.runtime.onMessage.addListener(
    async function (message, sender, callback) {
        await new Promise(r => setTimeout(() => r(), 1000));
        // console.log("main.ts < chrome.runtime.onMessage.addListener:" + message + " >");
        if (message == "hashchange") {
            appendApp();
        }
    }
);

let vueRender: CombinedVueInstance<Vue, object, object, object, Record<never, any>>;

window.onload = async () => {
    await new Promise(r => setTimeout(() => r(), 2000));
    appendApp();
};

function appendApp() {
    if (vueRender) {
        vueRender.$destroy
        document.querySelector("#app")?.remove();

    }
    const el = document.querySelector("#chatframe");
    if (el) {
        el.insertAdjacentHTML(
            'beforebegin',
            '<div id="app"></div>',
        );
        vueRender = new Vue({
            render: (h) => h(App),
        }).$mount('#app');
    }
}