import Tab = browser.tabs.Tab;
import { zombifier } from "./zombifier";
import { Configuration } from "./Configuration";
import { ConfigurationStorage } from "./ConfigurationStorage";
import { AsyncUtils } from "./utils/AsyncUtils";

ConfigurationStorage.getInstance().createDefaultIfNeeded().then(() => {
    ConfigurationStorage.getInstance().getNotNull().then((configuration: Configuration) => {
        toggleAutomaticallyZombifyNewTabListener(configuration);
    });
});

function getTab(tabId: number | undefined): Promise<Tab> {
    if (typeof tabId === "undefined") {
        return Promise.reject(new Error(""));
    }
    return browser.tabs.get(tabId);
}

function automaticallyZombifyNewTabListener(tab: Tab) {
    AsyncUtils.waitUntil((): Promise<boolean> => {
        return new Promise<boolean>((resolve: (result: boolean) => void) => {
            getTab(tab.id).then((tab: Tab): void => {
                resolve(
                    (tab.url !== "about:blank") && // New tab hasn't yet loaded its URL
                    (tab.active == false)); // Avoid zombifying a tab newly opened by the user
            });
        });
    }, {
        timeoutMillis: 5000,
        timeBetweenTriesMillis: 200
    }).then((): void => {
        let zombifyTab = (): void => {
            getTab(tab.id).then((tab: Tab): void => {
                zombifier.zombify(tab);
            });
        };
        AsyncUtils.waitUntil((): Promise<boolean> => {
            return new Promise<boolean>((resolve: (result: boolean) => void) => {
                getTab(tab.id).then((tab: Tab): void => {
                    let urlPart: string = (<string> tab.url).replace(/^https?\:\/\/(www\.)?/, '');
                    resolve(tab.title !== urlPart);
                });
            });
        }, {
            timeoutMillis: 2000,
            timeBetweenTriesMillis: 200
        }).then(zombifyTab).catch(zombifyTab);
    });
}

function toggleAutomaticallyZombifyNewTabListener(configuration: Configuration) {
    if (configuration.automaticallyZombifyNewTabs) {
        browser.tabs.onCreated.addListener(automaticallyZombifyNewTabListener);
    } else {
        browser.tabs.onCreated.removeListener(automaticallyZombifyNewTabListener);
    }
}

browser.runtime.onMessage.addListener((message: any) => {
    let automaticallyZombifyNewTabs: boolean | undefined = message.automaticallyZombifyNewTabs;
    if (typeof automaticallyZombifyNewTabs === "undefined") {
        return;
    }
    ConfigurationStorage.getInstance().getNotNull().then((configuration: Configuration) => {
        configuration.automaticallyZombifyNewTabs = <boolean> automaticallyZombifyNewTabs;
        ConfigurationStorage.getInstance().set(configuration).then(() => {
            toggleAutomaticallyZombifyNewTabListener(configuration);
        });
    });
});