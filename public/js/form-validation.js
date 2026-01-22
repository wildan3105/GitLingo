/* global showLoader */

// Form validation for GitHub username search
document.getElementById('search-form').onsubmit = function() {
    const inputField = document.getElementById('username');
    const username = inputField.value.trim();

    if (username === '') {
        alert('Username cannot be empty or contain only spaces.');
        return false; // Prevent form submission
    }

    if (/\s/.test(inputField.value)) {
        alert('Username cannot contain any spaces.');
        return false;
    }

    showLoader();
    return true; // Allow form submission
};
