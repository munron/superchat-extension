<template>
  <div id="popup">
    <h1></h1>
    <p>Vtuberさん向け！配信者のスパチャ読みを支援します</p>
    <p>Ver 1.0.0</p>
    <chrome-ex-img class="chrome-ex-img" :imagePath="'128.png'" />
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
}
</script>

<style lang="scss" scoped>
#popup {
  width: 300px;
  height: auto;
  margin: 5px;
  display: block;
  text-align: center;
  background-color: white;
  color: white;
  .chrome-ex-img {
    margin: 20px auto;
    width: 200px;
    height: 200px;
  }
}
</style>
