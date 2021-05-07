// Selectors for new category form
const newCategoryForm = document.querySelector('[data-new-category-form]');
const newCategoryInput = document.querySelector('[data-new-category-input]');

// Selector for categories container
const categoriesContainer = document.querySelector('[data-categories]');

// Selector for currently viewing
const currentlyViewing = document.querySelector('[data-currently-viewing]');

// Selector for new quote form
const newQuoteForm = document.querySelector('[data-new-quote-form]');
const newQuoteSelect = document.querySelector('[data-new-quote-select]');
const newQuoteInput = document.querySelector('[data-new-quote-input]');

// Selector for edit quote form
const editQuoteForm = document.querySelector('[data-edit-quote-form]');
const editQuoteSelect = document.querySelector('[data-edit-quote-select]');
const editQuoteInput = document.querySelector('[data-edit-quote-input]');

// Selector for todos container
const quotesContainer = document.querySelector('[data-cards]');

// Local storage keys
const LOCAL_STORAGE_CATEGORIES_KEY = 'LOCAL_STORAGE_CATEGORIES_KEY';
const LOCAL_STORAGE_QUOTES_KEY = 'LOCAL_STORAGE_QUOTES_KEY';
const LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY = 'LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY';

let selectedCategoryId = localStorage.getItem(LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY);
let categories = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY)) || [];
let quotes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_QUOTES_KEY)) || [];

// EVENT: Add Category
newCategoryForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const category = newCategoryInput.value;
    const isCategoryEmpty = !category || !category.trim().length;

    if (isCategoryEmpty) {
        return console.log('please enter a quote');
    }

    categories.push({ _id: Date.now().toString(), category: category, color: getRandomHexColor() });

    newCategoryInput.value = '';

    saveAndRender();
});

// EVENT: Get Selected Category Id
categoriesContainer.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'li') {
        if (!e.target.dataset.categoryId) {
            selectedCategoryId = null;
        } else {
            selectedCategoryId = e.target.dataset.categoryId;
        }

        saveAndRender();
    }
});

// EVENT: Get Selected Category Color
categoriesContainer.addEventListener('change', (e) => {
    if (e.target.tagName.toLowerCase() === 'input') {
        const newCategoryColor = e.target.value;
        const categoryId = e.target.parentElement.dataset.categoryId;
        const categoryToEdit = categories.find((category) => category._id === categoryId);

        categoryToEdit.color = newCategoryColor;

        saveAndRender();
    }
});

// EVENT: Delete Selected Category
currentlyViewing.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'span') {
        categories = categories.filter((category) => category._id !== selectedCategoryId);

        quotes = quotes.filter((quote) => quote.categoryId !== selectedCategoryId);

        selectedCategoryId = null;

        saveAndRender();
    }
});

// EVENT: Add a Quote
newQuoteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    quotes.push({
        _id: Date.now().toString(),
        categoryId: newQuoteSelect.value,
        quote: newQuoteInput.value,
    });

    newQuoteSelect.value = '';
    newQuoteInput.value = '';

    saveAndRender();
});

// EVENT: Load Edit Quote Form With Values
let quoteToEdit = null;
quotesContainer.addEventListener('click', (e) => {
    if (e.target.classList[1] === 'fa-edit') {
        newQuoteForm.style.display = 'none';
        editQuoteForm.style.display = 'flex';

        quoteToEdit = quotes.find((quote) => quote._id === e.target.dataset.editQuote);

        editQuoteSelect.value = quoteToEdit.categoryId;
        editQuoteInput.value = quoteToEdit.quote;
    }
    if (e.target.classList[1] === 'fa-trash-alt') {
        const quoteToDeleteIndex = quotes.findIndex((quote) => quote._id === e.target.dataset.deleteQuote);

        quotes.splice(quoteToDeleteIndex, 1);

        saveAndRender();
    }
});

// EVENT: Update The Quote Being Edited With New Values
editQuoteForm.addEventListener('submit', function (e) {
    e.preventDefault();

    quoteToEdit.categoryId = editQuoteSelect.value;
    quoteToEdit.quote = editQuoteInput.value;

    editQuoteForm.style.display = 'none';
    newQuoteForm.style.display = 'flex';

    editQuoteSelect.value = '';
    editQuoteInput.value = '';

    saveAndRender();
});

// *==================== Functions ====================

function saveAndRender() {
    save();
    render();
}

function save() {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
    localStorage.setItem(LOCAL_STORAGE_QUOTES_KEY, JSON.stringify(quotes));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY, selectedCategoryId);
}

function render() {
    clearChildElements(categoriesContainer);
    clearChildElements(newQuoteSelect);
    clearChildElements(editQuoteSelect);
    clearChildElements(quotesContainer);

    renderCategories();
    renderFormOptions();
    renderQuotes();

    // Set the current viewing category
    if (!selectedCategoryId || selectedCategoryId === 'null') {
        currentlyViewing.innerHTML = `You are currently viewing  <strong>   All Categories</strong>`;
    } else {
        const currentCategory = categories.find((category) => category._id === selectedCategoryId);
        currentlyViewing.innerHTML = `You are currently viewing <strong>${currentCategory.category}</strong> <span>(delete)</span>`;
    }
}

function renderCategories() {
    categoriesContainer.innerHTML += `<li class="sidebar-item ${selectedCategoryId === 'null' || selectedCategoryId === null ? 'active' : ''}" data-category-id="">View All</li>`;

    categories.forEach(({ _id, category, color }) => {
        categoriesContainer.innerHTML += ` <li class="sidebar-item ${_id === selectedCategoryId ? 'active' : ''}" data-category-id=${_id}>${category}<input class="sidebar-color" type="color" value=${color}></li>`;
    });
}

function renderFormOptions() {

    newQuoteSelect.innerHTML += `<option value="">Select A Category</option>`;
    editQuoteSelect.innerHTML += `<option value="">Select A Category</option>`;

    categories.forEach(({ _id, category }) => {
        newQuoteSelect.innerHTML += `<option value=${_id}>${category}</option>`;
        editQuoteSelect.innerHTML += `<option value=${_id}>${category}</option>`;
    });
}

function renderQuotes() {
    let quotesToRender = quotes;

    // if their is a Selected Category Id, and selected category id !== 'null then filter the quotes
    if (selectedCategoryId && selectedCategoryId !== 'null') {
        quotesToRender = quotes.filter((quote) => quote.categoryId === selectedCategoryId);
    }

    // Render Quotes
    quotesToRender.forEach(({ _id, categoryId, quote }) => {

        // Get Complimentary category Details Based On QuoteId
        const { color, category } = categories.find(({ _id }) => _id === categoryId);
        const backgroundColor = convertHexToRGBA(color, 20);
        quotesContainer.innerHTML += `
			<div class="quote" style="border-color: ${color}">
					<div class="quote-tag" style="background-color: ${backgroundColor}; color: ${color};">
						${category}
					</div>
					<p class="quote-description">${quote}</p>
					<div class="quote-actions">
						<i class="far fa-edit" data-edit-quote=${_id}></i>
						<i class="far fa-trash-alt" data-delete-quote=${_id}></i>
					</div>
			</div>`;
    });
}

// HELPERS
function clearChildElements(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function convertHexToRGBA(hexCode, opacity) {
    let hex = hexCode.replace('#', '');

    if (hex.length === 3) {
        hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r},${g},${b},${opacity / 100})`;
}

function getRandomHexColor() {
    var hex = (Math.round(Math.random() * 0xffffff)).toString(16);
    while (hex.length < 6) hex = "0" + hex;
    return `#${hex}`;
}

window.addEventListener('load', render);
