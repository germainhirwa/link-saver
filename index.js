document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('linkForm');
    const linkInput = document.getElementById('linkInput');
    const nameInput = document.getElementById('nameInput');
    const categorySelect = document.getElementById('categorySelect');
    const newCategoryInput = document.getElementById('newCategoryInput');
    const loadingBar = document.getElementById('loadingBar');
    const message = document.getElementById('message');
    const linksList = document.getElementById('linksList');
    const showSavedLinksBtn = document.getElementById('showSavedLinksBtn');
    const savedLinksDiv = document.getElementById('savedLinks');
    const filterCategory = document.getElementById('filterCategory');
    const confirmationPopup = document.getElementById('confirmationPopup');
    const popupMessage = document.getElementById('popupMessage');
    const confirmSaveBtn = document.getElementById('confirmSave');
    const cancelSaveBtn = document.getElementById('cancelSave');

    let linkToSave = null;

    categorySelect.addEventListener('change', function() {
        if (this.value === 'other') {
            newCategoryInput.style.display = 'block';
        } else {
            newCategoryInput.style.display = 'none';
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading bar
        loadingBar.style.display = 'block';
        const bar = loadingBar.querySelector('.bar');
        let width = 0;
        const interval = setInterval(function() {
            if (width >= 100) {
                clearInterval(interval);
                loadingBar.style.display = 'none';
                showConfirmationPopup();
            } else {
                width++;
                bar.style.width = width + '%';
            }
        }, 10);
    });

    function showConfirmationPopup() {
        const link = linkInput.value;
        const name = nameInput.value || link;
        const category = categorySelect.value === 'other' ? newCategoryInput.value : categorySelect.value;

        if (!isValidURL(link)) {
            showMessage('Please enter a valid URL', 'error');
            return;
        }

        linkToSave = { link, name, category, date: new Date().toISOString() };
        
        popupMessage.innerHTML = `
            <strong>Link:</strong> ${link}<br>
            <strong>Name:</strong> ${name}<br>
            <strong>Category:</strong> ${category}
        `;
        
        confirmationPopup.style.display = 'block';
    }

    confirmSaveBtn.addEventListener('click', function() {
        saveLink(linkToSave);
        confirmationPopup.style.display = 'none';
    });

    cancelSaveBtn.addEventListener('click', function() {
        confirmationPopup.style.display = 'none';
    });

    function saveLink(linkData) {
        // Save to local storage
        let savedLinks = JSON.parse(localStorage.getItem('savedLinks')) || [];
        savedLinks.push(linkData);
        localStorage.setItem('savedLinks', JSON.stringify(savedLinks));

        showMessage('Link saved successfully!', 'success');
        form.reset();
        displaySavedLinks();
    }

    function displaySavedLinks(category = 'all') {
        const savedLinks = JSON.parse(localStorage.getItem('savedLinks')) || [];
        linksList.innerHTML = '';
        savedLinks.forEach((link, index) => {
            if (category === 'all' || link.category === category) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>${link.name}</strong><br>
                    URL: <a href="${link.link}" target="_blank">${link.link}</a><br>
                    Category: ${link.category}<br>
                    Saved on: ${new Date(link.date).toLocaleString()}
                `;
                linksList.appendChild(li);
            }
        });
    }

    showSavedLinksBtn.addEventListener('click', function() {
        if (savedLinksDiv.style.display === 'none') {
            savedLinksDiv.style.display = 'block';
            showSavedLinksBtn.textContent = 'Hide Saved Links';
            displaySavedLinks(filterCategory.value);
        } else {
            savedLinksDiv.style.display = 'none';
            showSavedLinksBtn.textContent = 'Show Saved Links';
        }
    });

    filterCategory.addEventListener('change', function() {
        displaySavedLinks(this.value);
    });

    function isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;  
        }
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.className = type;
    }
});