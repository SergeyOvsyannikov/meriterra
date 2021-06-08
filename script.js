const FirstNames = ['amazing', 'awesome', 'super', 'perfect', 'great'];
const SecondNames = ['watch', 't-shirt', 'jeans', 'sneakers', 'suite'];

class Item {
    constructor(id, name, price) {
        this.id = (id || id === 0) ? id : Date.now();
        this.name = name ?? FirstNames[Math.floor(Math.random() * FirstNames.length)] + ' ' + SecondNames[Math.floor(Math.random() * SecondNames.length)];
        this.price = price ?? Math.round(Math.random() * 100);
    }
}

class ArrangeBox {
    constructor(availableList = [], selectedList = []) {
        this.initialValue = {
            availableList: [...availableList],
            selectedList: [...selectedList]
        }
        this.DOMNodes = {};
        
        this.init();
    }

    init() {
        
        this.DOMNodes.control = document.createElement('div');
        this.DOMNodes.control.className = 'arrange-box';

        this.DOMNodes.availableContainer = document.createElement('div');
        this.DOMNodes.selectedContainer = document.createElement('div');
        this.DOMNodes.availableContainer.className = 'arrange-box__container arrange-box__container--available';
        this.DOMNodes.selectedContainer.className = 'arrange-box__container arrange-box__container--selected';

        this.DOMNodes.availableList = document.createElement('ul');
        this.DOMNodes.availableList.className = 'arrange-box__list arrange-box__list--available';

        this.DOMNodes.selectedList = document.createElement('ul');
        this.DOMNodes.selectedList.className = 'arrange-box__list arrange-box__list--selected';

        this.DOMNodes.availableSearchInput = document.createElement('input');
        this.DOMNodes.availableSearchInput.type = 'text';
        this.DOMNodes.availableSearchInput.placeholder = 'поиск';
        this.DOMNodes.availableSearchInput.className = 'arrange-box__input arrange-box__input--available';

        this.DOMNodes.selectedSearchInput = document.createElement('input');
        this.DOMNodes.selectedSearchInput.type = 'text';
        this.DOMNodes.selectedSearchInput.placeholder = 'поиск';
        this.DOMNodes.selectedSearchInput.className = 'arrange-box__input arrange-box__input--selected';

        this.DOMNodes.controlPanel = document.createElement('div');
        this.DOMNodes.controlPanel.className = 'arrange-box__control-panel';

        this.DOMNodes.selectButton = document.createElement('button');
        this.DOMNodes.selectButton.innerHTML = 'вправо';
        this.DOMNodes.selectButton.addEventListener('click', this.select.bind(this));

        this.DOMNodes.selectAllButton = document.createElement('button');
        this.DOMNodes.selectAllButton.innerHTML = 'выбрать всё';
        this.DOMNodes.selectAllButton.addEventListener('click', this.selectAll.bind(this));

        this.DOMNodes.unselectButton = document.createElement('button');
        this.DOMNodes.unselectButton.innerHTML = 'влево';
        this.DOMNodes.unselectButton.addEventListener('click', this.unselect.bind(this));

        this.DOMNodes.unselectAllButton = document.createElement('button');
        this.DOMNodes.unselectAllButton.innerHTML = 'развыбрать всё';
        this.DOMNodes.unselectAllButton.addEventListener('click', this.unselectAll.bind(this));

        this.DOMNodes.resetButton = document.createElement('button');
        this.DOMNodes.resetButton.innerHTML = 'сбросить';
        this.DOMNodes.resetButton.addEventListener('click', this.setDefault.bind(this));

        this.DOMNodes.controlPanel.append(this.DOMNodes.selectButton, this.DOMNodes.selectAllButton, this.DOMNodes.unselectButton, this.DOMNodes.unselectAllButton, this.DOMNodes.resetButton)

        this.DOMNodes.addValueButton = document.createElement('button');
        this.DOMNodes.addValueButton.innerHTML = 'Добавить значение';
        this.DOMNodes.addValueButton.addEventListener('click', () => {
            const name = prompt('Введите название:');
            const price = prompt('Введите цену:');

            const newItem = this.itemTemplate(new Item(null, name, price));
            this.availableList.push(newItem)
            this.DOMNodes.availableList.append(newItem)
        })

        this.DOMNodes.availableContainer.append(this.DOMNodes.availableSearchInput, this.DOMNodes.addValueButton, this.DOMNodes.availableList);
        this.DOMNodes.selectedContainer.append(this.DOMNodes.selectedSearchInput, this.DOMNodes.selectedList);

        this.DOMNodes.control.append(this.DOMNodes.availableContainer, this.DOMNodes.controlPanel, this.DOMNodes.selectedContainer);

        this.DOMNodes.container = document.querySelector('.container');
        this.DOMNodes.container.appendChild(this.DOMNodes.control);

        this.DOMNodes.container.addEventListener('click', this.chooseItem.bind(this));

        // this.DOMNodes.availableList.addEventListener('click', this.chooseItem.bind(this));
        // this.DOMNodes.selectedList.addEventListener('click', this.chooseItem.bind(this));

        this.setDefault();
    }

