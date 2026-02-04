import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc }
    from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDWLpX7CwIJWjjOkicgRqKD36KTmCNuq2I",
    authDomain: "bitggobuk.firebaseapp.com",
    projectId: "bitggobuk",
    storageBucket: "bitggobuk.firebasestorage.app",
    messagingSenderId: "140052770311",
    appId: "1:140052770311:web:113b16c269631a72a944a2",
    measurementId: "G-1G8HYRDLNK"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// --- [기존] 블로그 기능 (유지) ---
const randomImages = [
    "https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1535320903710-d9cf113d20c5?auto=format&fit=crop&w=600&q=80"
];

let allBlogPosts = [];
let filteredBlogPosts = [];
let currentDocs = [];
const postsPerPage = 9;
let currentPage = 1;

function createCard(post) {
    const cardLink = document.createElement('a');
    cardLink.href = post.url;
    cardLink.target = "_blank";
    cardLink.className = "blog-card";

    let imgUrl = post.image || randomImages[0];
    const img = document.createElement('img');
    img.src = imgUrl;
    img.className = "blog-thumbnail";
    img.onerror = function () { this.src = randomImages[0]; };

    const infoDiv = document.createElement('div');
    infoDiv.className = "blog-info";

    const category = document.createElement('div');
    category.className = "blog-category";
    category.textContent = post.category || 'Uncategorized';

    const title = document.createElement('div');
    title.className = "blog-title";
    title.textContent = post.title;

    const date = document.createElement('div');
    date.className = "blog-date";
    let dateStr = "";
    if (post.createdAt) {
        const d = post.createdAt.toDate();
        dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    }
    date.textContent = dateStr;

    infoDiv.appendChild(category);
    infoDiv.appendChild(title);
    infoDiv.appendChild(date);

    const actionGroup = document.createElement('div');
    actionGroup.className = 'card-actions';

    const leftBtn = document.createElement('button');
    leftBtn.className = 'action-icon-btn';
    leftBtn.innerHTML = "◀";
    leftBtn.onclick = (e) => { e.stopPropagation(); e.preventDefault(); movePost(post.id, 'left'); };

    const rightBtn = document.createElement('button');
    rightBtn.className = 'action-icon-btn';
    rightBtn.innerHTML = "▶";
    rightBtn.onclick = (e) => { e.stopPropagation(); e.preventDefault(); movePost(post.id, 'right'); };

    const editBtn = document.createElement('button');
    editBtn.className = 'action-icon-btn btn-edit';
    editBtn.innerHTML = "✎";
    editBtn.onclick = (e) => { e.stopPropagation(); e.preventDefault(); openEditModal(post); };

    const delBtn = document.createElement('button');
    delBtn.className = 'action-icon-btn btn-delete';
    delBtn.innerHTML = "✕";
    delBtn.onclick = (e) => { e.stopPropagation(); e.preventDefault(); openDeleteModal(post.id, 'blog'); };

    actionGroup.appendChild(leftBtn);
    actionGroup.appendChild(editBtn);
    actionGroup.appendChild(delBtn);
    actionGroup.appendChild(rightBtn);

    cardLink.appendChild(img);
    cardLink.appendChild(infoDiv);
    cardLink.appendChild(actionGroup);
    return cardLink;
}

function renderBlogPage(page) {
    currentPage = page;
    const fullList = document.getElementById('fullBlogList');
    fullList.innerHTML = "";
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = filteredBlogPosts.slice(startIndex, endIndex);
    postsToShow.forEach(post => fullList.appendChild(createCard(post)));
    renderPaginationControls();
}

function renderPaginationControls() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(filteredBlogPosts.length / postsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = "#"; pageLink.textContent = i; pageLink.className = "page-link";
        if (i === currentPage) pageLink.classList.add('active');
        pageLink.onclick = (e) => { e.preventDefault(); renderBlogPage(i); }
        paginationContainer.appendChild(pageLink);
    }
}

function filterAndRenderPosts(category) {
    if (category === 'all') {
        filteredBlogPosts = [...allBlogPosts];
    } else {
        filteredBlogPosts = allBlogPosts.filter(post => post.category === category);
    }
    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    renderBlogPage(1);
}

function startListeningBlog() {
    const q = query(collection(db, "blogPosts"), orderBy("order", "desc"));
    onSnapshot(q, (snapshot) => {
        const homeList = document.getElementById('linksList');
        homeList.innerHTML = "";
        allBlogPosts = []; currentDocs = [];

        if (snapshot.empty) {
            homeList.innerHTML = "<p style='color:var(--text-sub)'>No posts.</p>";
            return;
        }

        snapshot.forEach((docSnap) => {
            const post = docSnap.data();
            const id = docSnap.id;
            allBlogPosts.push({ id, ...post });
            currentDocs.push({ id, ...post, ref: docSnap.ref });
        });

        const homePosts = allBlogPosts.slice(0, 6);
        homePosts.forEach(post => homeList.appendChild(createCard(post)));
        filterAndRenderPosts('all');
    });
}
startListeningBlog();

