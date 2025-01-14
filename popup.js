const STORAGE_KEY = 'selectedEngine'; // 将存储键名抽离成变量

const searchEngineSelect = document.getElementById('searchEngine');
const searchLogo = document.getElementById('searchLogo');
const searchButton = document.getElementById('searchButton');
const searchQuery = document.getElementById('searchQuery');

// Load the previously stored search engine choice on page load
document.addEventListener('DOMContentLoaded', () => {
    if (chrome.storage) {
        chrome.storage.local.get(STORAGE_KEY, (result) => {
            if (result[STORAGE_KEY]) {
                searchEngineSelect.value = result[STORAGE_KEY];
                updateLogo();
            }
        });
    } else {
        const storedEngine = localStorage.getItem(STORAGE_KEY);
        if (storedEngine) {
            searchEngineSelect.value = storedEngine;
            updateLogo();
        }
    }
});

// Save the user's choice when the search engine is changed
searchEngineSelect.addEventListener('change', () => {
    const selectedOption = searchEngineSelect.options[searchEngineSelect.selectedIndex];
    const logoUrl = selectedOption.getAttribute('data-icon');
    searchLogo.src = logoUrl;

    // Store the user's selection in both chrome.storage.local and localStorage
    const selectedEngine = searchEngineSelect.value;
    if (chrome.storage) {
        chrome.storage.local.set({
            [STORAGE_KEY]: selectedEngine // Use the constant variable as the key
        });
    }
    localStorage.setItem(STORAGE_KEY, selectedEngine); // Use the constant variable as the key
});

// Function to update the logo based on the selected search engine
function updateLogo() {
    const selectedOption = searchEngineSelect.options[searchEngineSelect.selectedIndex];
    const logoUrl = selectedOption.getAttribute('data-icon');
    searchLogo.src = logoUrl;
}

// Function to handle the search process
function handleSearch() {
    const query = searchQuery.value.trim(); // Get the search query

    if (query) {
        // Get the current tab's domain using chrome.tabs API
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, (tabs) => {
            const domain = new URL(tabs[0].url).hostname; // Extract the domain from the URL of the current tab

            const selectedOption = searchEngineSelect.options[searchEngineSelect.selectedIndex];
            const searchUrl = selectedOption.value + encodeURIComponent(`site:${domain} ${query}`); // Construct the search URL with the domain

            // Open the search results in a new tab
            window.open(searchUrl, '_blank');
        });
    } else {
        // If no query, search only by the domain
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, (tabs) => {
            const domain = new URL(tabs[0].url).hostname; // Extract the domain from the URL of the current tab
            const selectedOption = searchEngineSelect.options[searchEngineSelect.selectedIndex];
            const searchUrl = selectedOption.value + encodeURIComponent(`site:${domain}`); // Only search the site

            // Open the search results in a new tab
            window.open(searchUrl, '_blank');
        });
    }
}

// Add event listener for the search button to open the search in a new tab
searchButton.addEventListener('click', handleSearch);

// Add event listener for the Enter key to trigger the search
searchQuery.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleSearch(); // Trigger the same search process when Enter is pressed
    }
});