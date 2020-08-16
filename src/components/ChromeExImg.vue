<template>
  <div>
    <img :src="imageUrl" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { getUrl } from "../utils";

@Component
export default class ExImage extends Vue {
  public imageUrl = "";

  @Prop({ default: "logo.png" })
  public imagePath!: string;

  @Watch("imagePath")
  onValueChanged(newValue: string) {
    this.imageUrl = getUrl(newValue);
  }

  public mounted() {
    this.imageUrl = getUrl(this.imagePath);
  }
}
</script>

<style scoped>
img {
  width: 100%;
}
</style>>
