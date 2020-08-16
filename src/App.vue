<template>
  <div id="app">
    <div
      class="menu-default-chatview"
      v-bind:class="{ active: isDefaultView }"
      @click="addDefaultChatViewer"
    >チャット</div>
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
            <p>{{superChat.authorName}}</p>
            <p>{{superChat.purchaseAmount}}</p>
          </div>
          <div class="time">
            <p>{{superChat.timestamp}}</p>
          </div>
          <div v-if="superChat.checked" class="fav">
            <chrome-ex-img class="chrome-ex-img" :imagePath="'48.png'" />
          </div>
        </div>
        <div class="bottom" v-bind:style="{ 'background-color': superChat.secondaryColor }">
          <p>{{superChat.message}}</p>
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

@Component({
  components: {
    ChromeExImg,
  },
})
export default class App extends Vue {
  public mounted() {
    console.log("mounted");
    this.start();
  }

  public isLoop = true;
  public isDefaultView = true;
  public discordWebhookURL =
    "https://discordapp.com/api/webhooks/744526622639652895/7_i1TP_KGB6th2IxhWaCoajNp4Oh_-HTpHBaX_eUmrmBdVrPL6MphAxesbzcB1YHl-qQ";

  public flag = false;
  public superChatViewerWidth = 0;
  public superChatViewerHeight = 0;
  public superChatViewerMarginTop = 0;
  public superChats: SuperChat[] = [
    {
      iconSrc:
        "https://yt3.ggpht.com/-wk_BDVYFjXY/AAAAAAAAAAI/AAAAAAAAAAA/hvCOFG92f4s/s64-c-k-no-mo-rj-c0xffffff/photo.jpg",
      authorName: "テイラースイフト",
      purchaseAmount: "¥5000",
      message:
        "ばああああああああああかいういｆふぃおｈふぃｗｈふぉいｗｈふぉｗれげｒｇれｇｆれｆげｒえｒｆれｆれｆｗｒｆｗｒｆｒｗｆｗｒｒｗｆｗｒｆ",
      timestamp: "20:45",
      html: "",
      primaryColor: "rgba(255,202,40,1)",
      secondaryColor: "rgba(255,179,0,1)",
      checked: false,
    },
    {
      iconSrc:
        "https://yt3.ggpht.com/-wk_BDVYFjXY/AAAAAAAAAAI/AAAAAAAAAAA/hvCOFG92f4s/s64-c-k-no-mo-rj-c0xffffff/photo.jpg",
      authorName: "テイラースイフト",
      purchaseAmount: "¥5000",
      message:
        "ばああああああああああかいういｆふぃおｈふぃｗｈふぉいｗｈふぉｗれげｒｇれｇｆれｆげｒえｒｆれｆれｆｗｒｆｗｒｆｒｗｆｗｒｒｗｆｗｒｆ",
      timestamp: "20:45",
      html: "",
      primaryColor: "rgba(255,202,40,1)",
      secondaryColor: "rgba(255,179,0,1)",
      checked: false,
    },
  ];

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
      this.superChatViewerMarginTop = 0;
      this.flag = !this.flag;
      // console.log(chatEl.getBoundingClientRect().top);
      // console.log(chatEl.clientWidth);
      // console.log(chatEl.clientHeight);
    } else {
      return;
    }

    // const chatEl = (document.getElementById(
    //   "chatframe"
    // ) as HTMLIFrameElement)?.contentWindow?.document?.querySelector("#chat");
    // if (chatEl) {
    //   this.superChatViewerWidth = chatEl.clientWidth;
    //   this.superChatViewerHeight = chatEl.clientHeight;
    //   this.superChatViewerMarginTop = chatEl.getBoundingClientRect().top;
    //   this.flag = !this.flag;
    //   // console.log(chatEl.getBoundingClientRect().top);
    //   // console.log(chatEl.clientWidth);
    //   // console.log(chatEl.clientHeight);
    // } else {
    //   return;
    // }
  }

  public favoriteSuperChat(index: number) {
    this.superChats[index].checked = !this.superChats[index].checked;
  }

  public async start() {
    let preSuperChats = this.scrapeSuperChats() ?? [];
    console.log(`start!! ${this.isLoop}`);
    while (this.isLoop) {
      await sleep(3000);
      const curSuperChats = this.scrapeSuperChats() ?? [];
      if (curSuperChats.length > 0) {
        const diffSuperChats = this.getDiffSuperChats(
          preSuperChats,
          curSuperChats
        );
        if (diffSuperChats.length > 0) {
          console.log("差分検出");
          console.table(diffSuperChats);
          this.superChats.push(...diffSuperChats);
          this.sendNotificationToDiscord(
            "スパチャ拡張",
            `${diffSuperChats[0].authorName}が${diffSuperChats[0].purchaseAmount}スパチャしたぞ`
          );
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
        message: message?.textContent ?? "",
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
        checked: false,
      } as SuperChat;
    });

    //console.table(superchats);
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

  // 通知をdiscordに送信する
  public sendNotificationToDiscord(username: string, content: string) {
    const link = this.discordWebhookURL;
    const message = { username: username, content: content };

    postData(link, message)
      .then((data) => console.log(data))
      .catch((error) => console.error(error));

    function postData(url = ``, data = {}) {
      return fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((response) => response.text());
    }
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
    //padding: 5px;
    p {
      margin: 5px auto;
      width: 95%;
    }
  }
  &:hover {
    border: 1px solid pink;
  }
}
</style>
