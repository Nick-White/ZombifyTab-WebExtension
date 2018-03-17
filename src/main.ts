import Tab = browser.tabs.Tab;

function buildZombifiedUrl(tab: Tab): string {
    let displayPageUrl = browser.runtime.getURL("zombified.html");
    let zombifiedUrl: URL = new URL(displayPageUrl);
    zombifiedUrl.searchParams.append("url", <string>tab.url);
    if (typeof tab.title !== "undefined") {
        zombifiedUrl.searchParams.append("title", tab.title);
    }
    return zombifiedUrl.toString();
}

browser.browserAction.onClicked.addListener((tab: Tab): void => {
    if (typeof tab.url === "undefined") {
        return;
    }
    browser.tabs.update(tab.id, {
        url: buildZombifiedUrl(tab)
    });
});