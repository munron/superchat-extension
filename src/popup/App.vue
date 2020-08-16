<template>
  <div id="popup">
    <chrome-ex-img class="chrome-ex-img" :imagePath="'128.png'" />
    <p>Ver 1.0.0</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ChromeExImg from "@/components/ChromeExImg.vue";
import {
  sleep,
  getChromeStorage,
  setChromeStorage,
  addChromeStorangeChangeEvent,
} from "../utils";

@Component({
  components: {
    ChromeExImg,
  },
})
export default class App extends Vue {
  public async mounted() {}

  // 通知をchromeに送信する
  public sendNotificationToBroweser(title: string, message: string) {
    chrome.notifications.clear("id1");
    var notification = chrome.notifications.create(
      "id1",
      {
        type: "basic",
        iconUrl: chrome.runtime.getURL("128.png"),
        title: title,
        message: message,
        priority: 100,
        isClickable: true,
      },
      function () {
        console.log(chrome.runtime.lastError);
      }
    );
  }

  // URLのバリデーション
  public validateUrl(url: string) {
    const urlRe = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    if (!urlRe.test(url)) {
      return false;
    }
    return true;
  }
}
</script>

<style lang="scss" scoped>
#popup {
  width: 600px;
  height: auto;
  margin: 5px;
  display: block;
  text-align: center;
  background-color: black;
  color: white;
  .chrome-ex-img {
    margin: 20px auto;
    width: 200px;
    height: 200px;
  }
}
</style>
