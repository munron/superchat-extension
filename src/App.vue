<template>
  <div id="app">
    <div
      class="menu-default-chatview"
      v-bind:class="{ active: isDefaultView }"
      @click="addDefaultChatViewer"
    >チャット🐻</div>
    <div
      class="menu-super-chatview"
      v-bind:class="{ active: !isDefaultView }"
      @click="addSuperChatViewer"
    >スパチャ</div>
    <div
      v-if="!isDefaultView"
      id="over-super-chat-viewer"
      v-bind:style="{ width: superChatViewerWidth+ 'px', height: superChatViewerHeight + 5 + 'px'}"
    >
      <div
        class="super-chat"
        v-for="(superChat, index) in superChats"
        v-bind:key="index"
        @click="favoriteSuperChat(index)"
      >
        <div class="top" v-bind:style="{ 'background-color': superChat.primaryColor }">
          <img class="icon" :src="superChat.iconSrc" />
          <div class="info">
            <p v-bind:style="{ color: superChat.authorNameColor}">{{superChat.authorName}}</p>
            <p v-bind:style="{ color: superChat.headerColor}">{{superChat.purchaseAmount}}</p>
          </div>
          <div class="time">
            <p v-bind:style="{ color: superChat.timestamp}">{{superChat.timestamp}}</p>
          </div>
          <div v-if="superChat.checked" class="fav">
            <chrome-ex-img class="chrome-ex-img" :imagePath="'48.png'" />
          </div>
        </div>
        <div class="bottom" v-bind:style="{ 'background-color': superChat.secondaryColor }">
          <p v-bind:style="{ color: superChat.messageColor}">{{superChat.message}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { sleep } from "./utils";
import { SuperChat } from "./utils";
import ChromeExImg from "@/components/ChromeExImg.vue";
import moment from "moment";

@Component({
  components: {
    ChromeExImg,
  },
})
export default class App extends Vue {
  public mounted() {
    this.start();
    chrome.runtime.onMessage.addListener((message, sender, callback) => {
      console.log(message);
      if (message == "hashchange") {
        this.isDefaultView = true;
        this.initSuperChats();
      }
    });
    window.addEventListener(
      "resize",
      () => {
        const el = document.getElementById("chatframe") as HTMLIFrameElement;
        if (el) {
          this.superChatViewerWidth = el.clientWidth;
          this.superChatViewerHeight = el.clientHeight;
        }
      },
      false
    );
  }

  //　お行儀が良いのでループを確実に止めておく
  public beforeDestroy() {
    this.isLoop = false;
    this.superChats = [];
  }

  public initSuperChats() {
    this.superChats = [
      {
        iconSrc: chrome.extension.getURL("128.png"),
        authorName: "スパチャ",
        purchaseAmount: "♡♡♡",
        message:
          "スパチャコメントを収集してします！クリックすると既読マーク💗が付きます",
        timestamp: moment(new Date()).format("hh:mm"),
        html: "",
        primaryColor: "rgba(255,202,40,1)",
        secondaryColor: "rgba(255,179,0,1)",
        headerColor: "rgba(0,0,0,1)",
        timestampColor: "rgba(0,0,0,1)",
        authorNameColor: "rgba(0,0,0,1)",
        messageColor: "rgba(0,0,0,1)",
        checked: false,
      },
    ];
  }

  public isLoop = true;
  public isDefaultView = true;
  public superChatViewerWidth = 0;
  public superChatViewerHeight = 0;
  public superChats: SuperChat[] = [];

  public addDefaultChatViewer() {
    this.isDefaultView = true;
  }

  // スーパーチャットのビューワーを追加する
  public async addSuperChatViewer() {
    this.isDefaultView = false;
    const el = document.getElementById("chatframe") as HTMLIFrameElement;
    if (el) {
      this.superChatViewerWidth = el.clientWidth;
      this.superChatViewerHeight = el.clientHeight;
    }
  }

  public favoriteSuperChat(index: number) {
    this.superChats[index].checked = !this.superChats[index].checked;
  }

  public async start() {
    this.initSuperChats();
    let preSuperChats = this.scrapeSuperChats() ?? [];
    console.log(`スパチャ収集開始 ${this.isLoop}`);
    //　ループ開始
    while (this.isLoop) {
      await sleep(3000);
      const curSuperChats = this.scrapeSuperChats() ?? [];
      // console.log(`スパチャ数 ${curSuperChats.length}`);
      if (curSuperChats.length > 0) {
        const diffSuperChats = this.getDiffSuperChats(
          preSuperChats,
          curSuperChats
        );
        if (diffSuperChats.length > 0) {
          console.log("差分検出");
          console.table(diffSuperChats);
          this.superChats.push(...diffSuperChats);
        }
        preSuperChats = curSuperChats;
      }
    }
  }

  public getDiffSuperChats(
    preSuperChats: SuperChat[],
    curSuperChats: SuperChat[]
  ) {
    let diffSuperChats: SuperChat[] = [];
    curSuperChats.forEach((curSuperChat, index) => {
      const preAuthorNames = preSuperChats.map((u) => u.authorName);
      if (!preAuthorNames.includes(curSuperChat.authorName)) {
        diffSuperChats.push(curSuperChat);
      }
    });
    return diffSuperChats;
  }

  public scrapeSuperChats() {
    const els = (document.getElementById(
      "chatframe"
    ) as HTMLIFrameElement)?.contentWindow?.document?.querySelectorAll(
      "yt-live-chat-paid-message-renderer"
    );

    if (!els) {
      console.log("👎");
      return null;
    }

    const superchats = [...els].map((el) => {
      const img = el.querySelector("#img") as HTMLMediaElement;
      const authorName = el.querySelector("#author-name") as HTMLElement;
      const purchaseAmount = el.querySelector(
        "#purchase-amount"
      ) as HTMLElement;
      const message = el.querySelector("#message") as HTMLElement;
      const timestamp = el.querySelector("#timestamp") as HTMLElement;
      // console.log(el?.innerHTML ?? "");
      return {
        iconSrc: img?.src ?? "",
        authorName: authorName?.textContent ?? "",
        purchaseAmount: purchaseAmount?.textContent ?? "",
        message: message?.textContent ?? "　",
        timestamp: timestamp?.textContent ?? "",
        html: el?.innerHTML ?? "",
        primaryColor:
          (el as HTMLElement)?.style?.getPropertyValue(
            "--yt-live-chat-paid-message-primary-color"
          ) ?? "",
        secondaryColor:
          (el as HTMLElement)?.style?.getPropertyValue(
            "--yt-live-chat-paid-message-secondary-color"
          ) ?? "",
        headerColor:
          (el as HTMLElement)?.style?.getPropertyValue(
            "--yt-live-chat-paid-message-header-color"
          ) ?? "",
        authorNameColor:
          (el as HTMLElement)?.style?.getPropertyValue(
            "--yt-live-chat-paid-message-author-name-color"
          ) ?? "",
        timestampColor:
          (el as HTMLElement)?.style?.getPropertyValue(
            " --yt-live-chat-paid-message-timestamp-color"
          ) ?? "",
        messageColor:
          (el as HTMLElement)?.style?.getPropertyValue(
            "--yt-live-chat-paid-message-color"
          ) ?? "",
        checked: false,
      } as SuperChat;
    });
    return superchats;
  }

  // 通知をchromeに送信する
  public sendNotificationToBroweser(message: string) {
    // chrome.notifications.clear("id1");
    chrome.notifications.create(
      "id1",
      {
        type: "basic",
        iconUrl: chrome.runtime.getURL("128.png"),
        title: "スパチャ拡張",
        message: message,
        priority: 1,
        isClickable: true,
      },
      function () {
        console.log(chrome.runtime.lastError);
      }
    );
  }
}
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 30px;
  margin: 0px;
}

