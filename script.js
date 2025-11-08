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
let currentView = "list"; // Track current view: 'list' or 'detail'
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

 */
function addPost(title, content) {
  const post = {
    id: generateId(),
    title: title.trim(),
    content: content.trim(),
    timestamp: Date.now(),
    ratings: [], // Array to store individual ratings (1-5)
    views: 0, // Counter for number of times post detail is opened
  };

  posts.unshift(post); // Add to beginning of array
  savePosts();
  return post;
}

/**

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
const newPostSection = document.querySelector(".new-post-section");
const btnAddPost = document.getElementById("btnAddPost");

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

// Rating modal elements
const ratingModal = document.getElementById("ratingModal");
const ratingStars = document.getElementById("ratingStars");
const closeRatingBtn = document.getElementById("closeRating");
const cancelRatingBtn = document.getElementById("cancelRating");
let currentRatingPostId = null;

// ============================================
// RATING FUNCTIONS
// ============================================

/**
 * Add a rating to a post
 * @param {string} postId - Post ID
 * @param {number} rating - Rating value (1-5)
 * @returns {boolean} Success status
 */
function addRating(postId, rating) {
  const postIndex = posts.findIndex((post) => post.id === postId);

  if (postIndex !== -1) {
    // Initialize ratings array if it doesn't exist
    if (!posts[postIndex].ratings) {
      posts[postIndex].ratings = [];
    }

    posts[postIndex].ratings.push(rating);
    savePosts();
    return true;
  }

  return false;
}

/**
 * Calculate average rating for a post
 * @param {Object} post - Post object
 * @returns {number} Average rating (0 if no ratings)
 */
function getAverageRating(post) {
  if (!post.ratings || post.ratings.length === 0) {
    return 0;
  }

  const sum = post.ratings.reduce((acc, rating) => acc + rating, 0);
  return (sum / post.ratings.length).toFixed(1);
}

/**
 * Get rating count for a post
 * @param {Object} post - Post object
 * @returns {number} Number of ratings
 */
function getRatingCount(post) {
  return post.ratings ? post.ratings.length : 0;
}

/**
 * Increment view count for a post
 * @param {string} postId - ID of the post
 * @returns {boolean} Success status
 */
function incrementViews(postId) {
  const postIndex = posts.findIndex((post) => post.id === postId);
  if (postIndex !== -1) {
    if (typeof posts[postIndex].views !== "number") {
      posts[postIndex].views = 0;
    }
    posts[postIndex].views++;
    savePosts();
    return true;
  }
  return false;
}

/**
 * Generate star HTML for display
 * @param {number} rating - Average rating
 * @returns {string} HTML string with stars
 */
