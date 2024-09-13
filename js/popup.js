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
    const searchInput = document.getElementById('searchInput');
    const exportLinksBtn = document.getElementById('exportLinks');
    const importLinksInput = document.getElementById('importLinks');

    let linkToSave = null;
    const LINKS_PER_PAGE = 10;
    let currentPage = 1;

    categorySelect.addEventListener('change', function() {
        if (this.value === 'other') {
            newCategoryInput.style.display = 'block';
        } else {
            newCategoryInput.style.display = 'none';
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
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
            <strong>Link:</strong> ${sanitizeInput(link)}<br>
            <strong>Name:</strong> ${sanitizeInput(name)}<br>
            <strong>Category:</strong> ${sanitizeInput(category)}
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
            if (chrome.runtime.lastError) {
                console.error('Error fetching saved links:', chrome.runtime.lastError);
                showMessage('Error fetching saved links. Please try again.', 'error');
                return;
            }

            let savedLinks = result.savedLinks;
            savedLinks.push(sanitizeLinkData(linkData));
            chrome.storage.sync.set({savedLinks: savedLinks}, function() {
                if (chrome.runtime.lastError) {
                    console.error('Error saving link:', chrome.runtime.lastError);
                    showMessage('Error saving link. Please try again.', 'error');
                } else {
                    showMessage('Link saved successfully!', 'success');
                    form.reset();
                    displaySavedLinks();
                }
            });
        });
    }

    function displaySavedLinks(category = 'all', page = 1, searchTerm = '') {
        chrome.storage.sync.get({savedLinks: []}, function(result) {
            if (chrome.runtime.lastError) {
                console.error('Error fetching saved links:', chrome.runtime.lastError);
                showMessage('Error fetching saved links. Please try again.', 'error');
                return;
            }
    
            const savedLinks = result.savedLinks;
            const filteredLinks = savedLinks.filter(link => 
                (category === 'all' || link.category === category) &&
                (searchTerm === '' || link.name.toLowerCase().includes(searchTerm.toLowerCase()) || link.link.toLowerCase().includes(searchTerm.toLowerCase()))
            );
    
            const totalPages = Math.ceil(filteredLinks.length / LINKS_PER_PAGE);
            const startIndex = (page - 1) * LINKS_PER_PAGE;
            const endIndex = startIndex + LINKS_PER_PAGE;
            const linksToDisplay = filteredLinks.slice(startIndex, endIndex);
    
            linksList.innerHTML = '';
            linksToDisplay.forEach((link, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>${sanitizeInput(link.name)}</strong><br>
                    <a href="${sanitizeInput(link.link)}" class="embedded-link" target="_blank">Link</a><br>
                    Category: ${sanitizeInput(link.category)}<br>
                    Saved on: ${new Date(link.date).toLocaleString()}
                    <div class="link-actions">
                        <button class="update-btn" data-index="${startIndex + index}">Update</button>
                        <button class="delete-btn" data-index="${startIndex + index}">Delete</button>
                        <button class="copy-btn" data-link="${sanitizeInput(link.link)}">Copy</button>
                    </div>
                `;
                linksList.appendChild(li);
            });

            // Add pagination controls
            const paginationControls = document.createElement('div');
            paginationControls.className = 'pagination-controls';
            paginationControls.innerHTML = `
                <button id="prevPage" ${page === 1 ? 'disabled' : ''}>Previous</button>
                <span>Page ${page} of ${totalPages}</span>
                <button id="nextPage" ${page === totalPages ? 'disabled' : ''}>Next</button>
            `;
            linksList.appendChild(paginationControls);

            document.getElementById('prevPage').addEventListener('click', () => {
                if (page > 1) displaySavedLinks(category, page - 1, searchTerm);
            });
            document.getElementById('nextPage').addEventListener('click', () => {
                if (page < totalPages) displaySavedLinks(category, page + 1, searchTerm);
            });

            // Add event listeners for update, delete, and copy buttons
            document.querySelectorAll('.update-btn').forEach(btn => {
                btn.addEventListener('click', handleUpdate);
            });
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', handleDelete);
            });
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', handleCopy);
            });
        });
    }

    showSavedLinksBtn.addEventListener('click', function() {
        if (savedLinksDiv.style.display === 'none') {
            savedLinksDiv.style.display = 'block';
            showSavedLinksBtn.textContent = 'Hide Saved Links';
            displaySavedLinks(filterCategory.value, 1, searchInput.value);
        } else {
            savedLinksDiv.style.display = 'none';
            showSavedLinksBtn.textContent = 'Show Saved Links';
        }
    });

    filterCategory.addEventListener('change', function() {
        displaySavedLinks(this.value, 1, searchInput.value);
    });

    searchInput.addEventListener('input', function() {
        displaySavedLinks(filterCategory.value, 1, this.value);
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
        const index = parseInt(e.target.getAttribute('data-index'));
        chrome.storage.sync.get({savedLinks: []}, function(result) {
            if (chrome.runtime.lastError) {
                console.error('Error fetching saved links:', chrome.runtime.lastError);
                showMessage('Error updating link. Please try again.', 'error');
                return;
            }

            const savedLinks = result.savedLinks;
            const linkToUpdate = savedLinks[index];

            linkInput.value = linkToUpdate.link;
            nameInput.value = linkToUpdate.name;
            categorySelect.value = linkToUpdate.category;
            if (categorySelect.value === 'other') {
                newCategoryInput.style.display = 'block';
                newCategoryInput.value = linkToUpdate.category;
            }

            form.onsubmit = function(e) {
                e.preventDefault();
                updateLink(index);
                form.onsubmit = null;
            };

            form.scrollIntoView({ behavior: 'smooth' });
        });
    }

    function updateLink(index) {
        chrome.storage.sync.get({savedLinks: []}, function(result) {
            if (chrome.runtime.lastError) {
                console.error('Error fetching saved links:', chrome.runtime.lastError);
                showMessage('Error updating link. Please try again.', 'error');
                return;
            }

            let savedLinks = result.savedLinks;
            const updatedLink = sanitizeLinkData({
                link: linkInput.value,
                name: nameInput.value || linkInput.value,
                category: categorySelect.value === 'other' ? newCategoryInput.value : categorySelect.value,
                date: new Date().toISOString()
            });

            savedLinks[index] = updatedLink;
            chrome.storage.sync.set({savedLinks: savedLinks}, function() {
                if (chrome.runtime.lastError) {
                    console.error('Error updating link:', chrome.runtime.lastError);
                    showMessage('Error updating link. Please try again.', 'error');
                } else {
                    showMessage('Link updated successfully!', 'success');
                    form.reset();
                    displaySavedLinks(filterCategory.value, 1, searchInput.value);
                }
            });
        });
    }

    function handleDelete(e) {
        if (confirm('Are you sure you want to delete this link?')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            chrome.storage.sync.get({savedLinks: []}, function(result) {
                if (chrome.runtime.lastError) {
                    console.error('Error fetching saved links:', chrome.runtime.lastError);
                    showMessage('Error deleting link. Please try again.', 'error');
                    return;
                }

                let savedLinks = result.savedLinks;
                savedLinks.splice(index, 1);
                chrome.storage.sync.set({savedLinks: savedLinks}, function() {
                    if (chrome.runtime.lastError) {
                        console.error('Error deleting link:', chrome.runtime.lastError);
                        showMessage('Error deleting link. Please try again.', 'error');
                    } else {
                        showMessage('Link deleted successfully!', 'success');
                        displaySavedLinks(filterCategory.value, 1, searchInput.value);
                    }
                });
            });
        }
    }

    function handleCopy(e) {
        const linkToCopy = e.target.getAttribute('data-link');
        navigator.clipboard.writeText(linkToCopy).then(function() {
            showMessage('Link copied to clipboard!', 'success');
        }, function(err) {
            console.error('Could not copy text: ', err);
            showMessage('Failed to copy link', 'error');
        });
    }

    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    function sanitizeLinkData(linkData) {
        return {
            link: sanitizeInput(linkData.link),
            name: sanitizeInput(linkData.name),
            category: sanitizeInput(linkData.category),
            date: linkData.date
        };
    }

    exportLinksBtn.addEventListener('click', function() {
        chrome.storage.sync.get({savedLinks: []}, function(result) {
            if (chrome.runtime.lastError) {
                console.error('Error fetching saved links:', chrome.runtime.lastError);
                showMessage('Error exporting links. Please try again.', 'error');
                return;
            }

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result.savedLinks));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "saved_links.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    });

    importLinksInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedLinks = JSON.parse(e.target.result);
                    chrome.storage.sync.get({savedLinks: []}, function(result) {
                        if (chrome.runtime.lastError) {
                            console.error('Error fetching saved links:', chrome.runtime.lastError);
                            showMessage('Error importing links. Please try again.', 'error');
                            return;
                        }

                        const updatedLinks = [...result.savedLinks, ...importedLinks.map(sanitizeLinkData)];
                        chrome.storage.sync.set({savedLinks: updatedLinks}, function() {
                            if (chrome.runtime.lastError) {
                                console.error('Error saving imported links:', chrome.runtime.lastError);
                                showMessage('Error importing links. Please try again.', 'error');
                            } else {
                                showMessage('Links imported successfully!', 'success');
                                displaySavedLinks(filterCategory.value, 1, searchInput.value);
                            }
                        });
                    });
                } catch (error) {
                    console.error('Error parsing imported file:', error);
                    showMessage('Error parsing imported file. Please ensure it\'s a valid JSON file.', 'error');
                }
            };
            reader.readAsText(file);
        }
    });

    // Initial display of saved links
    displaySavedLinks();
});