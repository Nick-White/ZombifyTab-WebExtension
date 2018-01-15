import * as $ from "jquery";

$(document).ready((): void => {
    let params: URLSearchParams = new URL(document.location.href).searchParams;
    let destinationUrl: string = <string>params.get("url");
    let destinationTitle: string = (params.has("title") ? <string>params.get("title") : destinationUrl);

    (<any>document).title = destinationTitle;
    $("#title").text(destinationTitle);
    $("#reloadLink").attr("href", destinationUrl);
});