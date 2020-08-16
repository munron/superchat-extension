// eslint-disable
/**
 * Chrome拡張でのURLを取得
 * @param assetsPath assetsの相対パス
 */
function getUrl(assetsPath: string) {
    return chrome.extension.getURL(assetsPath);
}

/**
 * Chromeストレージにオブジェクトを保存
 * @param obj ローカルストレージに保存するオブジェクト
 */
function setChromeStorage(obj: object) {
    return new Promise((resolve) => {
        chrome.storage.sync.set(obj, () => {
            resolve();
        });
    });
}

/**
 * Chromeストレージからオブジェクトを取得
 * @param key ローカルストレージを取得するkey
 */
function getChromeStorage(key: string) {
    return new Promise((resolve) => {
        chrome.storage.sync.get(key, (item) => {
            // eslint-disable-next-line
            key ? resolve(item[key]) : resolve(item);
        });
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addChromeStorangeChangeEvent(key: string, callback: (oldValue: any, newValue: any) => void) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chrome.storage.onChanged.addListener((change: any) => {
        // eslint-disable-next-line dot-notation
        callback(change?.[key]?.oldValue, change?.[key]?.newValue);
    });
}

export {
    getUrl,
    setChromeStorage,
    getChromeStorage,
    addChromeStorangeChangeEvent
};
