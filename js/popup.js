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
        chrome.storage.sync.get({savedLinks: []}, function(result) {
            let savedLinks = result.savedLinks;
            savedLinks.push(linkData);
            chrome.storage.sync.set({savedLinks: savedLinks}, function() {
                showMessage('Link saved successfully!', 'success');
                form.reset();
                displaySavedLinks();
            });
        });
    }

    function displaySavedLinks(category = 'all') {
        chrome.storage.sync.get({savedLinks: []}, function(result) {
            const savedLinks = result.savedLinks;
            linksList.innerHTML = '';
            savedLinks.forEach((link, index) => {
                if (category === 'all' || link.category === category) {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <strong>${link.name}</strong><br>
                        URL: <a href="${link.link}" target="_blank">${link.link}</a><br>
                        Category: ${link.category}<br>
                        Saved on: ${new Date(link.date).toLocaleString()}
                        <div class="link-actions">
                            <button class="update-btn" data-index="${index}">Update</button>
                            <button class="delete-btn" data-index="${index}">Delete</button>
                        </div>
                    `;
                    linksList.appendChild(li);
                }
            });

            // Add event listeners for update and delete buttons
            document.querySelectorAll('.update-btn').forEach(btn => {
                btn.addEventListener('click', handleUpdate);
            });
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', handleDelete);
            });
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

    function handleUpdate(e) {
        const index = e.target.getAttribute('data-index');
        chrome.storage.sync.get({savedLinks: []}, function(result) {
            const savedLinks = result.savedLinks;
            const linkToUpdate = savedLinks[index];

            // Populate the form with the link's current data
            linkInput.value = linkToUpdate.link;
            nameInput.value = linkToUpdate.name;
            categorySelect.value = linkToUpdate.category;
            if (categorySelect.value === 'other') {
                newCategoryInput.style.display = 'block';
                newCategoryInput.value = linkToUpdate.category;
            }

            // Change the form submission behavior temporarily
            form.onsubmit = function(e) {
                e.preventDefault();
                updateLink(index);
                // Reset form submission behavior
                form.onsubmit = null;
            };

            // Scroll to the form
            form.scrollIntoView({ behavior: 'smooth' });
        });
    }

    function updateLink(index) {
        chrome.storage.sync.get({savedLinks: []}, function(result) {
            let savedLinks = result.savedLinks;
            const updatedLink = {
                link: linkInput.value,
                name: nameInput.value || linkInput.value,
                category: categorySelect.value === 'other' ? newCategoryInput.value : categorySelect.value,
                date: new Date().toISOString()
            };

            savedLinks[index] = updatedLink;
            chrome.storage.sync.set({savedLinks: savedLinks}, function() {
                showMessage('Link updated successfully!', 'success');
                form.reset();
                displaySavedLinks(filterCategory.value);
            });
        });
    }

    function handleDelete(e) {
        if (confirm('Are you sure you want to delete this link?')) {
            const index = e.target.getAttribute('data-index');
            chrome.storage.sync.get({savedLinks: []}, function(result) {
                let savedLinks = result.savedLinks;
                savedLinks.splice(index, 1);
                chrome.storage.sync.set({savedLinks: savedLinks}, function() {
                    showMessage('Link deleted successfully!', 'success');
                    displaySavedLinks(filterCategory.value);
                });
            });
        }
    }

    // Initial display of saved links
    displaySavedLinks();
});