export class Template {
    constructor(initialTemplates = {}) {
        this.templates = {};

        const initList = Object.entries(initialTemplates);
        for (let template of initList)
            this.add(template[0], template[1]);
    }

    add(name, node) {
        const clone = node.cloneNode(true);
        clone.classList.remove('template');
        this.templates[name] = clone;
    }

    get(name) {
        return this.templates[name].cloneNode(true);
    }
}