async function movePost(currentId, direction) {
    const currentIndex = currentDocs.findIndex(doc => doc.id === currentId);
    if (currentIndex === -1) return;
    let targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentDocs.length) return;
    const currentItem = currentDocs[currentIndex];
    const targetItem = currentDocs[targetIndex];
    const currentOrder = currentItem.order || 0;
    const targetOrder = targetItem.order || 0;
    try {
        await updateDoc(doc(db, "blogPosts", currentItem.id), { order: targetOrder });
        await updateDoc(doc(db, "blogPosts", targetItem.id), { order: currentOrder });
    } catch (e) { console.error("Order error:", e); }
}

const addPostBtn = document.getElementById('addPostBtn');
addPostBtn.addEventListener('click', async () => {
    const titleInput = document.getElementById('postTitleInput');
    const urlInput = document.getElementById('postUrlInput');
    const imageInput = document.getElementById('postImageInput');
    const categoryInput = document.getElementById('postCategoryInput');
    const title = titleInput.value.trim();
    let url = urlInput.value.trim();
    let image = imageInput.value.trim();
    const category = categoryInput.value;
    if (!title || !url) { alert("Title and URL required."); return; }
    if (!url.startsWith('http')) url = 'https://' + url;
    if (!image) image = randomImages[0];
    try {
        await addDoc(collection(db, "blogPosts"), {
            title, url, image, category, createdAt: serverTimestamp(), order: Date.now()
        });
        titleInput.value = ""; urlInput.value = ""; imageInput.value = "";
    } catch (e) { console.error(e); }
});

document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        filterAndRenderPosts(btn.dataset.category);
    });
});


// --- 통합 삭제 로직 (블로그 + 관심종목) ---
async function deleteData(id, type) {
    try {
        if (type === 'blog') {
            await deleteDoc(doc(db, "blogPosts", id));
        } else if (type === 'watchlist') {
            const user = auth.currentUser;
            if (user) {
                await deleteDoc(doc(db, `users/${user.uid}/watchlist`, id));
            }
        }
    } catch (e) { console.error(e); }
}

function showPage(pageId) {
    // Hide all page-views and remove active class from nav links
    document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.top-menu a').forEach(link => link.classList.remove('active'));

    // Determine the correct view to show. 'home' and 'news' are on the 'main-view'.
    const viewId = (pageId === 'home' || pageId === 'news') ? 'main' : pageId;
    const view = document.getElementById(viewId + '-view');
    if (view) {
        view.classList.add('active');
    }

    // Determine the correct nav link to activate. 'news' section should keep 'home' active.
    const navId = (pageId === 'news') ? 'home' : pageId;
    const navLink = document.getElementById('nav-' + navId);
    if (navLink) {
        navLink.classList.add('active');
    }
}

