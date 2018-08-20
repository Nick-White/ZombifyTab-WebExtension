export class AsyncUtils {

    public static waitUntil(predicate: () => Promise<boolean>, timeoutMillis: number): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: () => void) => { 
            setTimeout(() => {
                predicate.call(null).then((isPredicateTrue: boolean) => {
                    if (isPredicateTrue) {
                        resolve();
                    } else {
                        timeoutMillis = timeoutMillis - 500;
                        if (timeoutMillis > 0) {
                            AsyncUtils.waitUntil(predicate, timeoutMillis).then(() => {
                                resolve();
                            }).catch(() => {
                                reject();
                            });
                        } else {
                            reject();
                        }
                    }
                });
            }, 500);
        });
    }
}