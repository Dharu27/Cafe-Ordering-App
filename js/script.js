/**
 * CaféBliss - Main Application Logic
 */

// ===== STORAGE KEYS =====
const KEYS = {
    USERS: 'cafebliss_users',
    CURRENT_USER: 'cafebliss_current_user',
    CART: 'cafebliss_cart',
    ORDERS: 'cafebliss_orders',
    REVIEWS: 'cafebliss_reviews',
    LAST_ORDER: 'cafebliss_last_order'
};

// ===== UTILITY FUNCTIONS =====
function getFromStorage(key, defaultValue = null) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
}

function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
    return 'ORD' + Date.now().toString(36).toUpperCase();
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// ===== INITIALIZATION =====
function initApp() {
    initDemoUser();
    updateCartCount();
    updateAuthUI();
}

function initDemoUser() {
    const users = getFromStorage(KEYS.USERS, []);
    const demoExists = users.some(u => u.email === DEMO_USER.email);
    if (!demoExists) {
        users.push({
            id: DEMO_USER.id,
            name: DEMO_USER.name,
            email: DEMO_USER.email,
            password: simpleHash(DEMO_USER.password)
        });
        saveToStorage(KEYS.USERS, users);
    }

    // Init sample reviews
    const reviews = getFromStorage(KEYS.REVIEWS, []);
    if (reviews.length === 0) {
        saveToStorage(KEYS.REVIEWS, SAMPLE_REVIEWS);
    }
}

// ===== AUTH FUNCTIONS =====
function registerUser(name, email, password) {
    const users = getFromStorage(KEYS.USERS, []);

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'Email already registered' };
    }

    const newUser = {
        id: 'user_' + Date.now(),
        name: name,
        email: email.toLowerCase(),
        password: simpleHash(password)
    };

    users.push(newUser);
    saveToStorage(KEYS.USERS, users);

    return { success: true, message: 'Registration successful' };
}

function loginUser(email, password) {
    const users = getFromStorage(KEYS.USERS, []);
    const user = users.find(u =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === simpleHash(password)
    );

    if (user) {
        saveToStorage(KEYS.CURRENT_USER, { id: user.id, name: user.name, email: user.email });
        return { success: true };
    }

    return { success: false, message: 'Invalid email or password' };
}

function logout() {
    localStorage.removeItem(KEYS.CURRENT_USER);
    window.location.href = 'index.html';
}

function isLoggedIn() {
    return getFromStorage(KEYS.CURRENT_USER) !== null;
}

function getCurrentUser() {
    return getFromStorage(KEYS.CURRENT_USER);
}

function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userGreeting = document.getElementById('userGreeting');

    if (!authButtons || !userMenu) return;

    if (isLoggedIn()) {
        const user = getCurrentUser();
        authButtons.style.display = 'none';
        userMenu.style.display = 'flex';
        if (userGreeting) userGreeting.textContent = `Hi, ${user.name.split(' ')[0]}`;
    } else {
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// ===== MANAGER AUTH FUNCTIONS =====
function loginManager(email, password) {
    // Check against demo manager
    if (email.toLowerCase() === DEMO_MANAGER.email.toLowerCase() &&
        password === DEMO_MANAGER.password) {
        saveToStorage('cafebliss_manager', {
            id: DEMO_MANAGER.id,
            name: DEMO_MANAGER.name,
            email: DEMO_MANAGER.email,
            isManager: true
        });
        return { success: true };
    }
    return { success: false, message: 'Invalid manager credentials' };
}

function isManagerLoggedIn() {
    return getFromStorage('cafebliss_manager') !== null;
}

function getManager() {
    return getFromStorage('cafebliss_manager');
}

function logoutManager() {
    localStorage.removeItem('cafebliss_manager');
    window.location.href = 'manager-login.html';
}

// ===== CART FUNCTIONS =====
function getCart() {
    return getFromStorage(KEYS.CART, []);
}

function saveCart(cart) {
    saveToStorage(KEYS.CART, cart);
    updateCartCount();
}

function addToCart(itemId) {
    const item = MENU_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    const cart = getCart();
    const existingIndex = cart.findIndex(i => i.id === itemId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    saveCart(cart);
    showToast(`${item.name} added to bag!`, 'success');

    // Animate button
    const btn = document.querySelector(`[data-item-id="${itemId}"]`);
    if (btn) {
        btn.classList.add('added');
        setTimeout(() => btn.classList.remove('added'), 500);
    }
}

function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(i => i.id !== itemId);
    saveCart(cart);
    loadCart();
}

function updateQuantity(itemId, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === itemId);

    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
    }

    saveCart(cart);
    loadCart();
}