function router() {
    let pageId = window.location.hash.substring(1);
    if (!pageId) {
        pageId = 'home';
    }

    showPage(pageId);

    // Handle scrolling after the view is shown
    if (pageId === 'news') {
        setTimeout(() => {
            const section = document.getElementById('news');
            if (section) {
                // Scroll the section into view
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100); // A small delay ensures the view is rendered
    } else {
        // For all other pages, scroll to the top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

window.addEventListener('hashchange', router);

// --- TradingView 위젯 동적 로드 ---
function createWidgetScript(src, config) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    return script;
}

function loadWidgets(theme) {
    const newsContainer = document.getElementById('newsWidgetContainer');
    if (newsContainer) {
        newsContainer.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
        const newsConfig = {
            "displayMode": "regular", "feedMode": "all_symbols",
            "colorTheme": theme, "isTransparent": false, "locale": "en", "width": "100%", "height": 550
        };
        newsContainer.appendChild(createWidgetScript("https://s3.tradingview.com/external-embedding/embed-widget-timeline.js", newsConfig));
    }
    const calContainer = document.getElementById('calendarWidgetContainer');
    if (calContainer) {
        calContainer.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
        const calConfig = {
            "colorTheme": theme, "isTransparent": false, "locale": "en",
            "countryFilter": "ar,au,br,ca,cn,fr,de,in,id,it,jp,kr,mx,ru,sa,za,tr,gb,us,eu",
            "importanceFilter": "-1,0,1", "width": "100%", "height": 550
        };
        calContainer.appendChild(createWidgetScript("https://s3.tradingview.com/external-embedding/embed-widget-events.js", calConfig));
    }
    const watchlistCharts = document.querySelectorAll('#myWatchlistGrid tv-mini-chart');
    watchlistCharts.forEach(chart => chart.setAttribute('theme', theme));
}

// --- 관리자 모달 ---
function openAdminModal() {
    const form1 = document.getElementById('adminForm');
    if (form1.classList.contains('active')) {
        form1.classList.remove('active');
        document.body.classList.remove('admin-mode');
        return;
    }
    document.getElementById('passwordModal').classList.add('open');
    document.getElementById('modalPasswordInput').value = '';
    document.getElementById('passwordError').style.display = 'none';
    document.getElementById('modalPasswordInput').focus();
}

function closeAdminModal() {
    document.getElementById('passwordModal').classList.remove('open');
}

function checkPassword() {
    const input = document.getElementById('modalPasswordInput');
    const error = document.getElementById('passwordError');
    if (input.value === "1234") {
        closeAdminModal();
        document.getElementById('adminForm').classList.add('active');
        document.body.classList.add('admin-mode');
    } else {
        error.style.display = 'block'; input.value = ''; input.focus();
    }
}

// --- 삭제 모달 ---
let deleteTarget = { id: null, type: null };
function openDeleteModal(id, type) {
    deleteTarget = { id, type };
    document.getElementById('deleteModal').classList.add('open');
}
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('open');
    deleteTarget = { id: null, type: null };
}
function confirmDelete() {
    if (deleteTarget.id && deleteData) {
        deleteData(deleteTarget.id, deleteTarget.type);
    }
    closeDeleteModal();
}

// --- 수정 모달 ---
let editTargetId = null;
function openEditModal(post) {
    editTargetId = post.id;
    document.getElementById('editPostId').value = post.id;
    document.getElementById('editPostTitleInput').value = post.title;
    document.getElementById('editPostUrlInput').value = post.url;
    document.getElementById('editPostImageInput').value = post.image;
    document.getElementById('editPostCategoryInput').value = post.category;
    document.getElementById('editModal').classList.add('open');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('open');
    editTargetId = null;
}

async function saveChanges() {
    const id = editTargetId;
    if (!id) return;

    const title = document.getElementById('editPostTitleInput').value.trim();
    const url = document.getElementById('editPostUrlInput').value.trim();
    const image = document.getElementById('editPostImageInput').value.trim();
    const category = document.getElementById('editPostCategoryInput').value;

    if (!title || !url) {
        alert("Title and URL are required.");
        return;
    }

    try {
        await updateDoc(doc(db, "blogPosts", id), {
            title,
            url,
            image,
            category
        });
        closeEditModal();
    } catch (e) {
        console.error("Error updating document: ", e);
    }
}

// --- 테마 ---
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    const newTheme = isDark ? 'dark' : 'light';

    if (isDark) {
        themeIcon.textContent = '☀️';
    }
    updateCharts(newTheme);
    loadWidgets(newTheme);
    localStorage.setItem('theme', newTheme);
}

function updateCharts(theme) {
    const charts = document.querySelectorAll('.mini-chart-grid tv-mini-chart');
    charts.forEach(chart => {
        chart.setAttribute('theme', theme);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    // Load theme
    const savedTheme = localStorage.getItem('theme');
    let initialTheme = 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeIcon').textContent = '☀️';
        initialTheme = 'dark';
    }
    updateCharts(initialTheme);
    loadWidgets(initialTheme);

    // Initial routing
    router();

    // Event Listeners
    document.querySelector('.logo').addEventListener('click', () => window.location.hash = '#home');
    document.getElementById('themeBtn').addEventListener('click', toggleTheme);
    document.getElementById('adminToggle').addEventListener('click', openAdminModal);
    document.getElementById('passwordConfirmBtn').addEventListener('click', checkPassword);
    document.getElementById('passwordCancelBtn').addEventListener('click', closeAdminModal);
    document.getElementById('modalPasswordInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') checkPassword(); });
    document.getElementById('deleteConfirmBtn').addEventListener('click', confirmDelete);
    document.getElementById('deleteCancelBtn').addEventListener('click', closeDeleteModal);
    document.getElementById('viewAllBtn').addEventListener('click', () => showPage('blog'));

    // Edit Modal Event Listeners
    document.getElementById('saveChangesBtn').addEventListener('click', saveChanges);
    document.getElementById('editCancelBtn').addEventListener('click', closeEditModal);
});

window.openDeleteModal = openDeleteModal;
window.openEditModal = openEditModal;
