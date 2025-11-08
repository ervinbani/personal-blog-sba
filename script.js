// Personal Blog Platform - JavaScript
// Interactive blog with DOM manipulation, event handling, and localStorage
// Author: Ervin
// Date: November 8, 2025
// Per Scholas - JavaScript SBA

// ============================================
// GLOBAL STATE & CONSTANTS
// ============================================

const STORAGE_KEY = "personalBlogPosts"; // localStorage key for posts data
let posts = []; // Array to store all blog posts
let currentEditId = null; // Track which post is being edited
let currentView = 'list'; // Track current view: 'list' or 'detail'
let currentDetailPostId = null; // Track which post is in detail view

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
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} str - Input string
 * @returns {string} Sanitized string
 */
function sanitizeHTML(str) {
  const div = document.createElement("div");
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
    console.error("Error saving to localStorage:", error);
    alert("Failed to save posts. Please check your browser settings.");
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
    console.error("Error loading from localStorage:", error);
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
    timestamp: Date.now(),
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
  const postIndex = posts.findIndex((post) => post.id === id);

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
  const postIndex = posts.findIndex((post) => post.id === id);

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
  return posts.find((post) => post.id === id) || null;
}

// ============================================
// DOM ELEMENT REFERENCES
// ============================================

// Form elements
const postForm = document.getElementById("postForm");
const postTitleInput = document.getElementById("postTitle");
const postContentInput = document.getElementById("postContent");
const titleError = document.getElementById("titleError");
const contentError = document.getElementById("contentError");

// Posts display
const postsContainer = document.getElementById("postsContainer");
const postsCount = document.getElementById("postsCount");
const emptyState = document.getElementById("emptyState");
const postDetail = document.getElementById("postDetail");