    chooseItem({target}) {
        const item = target.closest('.item');
        if(!item) {
            return;
        }
        let list = item.closest('.arrange-box');
        list.querySelectorAll('.item--active').forEach(item => {
            item.classList.remove('item--active');
        })
        item.classList.toggle('item--active');
        this.selectedItem = this.selectedItem === item ? null : item;
    }

    select() {
        if(!this.selectedItem || this.selectedList.includes(this.selectedItem)) {
            return;
        }
        this.DOMNodes.selectedList.appendChild(this.selectedItem);
        const index = this.availableList.findIndex(item => item === this.selectedItem);
        if(index < 0) {
            return;
        }
        this.selectedList.push(this.availableList[index])
        this.availableList.splice(index, 1);
    }

    unselect() {
        if(!this.selectedItem || this.availableList.includes(this.selectedItem)) {
            return;
        }
        this.DOMNodes.availableList.appendChild(this.selectedItem);
        const index = this.selectedList.findIndex(item => item === this.selectedItem);
        if(index < 0) {
            return;
        }
        this.availableList.push(this.selectedList[index])
        this.selectedList.splice(index, 1);
    }

    selectAll() {
        this.DOMNodes.selectedList.append(...this.availableList);
        this.selectedList = this.selectedList.concat(this.availableList);
        this.availableList = [];
    }

    unselectAll() {
        this.DOMNodes.availableList.append(...this.selectedList);
        this.availableList = this.availableList.concat(this.selectedList);
        this.selectedList = [];
    }

    itemTemplate(item) {
        const li = document.createElement('li');
        li.className = 'item';
        li.innerHTML = `id: ${item.id}, name: ${item.name}, price: ${item.price}`;
        return li;
    }

    renderTemplate(availableList, selectedList) {
        this.availableList = availableList.map(this.itemTemplate);
        this.selectedList = selectedList.map(this.itemTemplate);
        this.DOMNodes.availableList.innerHTML = this.DOMNodes.selectedList.innerHTML = '';
        this.DOMNodes.availableList.append(...this.availableList);
        this.DOMNodes.selectedList.append(...this.selectedList);
    }

    setDefault() {
        this.renderTemplate(this.initialValue.availableList, this.initialValue.selectedList);
    }
}

let arrangeBox = new ArrangeBox(Array(7).fill(null).map((item, i) => new Item(i)));

const newBtn = document.createElement('button');
newBtn.innerText = 'Новый контрол';
newBtn.addEventListener('click', () => {
    new ArrangeBox(Array(7).fill(null).map((item, i) => new Item(i)));
})
document.querySelector('.container').append(newBtn)