interface Store {
    get(key: string): void;
    set(key: string, val: any): void;
    setCache(key: string, val: any): void;
    rm(key: string): void;
    has(key: string): boolean;
}
declare var store: Store;