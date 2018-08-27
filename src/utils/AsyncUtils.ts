export class AsyncUtils {

    public static waitUntil(predicate: () => Promise<boolean>, 
            timeConfig: { timeoutMillis: number, timeBetweenTriesMillis: number}): Promise<void> {
        let timeoutMillis = timeConfig.timeoutMillis;
        return new Promise<void>((resolve: () => void, reject: () => void) => {
            setTimeout(() => {
                predicate.call(null).then((isPredicateTrue: boolean) => {
                    if (isPredicateTrue) {
                        resolve();
                    } else {
                        timeoutMillis = timeoutMillis - timeConfig.timeBetweenTriesMillis;
                        if (timeoutMillis > 0) {
                            AsyncUtils.waitUntil(predicate, {
                                timeoutMillis: timeoutMillis, 
                                timeBetweenTriesMillis: timeConfig.timeBetweenTriesMillis
                            }).then(() => {
                                resolve();
                            }).catch(() => {
                                reject();
                            });
                        } else {
                            reject();
                        }
                    }
                });
            }, timeConfig.timeBetweenTriesMillis);
        });
    }
}