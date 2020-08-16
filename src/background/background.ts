import Vue from 'vue';
import { getChromeStorage, setChromeStorage } from "../utils";
import moment from "moment";
Vue.config.productionTip = false;

type PurchaseOrder = {
  OrderID: string,
  OrderCreationDate: Date,
  CurrencyOfTransaction: string,
  OrderAmount: number,
  AmountCharged: number,
  FinancialStatus: string,
  TotalTax: number,
  AmountRefunded: number,
  AmountChargedBack: number,
  BuyerCity: string,
  BuyerState: string,
  BuyerPostalCode: string,
  BuyerCountry: string,
  ItemID: string,
  ItemName: string,
  ItemPrice: number,
  ItemQuantity: number
}


// 初期化
async function init() {
  console.log("初期化開始");
  const purchaseOrders = await downloadPurchaseOrders();
  if (purchaseOrders) {
    await setChromeStorage({ OrderAmountLength: purchaseOrders.length })
  }
}

var pattern = "https://payments.google.com/payments/apis-secure/**";
function redirect(requestDetails: chrome.webRequest.WebRequestBodyDetails) {
  chrome.storage.sync.set({ purchaseOrderDownloadLink: requestDetails.url }, () => {
    console.log(`purchaseOrderDownloadLink updated to ${requestDetails.url}`);
    // chrome.runtime.sendMessage({ type: 'ANALYSE_PURCHASE_ORDER_DOWNLOAD_LINK' });
  });
}
chrome.webRequest.onBeforeRequest.addListener(
  redirect,
  { urls: [pattern] },
  ["blocking"]
);


// chrome.runtime.onMessage.addListener(
//   async function (message, sender, callback) {
//     // console.log("debug log");
//     if (message.type == 'DOWNLOAD_PURCHASE_ORDER') {
//       const purchaseOrders = await downloadPurchaseOrders();
//       const log = await generateLog(purchaseOrders, 0);
//       sendNotificationToDiscord("デバッグの民", log);
//       // sendNotificationToBroweser(log);
//     }
//   }
// );


chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  if (/pay.google.com/.test(changeInfo.url!)) {
    console.log(changeInfo.url);
    chrome.tabs.sendMessage(tabId, "hashchange");
  }
});


// 定期実行
chrome.alarms.create('UPDATE_PURCHASE_ORDER', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'UPDATE_PURCHASE_ORDER') {
    console.log('ダウンロードを開始します');
    const preLength = await getChromeStorage('OrderAmountLength') as number | undefined;
    if (!preLength) {
      console.log("storageを初期化");
      await init();
    } else {
      const purchaseOrders = await downloadPurchaseOrders();
      if (purchaseOrders) {
        const curLength = purchaseOrders.length;
        if (preLength == curLength) console.log("変化無し")
        for (let index = 0; index < (curLength - preLength); index += 1) {
          const log = await generateLog(purchaseOrders, index);
          await sendNotificationToDiscord("SalesGang", log);
          sendNotificationToBroweser(log);
        }
        await setChromeStorage({ OrderAmountLength: curLength })
      }
    }
  }
});


// これまでの総売上を計算/
function getSumOfOrderAmount(orders: PurchaseOrder[]) {
  const sum = orders.reduce((p, x) => p + (Number.isNaN(x.AmountCharged) ? 0 : x.AmountCharged), 0);
  return sum;
}


// 過去の購入履歴を検索する
function searchPastOrders(order: PurchaseOrder, orders: PurchaseOrder[]) {
  const pastOrders = orders.filter(x => x.BuyerPostalCode == order.BuyerPostalCode);
  console.log(pastOrders);
  return pastOrders;
}

function insertStr(input: string) {
  return "〒" + input.slice(0, 3) + '-' + input.slice(3, input.length);
}


// ログを作成する
async function generateLog(orders: PurchaseOrder[], index: number = 0) {
  const order = orders[index];
  const address = await getAdress(order.BuyerPostalCode);
  const date = moment(order.OrderCreationDate).format('YYYY/MM/DD HH:mm');
  const sumOfOrderAmnount = getSumOfOrderAmount(orders);
  const paseOrders = searchPastOrders(order, orders);
  const postalCode = insertStr(order.BuyerPostalCode)
  return `
    ${order.ItemName}\n注文日時　:  ${date}\n売上　　　:  ¥${order.OrderAmount}\n総売上　　:  ¥${sumOfOrderAmnount}\n郵便番号　:  ${postalCode}\n住所　　　:  ${address}\n購入履歴　:  ${paseOrders.length}ヶ月継続
    `
}


// 住所を取得する
async function getAdress(zipcode: string) {
  const data = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`)
  const text = await data.json();
  if (text.status == '200') {
    let address = '';
    const results = text.results?.[0]
    Object.keys(results).forEach(function (k) {
      if (/address/.test(k)) {
        address = address + results[k];
      }
    });
    return address;
  } else {
    return "取得失敗(status:400)"
  }
}


// 購入履歴をダウンロードする
async function downloadPurchaseOrders() {
  const link = await getChromeStorage('purchaseOrderDownloadLink') as string | undefined
  if (!link) {
    sendNotificationToBroweser("購入履歴URLを設定できていません");
    return null;
  }
  const data = await fetch(link).catch(() => {
    return null;
  });
  if (!data || !data.ok) {
    // sendNotificationToBroweser("購入履歴ダウンロードエラー(fetch error)")
    return null;
  }
  const txt = await data.text();
  const rows = txt.split('\n');
  const purchaseOrders = rows.filter(row => !/Order ID/.test(row)).map((row) => {
    const data = row.split(',').map(x => x.replace(/\"/g, "").replace(/\¥/g, ""));
    return {
      OrderID: data[0],
      OrderCreationDate: new Date(data[1]),
      CurrencyOfTransaction: data[2],
      OrderAmount: parseInt(data[3]),
      AmountCharged: parseInt(data[4]),
      FinancialStatus: data[5],
      TotalTax: parseInt(data[6]),
      AmountRefunded: parseInt(data[7]),
      AmountChargedBack: parseInt(data[8]),
      BuyerCity: data[9],
      BuyerState: data[10],
      BuyerPostalCode: data[11],
      BuyerCountry: data[12],
      ItemID: data[13],
      ItemName: data[14],
      ItemPrice: parseInt(data[15]),
      ItemQuantity: parseInt(data[16])
    } as PurchaseOrder
  })
  return purchaseOrders;
}


// 購入履歴を時系列順にソートする
function sortPurchaseOrdersByOrderCreationDate(purchaseOrders: PurchaseOrder[]) {
  return purchaseOrders.sort((a, b) => a.OrderCreationDate.getUTCMilliseconds() - b.OrderCreationDate.getUTCMilliseconds())
}


// 通知をdiscordに送信する
async function sendNotificationToDiscord(username: string, content: string) {
  const link = await getChromeStorage('discordWebhookLink') as string | undefined
  if (!link) {
    sendNotificationToBroweser("discord webhookエラー(storage error)")
    return;
  }
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


// 通知をchromeに送信する
function sendNotificationToBroweser(message: string) {
  chrome.notifications.clear("id1")
  var notification = chrome.notifications.create(
    'id1',
    {
      type: 'basic',
      iconUrl: chrome.runtime.getURL("128.png"),
      title: "SalesGang",
      message: message,
      priority: 100,
      isClickable: true
    },
    function () {
      console.log(chrome.runtime.lastError);
    }
  );
}