function generateStarDisplay(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let html = "";

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      html += '<span class="star filled">★</span>';
    } else if (i === fullStars && hasHalfStar) {
      html += '<span class="star half">★</span>';
    } else {
      html += '<span class="star empty">☆</span>';
    }
  }

  return html;
}

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
  const contentClass = isLongContent
    ? "post-content truncated"
    : "post-content";

  const avgRating = getAverageRating(post);
  const ratingCount = getRatingCount(post);
  const viewCount = post.views || 0;

  card.innerHTML = `
        <div class="post-header">
            <h3 class="post-title">${sanitizeHTML(post.title)}</h3>
            <div class="post-meta-row">
                <div class="post-timestamp">${formatDate(post.timestamp)}</div>
                <div class="post-views">
                    <span class="view-icon">👁</span>
                    <span class="view-count">${viewCount} ${
    viewCount === 1 ? "view" : "views"
  }</span>
                </div>
            </div>
        </div>
        <div class="${contentClass}">${sanitizeHTML(post.content)}</div>
        <div class="post-footer">
            <div class="post-rating-display">
                <div class="stars-display">${generateStarDisplay(
                  avgRating
                )}</div>
                <span class="rating-info">${
                  avgRating > 0 ? avgRating : "No ratings"
                } ${
    ratingCount > 0
      ? `(${ratingCount} ${ratingCount === 1 ? "rating" : "ratings"})`
      : ""
  }</span>
            </div>
            <div class="post-actions">
                <button class="btn btn-rate btn-icon" data-action="rate" data-id="${
                  post.id
                }">
                    Rate
                </button>
                ${
                  isLongContent
                    ? `
                    <button class="btn btn-read-more btn-icon" data-action="view" data-id="${post.id}">
                        Leggi tutto
                    </button>
                `
                    : ""
                }
                <button class="btn btn-edit btn-icon" data-action="edit" data-id="${
                  post.id
                }">
                    Edit
                </button>
                <button class="btn btn-delete btn-icon" data-action="delete" data-id="${
                  post.id
                }">
                    Delete
                </button>
            </div>
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
// FORM TOGGLE FUNCTIONS
// ============================================

/**
 * Toggle new post form visibility
 */
function toggleNewPostForm() {
  const isCollapsed = newPostSection.classList.contains("collapsed");

  if (isCollapsed) {
    // Show form
    newPostSection.classList.remove("collapsed");
    btnAddPost.textContent = "Hide Form";
    // Focus on title input after animation
    setTimeout(() => {
      postTitleInput.focus();
    }, 300);
  } else {
    // Hide form
    newPostSection.classList.add("collapsed");
    btnAddPost.textContent = "New Post";
    // Clear form
    postForm.reset();
    // Clear errors
    titleError.textContent = "";
    contentError.textContent = "";
    postTitleInput.classList.remove("error");
    postContentInput.classList.remove("error");
  }
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
    alert("Post not found");
    return;
  }

  // Increment view count when opening detail
  incrementViews(postId);

  currentView = "detail";
  currentDetailPostId = postId;

  const avgRating = getAverageRating(post);
  const ratingCount = getRatingCount(post);
  const viewCount = post.views || 0;

  // Create detail view HTML
  postDetail.innerHTML = `
        <div class="post-detail-header">
            <h2 class="post-detail-title">${sanitizeHTML(post.title)}</h2>
            <div class="post-detail-meta">
                <span class="post-timestamp">${formatDate(
                  post.timestamp
                )}</span>
                <span class="post-views">
                    <span class="view-icon">👁</span>
                    <span class="view-count">${viewCount} ${
    viewCount === 1 ? "view" : "views"
  }</span>
                </span>
            </div>
            <div class="post-rating-display">
                <div class="stars-display">${generateStarDisplay(
                  avgRating
                )}</div>
                <span class="rating-info">${
                  avgRating > 0 ? avgRating : "No ratings"
                } ${
    ratingCount > 0
      ? `(${ratingCount} ${ratingCount === 1 ? "rating" : "ratings"})`
      : ""
  }</span>
            </div>
        </div>
        <div class="post-detail-content">${sanitizeHTML(post.content)}</div>
        <div class="post-detail-actions">
            <button class="btn btn-back" data-action="back">
                Indietro
            </button>
            <button class="btn btn-rate btn-icon" data-action="rate" data-id="${
              post.id
            }">
                Rate
            </button>
            <button class="btn btn-edit btn-icon" data-action="edit" data-id="${
              post.id
            }">
                Edit
            </button>
            <button class="btn btn-delete btn-icon" data-action="delete" data-id="${
              post.id
            }">
                Delete
            </button>
        </div>
    `;

  // Show detail, hide list
  postDetail.classList.add("active");
  postsContainer.style.display = "none";
  emptyState.style.display = "none";

  // Scroll to top
  postDetail.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Hide post detail view and show list
 */
function hidePostDetail() {
  currentView = "list";
  currentDetailPostId = null;

  // Hide detail, show list
  postDetail.classList.remove("active");
  postsContainer.style.display = "flex";

  // Show empty state if no posts
  if (posts.length === 0) {
    emptyState.style.display = "block";
  }

  // Scroll to posts section
  postsContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
// RATING MODAL FUNCTIONS
// ============================================

/**
 * Open the rating modal
 * @param {string} postId - ID of post to rate
 */
function openRatingModal(postId) {
  const post = getPostById(postId);

  if (!post) {
    alert("Post not found");
    return;
  }

  currentRatingPostId = postId;

  // Create star rating buttons
  ratingStars.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("button");
    star.className = "rating-star";
    star.setAttribute("data-rating", i);
    star.innerHTML = "★";
    star.title = `Rate ${i} star${i > 1 ? "s" : ""}`;
    ratingStars.appendChild(star);
  }

  // Show modal
  ratingModal.classList.add("active");
  ratingModal.setAttribute("aria-hidden", "false");
}

/**
 * Close the rating modal
 */
function closeRatingModal() {
  ratingModal.classList.remove("active");
  ratingModal.setAttribute("aria-hidden", "true");
  currentRatingPostId = null;
  ratingStars.innerHTML = "";
}

/**
 * Handle rating star click
 * @param {Event} e - Click event
 */
function handleRatingClick(e) {
  const star = e.target.closest(".rating-star");

  if (!star || !currentRatingPostId) return;

  const rating = parseInt(star.getAttribute("data-rating"));

  // Add rating to post
  const success = addRating(currentRatingPostId, rating);

  if (success) {
    closeRatingModal();
    // Re-render to show updated rating
    if (currentView === "detail") {
      showPostDetail(currentRatingPostId);
    } else {
      renderPosts();
    }
  } else {
    alert("Failed to add rating");
  }
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

  // Hide form after submission
  newPostSection.classList.add("collapsed");
  btnAddPost.textContent = "New Post";

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
 * Handle post action buttons (edit/delete/view/rate)
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
  } else if (action === "rate") {
    openRatingModal(postId);
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
    if (currentView === "detail" && currentDetailPostId === postId) {
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
  btnAddPost.addEventListener("click", toggleNewPostForm);
  closeModalBtn.addEventListener("click", closeEditModal);
  cancelEditBtn.addEventListener("click", closeEditModal);
  editModal.addEventListener("click", handleModalOverlayClick);

  // Rating modal event listeners
  closeRatingBtn.addEventListener("click", closeRatingModal);
  cancelRatingBtn.addEventListener("click", closeRatingModal);
  ratingStars.addEventListener("click", handleRatingClick);
  ratingModal.addEventListener("click", (e) => {
    if (
      e.target === ratingModal ||
      e.target.classList.contains("modal-overlay")
    ) {
      closeRatingModal();
    }
  });

  // Handle ESC key to close modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (editModal.classList.contains("active")) {
        closeEditModal();
      }
      if (ratingModal.classList.contains("active")) {
        closeRatingModal();
      }
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
