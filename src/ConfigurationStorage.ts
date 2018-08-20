import StorageObject = browser.storage.StorageObject;
import { Configuration } from "./Configuration";

export class ConfigurationStorage {

    private static readonly INSTANCE: ConfigurationStorage = new ConfigurationStorage();

    private constructor() {
    }

    public static getInstance(): ConfigurationStorage {
        return this.INSTANCE;
    }

    public createDefaultIfNeeded(): Promise<void> {
        return new Promise<void>((resolve: () => void) => {
            this.get().then((model: Configuration | null) => {
                if (model === null) {
                    this.createDefault().then(() => {
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    public getNotNull(): Promise<Configuration> {
        return new Promise<Configuration>((resolve: (model: Configuration) => void): void => {
            this.get().then((model: Configuration| null) => {
                if (model === null) {
                    throw new Error("Model not found in storage by key [" + this.getKey() + "].");
                }
                resolve(model);
            });
        });
    }
    
    private get(): Promise<Configuration | null> {
        return new Promise<Configuration | null>((resolve: (model: Configuration | null) => void) => {
            browser.storage.local.get(this.getKey()).then((storage: StorageObject) => {
                let model: Configuration | null = null;
                if (this.getKey() in storage) {
                    model = (storage[this.getKey()] as any) as Configuration;
                }
                resolve(model);
            });
        });
    }

    public set(model: Configuration): Promise<void> {
        return new Promise<void>((resolve: () => void) => {
            let storage = {} as StorageObject;
            storage[this.getKey()] = model as any;

            browser.storage.local.set(storage).then(() => {
                resolve();
            });
        });
    }

    private createDefault(): Promise<void> {
        return new Promise<void>((resolve: () => void) => {
            let defaultModel = this.generateDefault();
            this.set(defaultModel).then(() => {
                resolve();
            });
        });
    }

    private getKey(): string {
        return "configuration";
    }

    private generateDefault(): Configuration {
        let configuration: Configuration = new Configuration();
        configuration.automaticallyZombifyNewTabs = false;
        return configuration;
    }
}