function updateCartCount() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElements = document.querySelectorAll('#cartCount');
    countElements.forEach(el => el.textContent = total);
}

function getCartTotal() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.05);
    return { subtotal, tax, total: subtotal + tax };
}

function clearCart() {
    localStorage.removeItem(KEYS.CART);
    updateCartCount();
}

// ===== MENU FUNCTIONS =====
function loadMenu(category = 'all') {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;

    const items = category === 'all'
        ? MENU_ITEMS
        : MENU_ITEMS.filter(i => i.category === category);

    grid.innerHTML = items.map(item => `
        <div class="menu-card" data-category="${item.category}">
            <div class="menu-card-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="menu-card-content">
                <span class="menu-card-category">${item.category}</span>
                <h3 class="menu-card-title">${item.name}</h3>
                <p class="menu-card-description">${item.description}</p>
                <div class="menu-card-footer">
                    <span class="menu-card-price">₹${item.price}</span>
                    <button class="add-to-cart-btn" data-item-id="${item.id}" onclick="addToCart(${item.id})">+</button>
                </div>
            </div>
        </div>
    `).join('');

    // Category filter buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadMenu(btn.dataset.category);
        });
    });
}

// ===== CART PAGE FUNCTIONS =====
function loadCart() {
    const cart = getCart();
    const itemsContainer = document.getElementById('cartItems');
    const emptyState = document.getElementById('cartEmpty');
    const summary = document.getElementById('cartSummary');

    if (!itemsContainer) return;

    if (cart.length === 0) {
        itemsContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        if (summary) summary.style.display = 'none';
        return;
    }

    itemsContainer.style.display = 'flex';
    if (emptyState) emptyState.style.display = 'none';
    if (summary) summary.style.display = 'block';

    itemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span class="price">₹${item.price}</span>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');

    updateCartSummary();
}

function updateCartSummary() {
    const { subtotal, tax, total } = getCartTotal();
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (taxEl) taxEl.textContent = `₹${tax}`;
    if (totalEl) totalEl.textContent = `₹${total}`;
}

function proceedToPayment() {
    if (!isLoggedIn()) {
        showToast('Please login to continue', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    if (getCart().length === 0) {
        showToast('Your bag is empty', 'error');
        return;
    }

    window.location.href = 'payment.html';
}

function applyPromo() {
    showToast('Promo codes coming soon!', 'error');
}

// ===== PAYMENT FUNCTIONS =====
function loadPaymentSummary() {
    const cart = getCart();
    const itemsContainer = document.getElementById('summaryItems');
    const { total } = getCartTotal();

    if (itemsContainer) {
        itemsContainer.innerHTML = cart.map(item => `
            <div class="summary-item">
                <span class="summary-item-name">
                    <img src="${item.image}" alt="${item.name}" class="summary-item-img">
                    <span>${item.name}</span>
                    <span class="summary-item-qty">x${item.quantity}</span>
                </span>
                <span>₹${item.price * item.quantity}</span>
            </div>
        `).join('');
    }

    const totalEl = document.getElementById('total');
    const payAmount = document.getElementById('payAmount');
    if (totalEl) totalEl.textContent = `₹${total}`;
    if (payAmount) payAmount.textContent = `₹${total}`;
}

function initPaymentForm() {
    const form = document.getElementById('paymentForm');
    const cardNumber = document.getElementById('cardNumber');
    const cardHolder = document.getElementById('cardHolder');
    const expiry = document.getElementById('expiry');

    // Live card preview
    if (cardNumber) {
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '').substring(0, 16);
            value = value.replace(/(.{4})/g, '$1 ').trim();
            e.target.value = value;
            document.getElementById('cardPreview').textContent = value || '•••• •••• •••• ••••';
        });
    }

    if (cardHolder) {
        cardHolder.addEventListener('input', (e) => {
            document.getElementById('holderPreview').textContent = e.target.value.toUpperCase() || 'YOUR NAME';
        });
    }

    if (expiry) {
        expiry.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '').substring(0, 4);
            if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
            e.target.value = value;
            document.getElementById('expiryPreview').textContent = value || 'MM/YY';
        });
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            processPayment();
        });
    }
}

