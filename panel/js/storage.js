export class Storage {
    constructor(name = 'default') {
        this.name = name;
    }

    get() {
        return new Promise((res,rej) =>
            chrome.storage.local.get(this.name, r => res(r[this.name])));
    }

    set(obj) {
        return new Promise((res,rej) =>
            chrome.storage.local.set({ [this.name]: obj }, r => res(r)));
    }

    clear() {
        return new Promise((res,rej) =>
            chrome.storage.local.remove(this.name, r => res(r)));
    }
}