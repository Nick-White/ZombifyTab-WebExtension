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

function automaticallyZombifyNewTabListener(tab: Tab) {
    if (typeof tab.id === "undefined") {
        return;
    }
    setTimeout(() => {
        let zombifyTab = (): void => {
            browser.tabs.get(<number> tab.id).then((tab: Tab): void => {
                zombifier.zombify(tab);
            });
        };
        AsyncUtils.waitUntil((): Promise<boolean> => {
            return new Promise<boolean>((resolve: (result: boolean) => void) => {
                browser.tabs.get(<number> tab.id).then((tab: Tab): void => {
                    let urlPart: string = (<string> tab.url).replace(/^https?\:\/\/(www\.)?/, '');
                    resolve(tab.title !== urlPart);
                });
            });
        }, 5000).then(zombifyTab).catch(zombifyTab);
    }, 1000);
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