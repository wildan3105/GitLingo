/* global showLoader */

// Form validation for GitHub username search
document.getElementById('search-form').onsubmit = function() {
    const inputField = document.getElementById('username');
    // Auto-remove all spaces from the username
    const username = inputField.value.replace(/\s/g, '');

    if (username === '') {
        alert('Username cannot be empty.');
        return false; // Prevent form submission
    }

    // Update the input field with the cleaned value
    inputField.value = username;

    showLoader();
    return true; // Allow form submission
};
