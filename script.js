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

// ============================================
// LOCALSTORAGE FUNCTIONS
// ============================================

/**
 * Save posts array to localStorage
 */
function savePosts() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        alert('Failed to save posts. Please check your browser settings.');
    }
}

/**
 * Load posts from localStorage
 * @returns {Array} Array of posts
 */
function loadPosts() {
    try {
        const storedPosts = localStorage.getItem(STORAGE_KEY);
        return storedPosts ? JSON.parse(storedPosts) : [];
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return [];
    }
}

/**
 * Add a new post
 * @param {string} title - Post title
 * @param {string} content - Post content
 * @returns {Object} Created post object
 */
function addPost(title, content) {
    const post = {
        id: generateId(),
        title: title.trim(),
        content: content.trim(),
        timestamp: Date.now()
    };
    
    posts.unshift(post); // Add to beginning of array
    savePosts();
    return post;
}

/**
 * Update an existing post
 * @param {string} id - Post ID
 * @param {string} title - Updated title
 * @param {string} content - Updated content
 * @returns {boolean} Success status
 */
function updatePost(id, title, content) {
    const postIndex = posts.findIndex(post => post.id === id);
    
    if (postIndex !== -1) {
        posts[postIndex].title = title.trim();
        posts[postIndex].content = content.trim();
        posts[postIndex].timestamp = Date.now(); // Update timestamp
        savePosts();
        return true;
    }
    
    return false;
}

/**
 * Delete a post
 * @param {string} id - Post ID
 * @returns {boolean} Success status
 */
function deletePost(id) {
    const postIndex = posts.findIndex(post => post.id === id);
    
    if (postIndex !== -1) {
        posts.splice(postIndex, 1);
        savePosts();
        return true;
    }
    
    return false;
}

/**
 * Get a post by ID
 * @param {string} id - Post ID
 * @returns {Object|null} Post object or null
 */
function getPostById(id) {
    return posts.find(post => post.id === id) || null;
}

// ============================================
// DOM ELEMENT REFERENCES
// ============================================

// Form elements
const postForm = document.getElementById('postForm');
const postTitleInput = document.getElementById('postTitle');
const postContentInput = document.getElementById('postContent');
const titleError = document.getElementById('titleError');
const contentError = document.getElementById('contentError');

// Posts display
const postsContainer = document.getElementById('postsContainer');
const postsCount = document.getElementById('postsCount');
const emptyState = document.getElementById('emptyState');

// Modal elements
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editPostId = document.getElementById('editPostId');
const editPostTitleInput = document.getElementById('editPostTitle');
const editPostContentInput = document.getElementById('editPostContent');
const editTitleError = document.getElementById('editTitleError');
const editContentError = document.getElementById('editContentError');
const closeModalBtn = document.getElementById('closeModal');
const cancelEditBtn = document.getElementById('cancelEdit');

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate form inputs
 * @param {string} title - Post title
 * @param {string} content - Post content
 * @param {HTMLElement} titleErrorEl - Title error element
 * @param {HTMLElement} contentErrorEl - Content error element
 * @param {HTMLElement} titleInput - Title input element
 * @param {HTMLElement} contentInput - Content input element
 * @returns {boolean} Validation status
 */
function validatePost(title, content, titleErrorEl, contentErrorEl, titleInput, contentInput) {
    let isValid = true;
    
    // Clear previous errors
    titleErrorEl.textContent = '';
    contentErrorEl.textContent = '';
    titleInput.classList.remove('error');
    contentInput.classList.remove('error');
    
    // Validate title
    if (!title.trim()) {
        titleErrorEl.textContent = 'Title is required';
        titleInput.classList.add('error');
        isValid = false;
    } else if (title.trim().length < 3) {
        titleErrorEl.textContent = 'Title must be at least 3 characters';
        titleInput.classList.add('error');
        isValid = false;
    } else if (title.trim().length > 100) {
        titleErrorEl.textContent = 'Title must be less than 100 characters';
        titleInput.classList.add('error');
        isValid = false;
    }
    
    // Validate content
    if (!content.trim()) {
        contentErrorEl.textContent = 'Content is required';
        contentInput.classList.add('error');
        isValid = false;
    } else if (content.trim().length < 10) {
        contentErrorEl.textContent = 'Content must be at least 10 characters';
        contentInput.classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

// ============================================
// RENDER FUNCTIONS
// ============================================

/**
 * Render all posts to the DOM
 */
function renderPosts() {
    // Clear container
    postsContainer.innerHTML = '';
    
    // Update posts count
    postsCount.textContent = `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`;
    
    // Show/hide empty state
    if (posts.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }
    
    // Render each post
    posts.forEach(post => {
        const postCard = createPostCard(post);
        postsContainer.appendChild(postCard);
    });
}

/**
 * Create a post card element
 * @param {Object} post - Post object
 * @returns {HTMLElement} Post card element
 */
function createPostCard(post) {
    const card = document.createElement('article');
    card.className = 'post-card';
    card.setAttribute('data-post-id', post.id);
    
    card.innerHTML = `
        <div class="post-header">
            <h3 class="post-title">${sanitizeHTML(post.title)}</h3>
            <div class="post-timestamp">${formatDate(post.timestamp)}</div>
        </div>
        <div class="post-content">${sanitizeHTML(post.content)}</div>
        <div class="post-actions">
            <button class="btn btn-edit btn-icon" data-action="edit" data-id="${post.id}">
                Edit
            </button>
            <button class="btn btn-delete btn-icon" data-action="delete" data-id="${post.id}">
                Delete
            </button>
        </div>
    `;
    
    return card;
}

/**
 * Update posts count display
 */
function updatePostsCount() {
    postsCount.textContent = `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`;
}