// Modal elements
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editPostId = document.getElementById("editPostId");
const editPostTitleInput = document.getElementById("editPostTitle");
const editPostContentInput = document.getElementById("editPostContent");
const editTitleError = document.getElementById("editTitleError");
const editContentError = document.getElementById("editContentError");
const closeModalBtn = document.getElementById("closeModal");
const cancelEditBtn = document.getElementById("cancelEdit");

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
function validatePost(
  title,
  content,
  titleErrorEl,
  contentErrorEl,
  titleInput,
  contentInput
) {
  let isValid = true;

  // Clear previous errors
  titleErrorEl.textContent = "";
  contentErrorEl.textContent = "";
  titleInput.classList.remove("error");
  contentInput.classList.remove("error");
  titleInput.setAttribute("aria-invalid", "false");
  contentInput.setAttribute("aria-invalid", "false");

  // Validate title
  if (!title.trim()) {
    titleErrorEl.textContent = "Title is required";
    titleInput.classList.add("error");
    titleInput.setAttribute("aria-invalid", "true");
    isValid = false;
  } else if (title.trim().length < 3) {
    titleErrorEl.textContent = "Title must be at least 3 characters";
    titleInput.classList.add("error");
    titleInput.setAttribute("aria-invalid", "true");
    isValid = false;
  } else if (title.trim().length > 100) {
    titleErrorEl.textContent = "Title must be less than 100 characters";
    titleInput.classList.add("error");
    titleInput.setAttribute("aria-invalid", "true");
    isValid = false;
  }

  // Validate content
  if (!content.trim()) {
    contentErrorEl.textContent = "Content is required";
    contentInput.classList.add("error");
    contentInput.setAttribute("aria-invalid", "true");
    isValid = false;
  } else if (content.trim().length < 10) {
    contentErrorEl.textContent = "Content must be at least 10 characters";
    contentInput.classList.add("error");
    contentInput.setAttribute("aria-invalid", "true");
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
  postsContainer.innerHTML = "";

  // Update posts count
  postsCount.textContent = `${posts.length} ${
    posts.length === 1 ? "post" : "posts"
  }`;

  // Show/hide empty state
  if (posts.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  } else {
    emptyState.classList.add("hidden");
  }

  // Render each post
  posts.forEach((post) => {
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
  const card = document.createElement("article");
  card.className = "post-card";
  card.setAttribute("data-post-id", post.id);
  
  // Check if content is long (more than 200 characters)
  const isLongContent = post.content.length > 200;
  const contentClass = isLongContent ? "post-content truncated" : "post-content";

  card.innerHTML = `
        <div class="post-header">
            <h3 class="post-title">${sanitizeHTML(post.title)}</h3>
            <div class="post-timestamp">${formatDate(post.timestamp)}</div>
        </div>
        <div class="${contentClass}">${sanitizeHTML(post.content)}</div>
        <div class="post-actions">
            ${isLongContent ? `
                <button class="btn btn-read-more btn-icon" data-action="view" data-id="${post.id}">
                    Leggi tutto
                </button>
            ` : ''}
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
  postsCount.textContent = `${posts.length} ${
    posts.length === 1 ? "post" : "posts"
  }`;
}

// ============================================
// DETAIL VIEW FUNCTIONS
// ============================================

/**
 * Show post detail view
 * @param {string} postId - ID of post to view
 */
function showPostDetail(postId) {
    const post = getPostById(postId);
    
    if (!post) {
        alert('Post not found');
        return;
    }
    
    currentView = 'detail';
    currentDetailPostId = postId;
    
    // Create detail view HTML
    postDetail.innerHTML = `
        <div class="post-detail-header">
            <h2 class="post-detail-title">${sanitizeHTML(post.title)}</h2>
            <div class="post-detail-meta">
                <span class="post-timestamp">${formatDate(post.timestamp)}</span>
            </div>
        </div>
        <div class="post-detail-content">${sanitizeHTML(post.content)}</div>
        <div class="post-detail-actions">
            <button class="btn btn-back" data-action="back">
                Indietro
            </button>
            <button class="btn btn-edit btn-icon" data-action="edit" data-id="${post.id}">
                Edit
            </button>
            <button class="btn btn-delete btn-icon" data-action="delete" data-id="${post.id}">
                Delete
            </button>
        </div>
    `;
    
    // Show detail, hide list
    postDetail.classList.add('active');
    postsContainer.style.display = 'none';
    emptyState.style.display = 'none';
    
    // Scroll to top
    postDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Hide post detail view and show list
 */
function hidePostDetail() {
    currentView = 'list';
    currentDetailPostId = null;
    
    // Hide detail, show list
    postDetail.classList.remove('active');
    postsContainer.style.display = 'flex';
    
    // Show empty state if no posts
    if (posts.length === 0) {
        emptyState.style.display = 'block';
    }
    
    // Scroll to posts section
    postsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================
// MODAL FUNCTIONS
// ============================================

/**
 * Open the edit modal
 * @param {string} postId - ID of post to edit
 */
function openEditModal(postId) {
  const post = getPostById(postId);

  if (!post) {
    alert("Post not found");
    return;
  }

  // Populate modal with post data
  currentEditId = postId;
  editPostId.value = postId;
  editPostTitleInput.value = post.title;
  editPostContentInput.value = post.content;

  // Clear any previous errors
  editTitleError.textContent = "";
  editContentError.textContent = "";
  editPostTitleInput.classList.remove("error");
  editPostContentInput.classList.remove("error");

  // Show modal
  editModal.classList.add("active");
  editModal.setAttribute("aria-hidden", "false");
  editPostTitleInput.focus();
}

/**
 * Close the edit modal
 */
function closeEditModal() {
  editModal.classList.remove("active");
  editModal.setAttribute("aria-hidden", "true");
  currentEditId = null;
  editForm.reset();

  // Clear errors
  editTitleError.textContent = "";
  editContentError.textContent = "";
  editPostTitleInput.classList.remove("error");
  editPostContentInput.classList.remove("error");
}

// ============================================
// EVENT HANDLERS
// ============================================

/**
 * Handle new post form submission
 * @param {Event} e - Submit event
 */
function handleNewPost(e) {
  e.preventDefault();

  const title = postTitleInput.value;
  const content = postContentInput.value;

  // Validate inputs
  const isValid = validatePost(
    title,
    content,
    titleError,
    contentError,
    postTitleInput,
    postContentInput
  );

  if (!isValid) {
    return;
  }

  // Add post
  addPost(title, content);

  // Clear form
  postForm.reset();

  // Re-render posts
  renderPosts();

  // Scroll to posts section
  postsContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/**
 * Handle edit post form submission
 * @param {Event} e - Submit event
 */
function handleEditPost(e) {
  e.preventDefault();

  const title = editPostTitleInput.value;
  const content = editPostContentInput.value;
  const postId = currentEditId;

  // Validate inputs
  const isValid = validatePost(
    title,
    content,
    editTitleError,
    editContentError,
    editPostTitleInput,
    editPostContentInput
  );

  if (!isValid) {
    return;
  }

  // Update post
  const success = updatePost(postId, title, content);

  if (success) {
    closeEditModal();
    renderPosts();
  } else {
    alert("Failed to update post");
  }
}

/**
 * Handle post action buttons (edit/delete/view)
 * @param {Event} e - Click event
 */
function handlePostAction(e) {
  const button = e.target.closest("[data-action]");

  if (!button) return;

  const action = button.getAttribute("data-action");
  const postId = button.getAttribute("data-id");

  if (action === "edit") {
    openEditModal(postId);
  } else if (action === "delete") {
    handleDeletePost(postId);
  } else if (action === "view") {
    showPostDetail(postId);
  } else if (action === "back") {
    hidePostDetail();
  }
}

/**
 * Handle post deletion
 * @param {string} postId - ID of post to delete
 */
function handleDeletePost(postId) {
  const post = getPostById(postId);

  if (!post) {
    alert("Post not found");
    return;
  }

  // Confirm deletion
  const confirmDelete = confirm(
    `Are you sure you want to delete "${post.title}"?\n\nThis action cannot be undone.`
  );

  if (!confirmDelete) {
    return;
  }

  // Delete post
  const success = deletePost(postId);

  if (success) {
    // If we're in detail view of this post, go back to list
    if (currentView === 'detail' && currentDetailPostId === postId) {
      hidePostDetail();
    }
    renderPosts();
  } else {
    alert("Failed to delete post");
  }
}

/**
 * Close modal when clicking overlay
 * @param {Event} e - Click event
 */
function handleModalOverlayClick(e) {
  if (e.target === editModal || e.target.classList.contains("modal-overlay")) {
    closeEditModal();
  }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the application
 */
function init() {
  // Load posts from localStorage
  posts = loadPosts();

  // Render initial posts
  renderPosts();

  // Add event listeners
  postForm.addEventListener("submit", handleNewPost);
  editForm.addEventListener("submit", handleEditPost);
  postsContainer.addEventListener("click", handlePostAction);
  postDetail.addEventListener("click", handlePostAction);
  closeModalBtn.addEventListener("click", closeEditModal);
  cancelEditBtn.addEventListener("click", closeEditModal);
  editModal.addEventListener("click", handleModalOverlayClick);

  // Handle ESC key to close modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && editModal.classList.contains("active")) {
      closeEditModal();
    }
  });

  console.log("Personal Blog Platform initialized successfully!");
  console.log(`Loaded ${posts.length} post(s) from localStorage`);
}

// Start the application when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
