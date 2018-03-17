import * as $ from "jquery";
import Tab = browser.tabs.Tab;

$(document).ready((): void => {
    $("#zombifyCurrentTabButton").on("click", () => {
        zombifyCurrentTab().then(() => {
            closePopup();
        });
    });
    $("#zombifyAllOtherTabsButton").on("click", () => {
        zombifyAllOtherTabs().then(() => {
            closePopup();
        });
    });
});

let zombifiedBaseUrlAsString: string = browser.runtime.getURL("zombified.html");

function closePopup(): void {
    let popupUrl: string = window.location.href;
    browser.tabs.query({
        url: popupUrl
    }).then((popupTabs: Tab[]) => {
        let popupTabIds = popupTabs.map((popupTab: Tab): number => {
            return <number>popupTab.id;
        });
        if (popupTabIds.length > 0) {
            browser.tabs.remove(popupTabIds);
        } else {
            window.close();
        }
    });
}

function zombifyCurrentTab(): Promise<void> {
    return new Promise<void>((resolve: () => void) => {
        getCurrentTab().then((currentTab: Tab) => {
            zombify(currentTab).then(() => {
                resolve();
            });
        });
    });
}

function zombifyAllOtherTabs(): Promise<void> {
    return new Promise<void>((resolve: () => void) => {
        getCurrentTab().then((currentTab: Tab) => {
            getAllOtherTabs(currentTab).then((allOtherTabs: Tab[]) => {
                let zombifyOtherTabPromises: Promise<void>[] = [];
                allOtherTabs.forEach((otherTab: Tab) => {
                    let zombifyOtherTabPromise = zombify(otherTab);
                    zombifyOtherTabPromises.push(zombifyOtherTabPromise);
                });
                Promise.all(zombifyOtherTabPromises).then(() => {
                    resolve();
                });
            });
        });
    });
}

function getAllOtherTabs(tab: Tab): Promise<Tab[]> {
    return new Promise<Tab[]>((resolve: (allOtherTabs: Tab[]) => void) => {
        browser.tabs.query({
            windowId: tab.windowId,
        }).then((foundTabs: Tab[]) => {
            let allOtherTabs: Tab[] = foundTabs.filter((foundTab: Tab): boolean => {
                return ((foundTab.id !== tab.id) && (foundTab.incognito === tab.incognito));
            });
            resolve(allOtherTabs);
        });
    });
}

function getCurrentTab(): Promise<Tab> {
    return new Promise<Tab>((resolve: (currentTab: Tab) => void) => {
        browser.tabs.query({
            active: true
        }).then((tabs: Tab[]) => {
            let currentTab: Tab = tabs[0];
            resolve(currentTab);
        });
    });
}

function zombify(tab: Tab): Promise<void> {
    return new Promise<void>((resolve: () => void) => {
        if (typeof tab.url === "undefined") {
            resolve();
            return;
        }
        if (isZombified(tab)) {
            resolve();
            return;
        }
        browser.tabs.update(tab.id, {
            url: buildZombifiedUrl(tab)
        }).then(() => {
            resolve();
        });
    });
    
}

function isZombified(tab: Tab) {
    return ((<string>tab.url).indexOf(zombifiedBaseUrlAsString) === 0);
}

function buildZombifiedUrl(tab: Tab): string {
    let zombifiedUrl: URL = new URL(zombifiedBaseUrlAsString);
    zombifiedUrl.searchParams.append("url", <string>tab.url);
    if (typeof tab.title !== "undefined") {
        zombifiedUrl.searchParams.append("title", tab.title);
    }
    return zombifiedUrl.toString();
}