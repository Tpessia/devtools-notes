import { Storage } from './storage.js';
import { Template } from './template.js';
import { theme } from './theme.js';
import { debounce } from './debounce.js';
import { uuidv4 } from './uuid.js';
import { exportJson, importJson } from './json-in-out.js';

;(async () => {
    class Panel {
        constructor() {
            this.components = {
                header: '.header',
                searchInput: '.search input',
                refreshBtn: '.header-btn.refresh',
                importBtn: '.header-btn.import #import',
                exportBtn: '.header-btn.export',
                cards: '.cards',
                cardsAdd: '.cards .cards__add',
                cardsAddBtn: '.cards .cards__add span',
                cardTemplate: '.card.template',
                card: '.card:not(.template)',
                cardClose: '.card .card__close',
                cardBody: '.card .card__body',
                cardBodyInput: '.card .card__body textarea',
                cardTitle: '.card .card__title',
                cardTitleInput: '.card .card__title input'
            }

            this.templates = new Template({
                card: document.querySelector(this.components.cardTemplate)
            });

            this.storage = new Storage('devtools-repo');
        }

        //#region Events

        startTheme() {
            theme.setClass(document.code);
        }

        startBind() {
            document.querySelector(this.components.cardsAddBtn)
                .addEventListener('click', e => this.addCard());

            document.querySelector(this.components.searchInput)
                .addEventListener('input', debounce(e => this.search(e.target.value), 500));

            document.querySelector(this.components.refreshBtn)
                .addEventListener('click', e => this.reloadCardsData());

            document.querySelector(this.components.importBtn)
                .addEventListener('change', e => this.importData(e));

            document.querySelector(this.components.exportBtn)
                .addEventListener('click', e => this.exportData());
        }

        //#endregion

        //#region DOM Helpers

        search(value) {
            if (!value || value === '') {
                this.getCards().forEach(e => e.style = '');
                return;
            }
            
            const results = this.getRepos().filter(e => e.title.search(new RegExp(value, 'i')) > -1 || e.code.search(new RegExp(value, 'i')) > -1);

            const cards = this.getCards();
            cards.forEach(e => e.style = '');

            const hiddenCards = cards.filter(card => !results.some(r => card.id === r.id));
            hiddenCards.forEach(e => e.style = 'display: none;')
        }

        resetSearch() {
            document.querySelector(this.components.searchInput).value = '';
            this.search(null);
        }

        addCard(id, title, code) {
            const container = document.querySelector(this.components.cards);
            const addBtn = document.querySelector(this.components.cardsAdd);

            const newCard = this.templates.get('card');

            newCard.id = id || uuidv4();
            if (code) newCard.querySelector(this.components.cardBodyInput).value = code;
            if (title) newCard.querySelector(this.components.cardTitleInput).value = title;

            newCard.querySelector(this.components.cardBodyInput)
                .addEventListener('input', debounce(e => this.saveData(), 500));
                
            newCard.querySelector(this.components.cardTitleInput)
                .addEventListener('input', debounce(e => this.saveData(), 500));
                
            newCard.querySelector(this.components.cardClose)
                .addEventListener('click', e => this.removeCard(e.target.parentNode));

            container.insertBefore(newCard, addBtn);

            this.resetSearch();
            window.scrollTo(0, document.body.scrollHeight);
        }

        async removeCard(cardNode) {
            cardNode.remove();
            await this.saveData();
            if (!this.hasCard()) this.addCard();
        }

        getCards = () => [...document.querySelectorAll(this.components.card)];

        hasCard = () => this.getCards().length > 0;

        getEmptyCards = () => this.getCards().filter(e => {
            const emptyBody = e.querySelector(this.components.cardBodyInput).value === '';
            const emptyTitle = e.querySelector(this.components.cardTitleInput).value === '';
            return emptyBody && emptyTitle;
        });

        updateRepos(repos) {
            if (repos && repos.length > 0)
                repos.forEach(e => this.addCard(e.id, e.title, e.code));
            else this.addCard();
        }

        //#endregion

        //#region Data
        
        getRepos = () => this.getCards().map(e => ({
            id: e.id,
            title: e.querySelector(this.components.cardTitleInput).value,
            code: e.querySelector(this.components.cardBodyInput).value
        })).filter(e => {
            const hasId = e.id && e.id !== '';
            const hasTitle = e.title && e.title !== '';
            const hasCode = e.code && e.code !== '';
            return hasId && (hasTitle || hasCode);
        });

        async loadData() {
            let data = await this.storage.get();
            if (!data) data = {};
            if (!data.repos) data.repos = [];
            return data;
        }
        
        async saveData() {
            const repos = this.getRepos();
            const data = this.storage.get();
            await this.storage.set({ ...data, repos });
        }

        async reloadCardsData() {
            const data = await this.loadData();
            this.getCards().forEach(node => node.remove());
            this.updateRepos(data.repos);
        }

        async importData(e) {
            if (!e || !e.target || !e.target.files || e.target.files.length === 0) return;

            const data = await importJson(e.target.files[0]);
            e.target.value = null;

            this.getCards().forEach(node => node.remove());
            this.updateRepos(data);
            await this.saveData();
        }

        exportData() {
            const repos = this.getRepos();
            exportJson(repos, 'notes');
        }

        //#endregion

        async init() {
            this.startTheme();
            this.startBind();

            await this.reloadCardsData();

            if (!this.hasCard()) this.addCard();
        }
    }

    const panel = new Panel();
    await panel.init();
})();