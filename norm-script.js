const FirstNames = ['amazing', 'awesome', 'super', 'perfect', 'great'];
const SecondNames = ['watch', 't-shirt', 'jeans', 'sneakers', 'suite'];

const TYPE_AVAILABLE = 'available';
const TYPE_SELECTED = 'selected';

class Item {
    constructor(id, name, price) {
        this.id = (id || id === 0) ? id : Date.now();
        this.name = name ?? FirstNames[Math.floor(Math.random() * FirstNames.length)] + ' ' + SecondNames[Math.floor(Math.random() * SecondNames.length)];
        this.price = price ?? Math.round(Math.random() * 100);
    }
}

class ArrangeBox {
    constructor(availableList = [], selectedList = [], options = {}) {
        this.renderContainer = options.container ?? '.container';
        this.containerInstance = null;
        this.initialValue = {
            availableList: [...availableList],
            selectedList: [...selectedList]
        };
        this.searchText = {};
        this.availableList = [...availableList];
        this.selectedList = [...selectedList];

        this.availablesUlNode = null;
        this.selectedUlNode = null;
        this.selectedListType = null;

        this.init();
    }

    init() {
        if (!('content' in document.createElement('template'))) {
            throw new TypeError("Browser not supported html Template");
        }
        
        const template = document.createElement('template');
        template.innerHTML = `
            <div class="arrange-box">
              <div class="arrange-box__container arrange-box__container--available">
                <input type="text" placeholder="поиск" class="arrange-box__input arrange-box__input--available">
                <button class="button--add-item">Добавить значение</button>
                <ul class="arrange-box__list arrange-box__list--available"></ul>
              </div>
              <div class="arrange-box__control-panel">
                <button class="arrange-box__control-panel-button arrange-box__control-panel-button--to-right">вправо</button>
                <button class="arrange-box__control-panel-button arrange-box__control-panel-button--select-all">выбрать всё</button>
                <button class="arrange-box__control-panel-button arrange-box__control-panel-button--to-left">влево</button>
                <button class="arrange-box__control-panel-button arrange-box__control-panel-button--unselect-all">развыбрать всё</button>
                <button class="arrange-box__control-panel-button arrange-box__control-panel-button--reset">сбросить</button>
              </div>
              <div class="arrange-box__container arrange-box__container--selected">
                <input type="text" placeholder="поиск" class="arrange-box__input arrange-box__input--selected">
                <ul class="arrange-box__list arrange-box__list--selected"></ul>
              </div>
            </div>
        `;

        this.containerInstance = this.renderContainer instanceof HTMLElement ? this.renderContainer : document.querySelector(this.renderContainer);
        const node = document.importNode(template.content, true);
        this.availablesUlNode = node.querySelector('.arrange-box__list--available');
        this.selectedUlNode = node.querySelector('.arrange-box__list--selected');
        node.querySelector('.arrange-box__control-panel-button--to-right').addEventListener('click', this.select.bind(this));
        node.querySelector('.arrange-box__control-panel-button--to-left').addEventListener('click', this.unselect.bind(this));
        node.querySelector('.arrange-box__control-panel-button--unselect-all').addEventListener('click', this.unselectAll.bind(this));
        node.querySelector('.arrange-box__control-panel-button--select-all').addEventListener('click', this.selectAll.bind(this));
        node.querySelector('.arrange-box__control-panel-button--reset').addEventListener('click', this.setDefault.bind(this));
        node.querySelector('.button--add-item').addEventListener('click', () => {
            const name = prompt('Введите название:');
            const price = prompt('Введите цену:');

            const newItem = new Item(null, name, price);
            this.availableList.push(newItem)
            this.renderList(this.availablesUlNode, this.availableList);
        })
        node.querySelector('.arrange-box__input--available').addEventListener('input', ({target}) => this.search(TYPE_AVAILABLE, target.value));
        node.querySelector('.arrange-box__input--selected').addEventListener('input', ({target}) => this.search(TYPE_SELECTED, target.value));
        this.inputSearch = [...node.querySelectorAll('.arrange-box__input--available, .arrange-box__input--selected')];
        
        node.querySelectorAll('.arrange-box__list--available, .arrange-box__list--selected').forEach(e => e.addEventListener('click', this.chooseItem.bind(this)));
        
        this.containerInstance.appendChild(node);
        this.containerInstance.addEventListener('click', this.chooseItem.bind(this));

        this.setDefault();
    }

