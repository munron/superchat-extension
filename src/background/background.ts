
//import { getChromeStorage, setChromeStorage } from "../utils";
//import moment from "moment";


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
  if (/youtube.com/.test(changeInfo.url!)) {
    console.log(changeInfo.url);
    chrome.tabs.sendMessage(tabId, "hashchange");
  }
});

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
