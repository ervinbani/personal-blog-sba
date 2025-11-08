// Personal Blog Platform - JavaScript
// Interactive blog with DOM manipulation, event handling, and localStorage

// ============================================
// GLOBAL STATE & CONSTANTS
// ============================================

const STORAGE_KEY = 'personalBlogPosts';
let posts = [];
let currentEditId = null;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a unique ID for posts
 * @returns {string} Unique identifier
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date string
 */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} str - Input string
 * @returns {string} Sanitized string
 */
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

