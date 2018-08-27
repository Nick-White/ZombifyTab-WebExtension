import Tab = browser.tabs.Tab;

class Zombifier {
    
    private REG_EXPS_OF_URLS_TO_IGNORE: RegExp[] = [
        /^about:.+$/,
        /^moz-extension:.+$/
    ];

    private zombifiedBaseUrlAsString: string = browser.runtime.getURL("zombified.html");

    public zombifyCurrentTab(): Promise<void> {
        return new Promise<void>((resolve: () => void) => {
            this.getCurrentTab().then((currentTab: Tab) => {
                this.zombify(currentTab).then(() => {
                    resolve();
                });
            });
        });
    }
    
    public zombifyAllOtherTabs(): Promise<void> {
        return new Promise<void>((resolve: () => void) => {
            this.getCurrentTab().then((currentTab: Tab) => {
                this.getAllOtherTabs(currentTab).then((allOtherTabs: Tab[]) => {
                    let zombifyOtherTabPromises: Promise<void>[] = [];
                    allOtherTabs.forEach((otherTab: Tab) => {
                        let zombifyOtherTabPromise = this.zombify(otherTab);
                        zombifyOtherTabPromises.push(zombifyOtherTabPromise);
                    });
                    Promise.all(zombifyOtherTabPromises).then(() => {
                        resolve();
                    });
                });
            });
        });
    }
    
    public zombify(tab: Tab): Promise<void> {
        return new Promise<void>((resolve: () => void) => {
            if ((typeof tab.url === "undefined") || this.shouldIgnore(tab.url) || this.isZombified(tab)) {
                resolve();
                return;
            }
            browser.tabs.update(tab.id, {
                url: this.buildZombifiedUrl(tab)
            }).then(() => {
                resolve();
            });
        });
    }
    
    private getAllOtherTabs(tab: Tab): Promise<Tab[]> {
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
    
    private getCurrentTab(): Promise<Tab> {
        return new Promise<Tab>((resolve: (currentTab: Tab) => void) => {
            browser.tabs.query({
                active: true
            }).then((tabs: Tab[]) => {
                let currentTab: Tab = tabs[0];
                resolve(currentTab);
            });
        });
    }
    
    private shouldIgnore(url: string): boolean {
        for (let regExpOfUrlToIgnore of this.REG_EXPS_OF_URLS_TO_IGNORE) {
            if (regExpOfUrlToIgnore.test(url)) {
                return true;
            }
        }
        return false;
    }
    
    private isZombified(tab: Tab): boolean {
        return ((<string>tab.url).indexOf(this.zombifiedBaseUrlAsString) === 0);
    }
    
    private buildZombifiedUrl(tab: Tab): string {
        let zombifiedUrl: URL = new URL(this.zombifiedBaseUrlAsString);
        zombifiedUrl.searchParams.append("url", <string>tab.url);
        if (typeof tab.title !== "undefined") {
            zombifiedUrl.searchParams.append("title", tab.title);
        }
        return zombifiedUrl.toString();
    }
}

export let zombifier = new Zombifier();