function processPayment() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;
    const errorEl = document.getElementById('formError');
    const btn = document.getElementById('payBtn');

    // Validation
    if (cardNumber.length !== 16) {
        errorEl.textContent = 'Please enter a valid 16-digit card number';
        return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        errorEl.textContent = 'Please enter a valid expiry date (MM/YY)';
        return;
    }

    if (cvv.length !== 3) {
        errorEl.textContent = 'Please enter a valid 3-digit CVV';
        return;
    }

    errorEl.textContent = '';
    btn.classList.add('loading');

    // Simulate payment processing
    setTimeout(() => {
        btn.classList.remove('loading');

        // Save order
        const cart = getCart();
        const { total } = getCartTotal();
        const user = getCurrentUser();
        const orderId = generateId();

        const order = {
            orderId,
            userId: user.id,
            userName: user.name,
            items: cart,
            totalAmount: total,
            paymentStatus: 'Success',
            orderDate: new Date().toISOString()
        };

        const orders = getFromStorage(KEYS.ORDERS, []);
        orders.push(order);
        saveToStorage(KEYS.ORDERS, orders);
        saveToStorage(KEYS.LAST_ORDER, order);

        // Clear cart
        clearCart();

        // Show success modal
        document.getElementById('orderId').textContent = orderId;
        document.getElementById('successModal').classList.add('active');
    }, 2000);
}

// ===== ORDER FUNCTIONS =====
function getLastOrder() {
    return getFromStorage(KEYS.LAST_ORDER);
}

// ===== REVIEW FUNCTIONS =====
function loadReviews() {
    const grid = document.getElementById('reviewsGrid');
    if (!grid) return;

    const reviews = getFromStorage(KEYS.REVIEWS, []);

    grid.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-item-header">
                <span class="review-item-user">${review.userName}</span>
                <span class="review-item-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
            </div>
            <p class="review-item-text">${review.text}</p>
            <span class="review-item-date">${new Date(review.date).toLocaleDateString()}</span>
        </div>
    `).join('');
}

function initReviewForm() {
    const stars = document.querySelectorAll('.star-rating .star');
    const ratingText = document.getElementById('ratingText');
    const form = document.getElementById('reviewForm');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = parseInt(star.dataset.value);
            ratingText.textContent = RATING_TEXTS[value];
        });
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            submitReview();
        });
    }
}

function submitReview() {
    const ratingInput = document.querySelector('.star-rating input:checked');
    const reviewText = document.getElementById('reviewText').value;
    const errorEl = document.getElementById('formError');

    if (!ratingInput) {
        errorEl.textContent = 'Please select a rating';
        return;
    }

    const rating = parseInt(ratingInput.value);
    const user = getCurrentUser();
    const lastOrder = getLastOrder();

    const review = {
        id: Date.now(),
        userId: user.id,
        userName: user.name,
        orderId: lastOrder.orderId,
        rating,
        text: reviewText || 'No comment provided.',
        date: new Date().toISOString()
    };

    const reviews = getFromStorage(KEYS.REVIEWS, []);
    reviews.unshift(review);
    saveToStorage(KEYS.REVIEWS, reviews);

    // Clear last order to prevent re-reviewing
    localStorage.removeItem(KEYS.LAST_ORDER);

    // Show thank you modal
    document.getElementById('thankYouModal').classList.add('active');
}

function skipReview() {
    localStorage.removeItem(KEYS.LAST_ORDER);
    window.location.href = 'index.html';
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    if (!toast || !toastMessage) return;

    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}