#over-super-chat-viewer {
  overflow: scroll;
  position: absolute;
  margin-top: 30px;
  margin-left: 0px;
  background-color: white;
  //background-color: aquamarine;
}

.active {
  background-color: rgb(255, 255, 255) !important;
}

.menu-default-chatview {
  background-color: #ccc;
  border-bottom: 1px solid rgb(224, 224, 224);
  border-right: 1px solid rgb(224, 224, 224);
  padding: 0px 5px;
  width: 50px;
  height: 29px;
  line-height: 30px;
  user-select: none;
  float: left;
}
.menu-super-chatview {
  background-color: #ccc;
  border-bottom: 1px solid rgb(224, 224, 224);
  border-right: 1px solid rgb(224, 224, 224);
  padding: 0px 5px;
  width: 50px;
  height: 29px;
  line-height: 30px;
  user-select: none;
  float: left;
}
.super-chat {
  width: 95%;
  height: auto;
  margin: 5px auto;
  // background-color: yellowgreen;
  border-radius: 4px;
  p {
    font-size: 14px;
    // color: white;
  }

  // display: flex;
  .top {
    width: calc(100%-10px);
    height: 40px;
    //display: flex;
    padding: 5px;

    img {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      float: left;
      user-select: none;
    }
    .info {
      width: auto;
      height: 40px;
      margin-left: 10px;
      margin-top: 2px;
      font-size: 12px;
      float: left;
      p {
        height: 18px;
      }
    }

    .fav {
      width: 20px;
      height: 20px;
      margin-left: 15px;
      margin-top: 15px;
      position: absolute;
      float: left;
      .chrome-ex-img {
        margin-left: 10px;
        margin-top: 10px;
        width: 20px;
        height: 20px;
        img {
          width: 20px;
          height: 20px;
        }
      }
    }
    .time {
      width: 40px;
      height: 40px;
      font-size: 12px;
      margin-top: 2px;
      float: right;
      p {
        height: 18px;
      }
    }
  }
  .bottom {
    width: 100%;
    display: inline-table;
    height: auto;
    user-select: none;
    // padding: 5px;
    p {
      min-height: 15px;
      margin: 5px auto;
      width: 95%;
    }
  }
  &:hover {
    border: 1px solid pink;
  }
}
</style>
