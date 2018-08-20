import * as $ from "jquery";
import { zombifier } from "./zombifier";
import Tab = browser.tabs.Tab;
import { ConfigurationStorage } from "./ConfigurationStorage";
import { Configuration } from "./Configuration";

$(document).ready((): void => {
    $("#zombifyCurrentTabButton").on("click", () => {
        zombifier.zombifyCurrentTab().then(() => {
            closePopup();
        });
    });
    $("#zombifyAllOtherTabsButton").on("click", () => {
        zombifier.zombifyAllOtherTabs().then(() => {
            closePopup();
        });
    });

    ConfigurationStorage.getInstance().getNotNull().then((configuration: Configuration) => {
        $("#automaticallyZombifyNewTabs")
                .prop("checked", configuration.automaticallyZombifyNewTabs)
                .on("change", (event: JQuery.Event) => {
                    let checked: boolean = $(event.target).prop("checked");
                    browser.runtime.sendMessage({automaticallyZombifyNewTabs: checked});
                })
    });

});

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