    get value() {
        return this.selectedList;
    }

    search(type, text) {
        this.searchText[type] = text;
        switch(type){
            case TYPE_AVAILABLE:
                return this.renderList(this.availablesUlNode, this.availableList, this.searchText[type]);
            case TYPE_SELECTED:
                return this.renderList(this.selectedUlNode, this.selectedList, this.searchText[type]);
        }
    }

    chooseItem({target}) {
        const item = target.closest('.item');
        if(!item) {
            return;
        }
        if(Number.isInteger(this.selectedItem)) {
            const list = this.selectedListType === TYPE_AVAILABLE ? this.availablesUlNode : this.selectedUlNode;
            list.children[this.selectedItem].classList.remove('item--active');
        }
        
        this.selectedItem = Array.from(item.parentElement.childNodes).indexOf(item);
        this.selectedListType = target.closest('.arrange-box__list--available') ? TYPE_AVAILABLE : TYPE_SELECTED;
        item.classList.add('item--active');
    }

    select() {
        if(this.selectedListType !== TYPE_AVAILABLE) {
            return;
        }
        this.moveElement(this.availableList,this.selectedList, this.selectedItem);
        this.renderCurrentLists();
    }

    unselect() {
        if(this.selectedListType !== TYPE_SELECTED) {
            return;
        }
        this.moveElement(this.selectedList, this.availableList, this.selectedItem);
        this.renderCurrentLists();
    }

    moveElement(from, to, index){
        to.push(...from.splice(index, 1));
    }
    renderCurrentLists(){
        this.renderList(this.availablesUlNode, this.availableList, this.searchText[TYPE_AVAILABLE]);
        this.renderList(this.selectedUlNode, this.selectedList, this.searchText[TYPE_SELECTED]);
    }

    selectAll() {
        this.selectedItem = this.selectedListType = null;
        this.selectedList = this.selectedList.concat(this.availableList);
        this.availableList = [];
        this.renderCurrentLists();        
    }

    unselectAll() {
        this.selectedItem = this.selectedListType = null;
        this.availableList = this.availableList.concat(this.selectedList);
        this.selectedList = [];
        this.renderCurrentLists();
    }

    itemTemplate(item) {
        const li = document.createElement('li');
        li.className = 'item';
        li.innerHTML = `id: ${item.id}, name: ${item.name}, price: ${item.price}`;
        return li;
    }

    renderList(element, list, filterText = '') {
        element.innerHTML = '';
        element.append(...list.filter(i => i.name.includes(filterText)).map(this.itemTemplate));
    }

    setDefault() {
        this.searchText = {};
        this.inputSearch.forEach(e => e.value = '');
        this.renderList(this.availablesUlNode, this.initialValue.availableList, '');
        this.renderList(this.selectedUlNode, this.initialValue.selectedList, '');
    }

    setAvailable(newList) {
        this.selectedItem = this.selectedListType = null;
        this.availableList = newList ?? [];
        this.renderList(this.availablesUlNode, this.availableList, this.searchText[TYPE_AVAILABLE]);
    }

    setSelected(newList) {
        this.selectedItem = this.selectedListType = null;
        this.selectedList = newList ?? [];
        this.renderList(this.selectedUlNode, this.selectedList, this.searchText[TYPE_SELECTED]);
    }

}

let arrangeBox = new ArrangeBox(Array(7).fill(null).map((item, i) => new Item(i)));

const newBtn = document.createElement('button');
newBtn.innerText = 'Новый контрол';
newBtn.addEventListener('click', () => {
    new ArrangeBox(Array(7).fill(null).map((item, i) => new Item(i)));
})
document.querySelector('.container').append(newBtn)