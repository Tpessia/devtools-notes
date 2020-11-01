export const theme = {
    get() {
        const theme = chrome.devtools.panels.themeName;
        switch (theme) {
            case 'default':
                return 'light';
            case 'dark':
                return 'dark';
            default:
                return theme;
        }
    },
    setClass(elem = document.body) {
        elem.classList.add('theme-' + this.get());
    }
}