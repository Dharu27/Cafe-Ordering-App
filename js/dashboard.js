/**
 * CaféBliss - Manager Dashboard Logic
 */

// Initialize Dashboard
function initDashboard() {
    const manager = getManager();
    if (manager) {
        document.getElementById('managerName').textContent = manager.name;
    }

    // Tab navigation
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.dataset.tab;
            switchTab(tab);
        });
    });

    // View all links
    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.dataset.tab;
            switchTab(tab);
        });
    });

    // Mobile menu toggle
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });

    // Edit user form
    document.getElementById('editUserForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveUserChanges();
    });

    // Load initial data
    loadOverviewStats();
    loadRecentOrders();
    loadRecentReviews();
    loadAllOrders();
    loadAllUsers();
    loadAllReviews();
}

// Tab Switching
function switchTab(tabName) {
    // Update sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('active', link.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Update page title
    const titles = {
        'overview': 'Overview',
        'orders': 'Orders Management',
        'users': 'User Management',
        'reviews': 'Customer Reviews'
    };
    document.getElementById('pageTitle').textContent = titles[tabName] || tabName;

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('active');
}

// Load Overview Stats
function loadOverviewStats() {
    const orders = getFromStorage(KEYS.ORDERS, []);
    const users = getFromStorage(KEYS.USERS, []);
    const reviews = getFromStorage(KEYS.REVIEWS, []);

    // Total Orders
    document.getElementById('totalOrders').textContent = orders.length;

    // Total Revenue
    const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    document.getElementById('totalRevenue').textContent = `₹${revenue.toLocaleString()}`;

    // Total Users (excluding managers)
    const customerCount = users.filter(u => !u.isManager).length;
    document.getElementById('totalUsers').textContent = customerCount;

    // Average Rating
    if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        document.getElementById('avgRating').textContent = avgRating.toFixed(1);
    }
}

// Load Recent Orders
function loadRecentOrders() {
    const orders = getFromStorage(KEYS.ORDERS, []);
    const container = document.getElementById('recentOrders');

    if (orders.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding: 2rem;"><p>No orders yet</p></div>';
        return;
    }

    // Show last 5 orders
    const recentOrders = orders.slice(-5).reverse();

    container.innerHTML = recentOrders.map(order => `
        <div class="order-item">
            <div class="order-item-header">
                <span class="order-id">${order.orderId}</span>
                <span class="order-amount">₹${order.totalAmount}</span>
            </div>
            <div class="order-item-meta">
                <span>${order.userName || 'Customer'}</span>
                <span>${formatDate(order.orderDate)}</span>
            </div>
        </div>
    `).join('');
}

// Load Recent Reviews
function loadRecentReviews() {
    const reviews = getFromStorage(KEYS.REVIEWS, []);
    const container = document.getElementById('recentReviews');

    if (reviews.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding: 2rem;"><p>No reviews yet</p></div>';
        return;
    }

    // Show last 5 reviews
    const recentReviews = reviews.slice(-5).reverse();

    container.innerHTML = recentReviews.map(review => `
        <div class="review-item-dash">
            <div class="order-item-header">
                <span class="order-id">${review.userName}</span>
                <span class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
            </div>
            <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin-top: 0.5rem;">
                ${review.text.substring(0, 60)}${review.text.length > 60 ? '...' : ''}
            </p>
        </div>
    `).join('');
}

// Load All Orders
function loadAllOrders() {
    const orders = getFromStorage(KEYS.ORDERS, []);
    const tbody = document.getElementById('ordersTableBody');
    const emptyState = document.getElementById('noOrders');
    const tableContainer = document.querySelector('#orders-tab .table-container');

    if (orders.length === 0) {
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';

    tbody.innerHTML = orders.reverse().map(order => `
        <tr data-status="${order.paymentStatus}">
            <td><strong>${order.orderId}</strong></td>
            <td>${order.userName || 'Customer'}</td>
            <td>${order.items.length} item(s)</td>
            <td><strong>₹${order.totalAmount}</strong></td>
            <td>
                <span class="status-badge status-${order.paymentStatus.toLowerCase()}">
                    ${order.paymentStatus}
                </span>
            </td>
            <td>${formatDate(order.orderDate)}</td>
            <td>
                <button class="action-btn view" onclick="viewOrder('${order.orderId}')">View</button>
            </td>
        </tr>
    `).join('');
}

// Filter Orders
function filterOrders() {
    const filter = document.getElementById('orderFilter').value;
    const rows = document.querySelectorAll('#ordersTableBody tr');

    rows.forEach(row => {
        if (filter === 'all' || row.dataset.status === filter) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// View Order Details
function viewOrder(orderId) {
    const orders = getFromStorage(KEYS.ORDERS, []);
    const order = orders.find(o => o.orderId === orderId);

    if (!order) return;

    const container = document.getElementById('orderDetails');
    container.innerHTML = `
        <div class="order-detail-row">
            <span class="order-detail-label">Order ID</span>
            <span class="order-detail-value">${order.orderId}</span>
        </div>
        <div class="order-detail-row">
            <span class="order-detail-label">Customer</span>
            <span class="order-detail-value">${order.userName || 'Customer'}</span>
        </div>
        <div class="order-detail-row">
            <span class="order-detail-label">Date</span>
            <span class="order-detail-value">${formatDateTime(order.orderDate)}</span>
        </div>
        <div class="order-detail-row">
            <span class="order-detail-label">Status</span>
            <span class="order-detail-value">
                <span class="status-badge status-${order.paymentStatus.toLowerCase()}">${order.paymentStatus}</span>
            </span>
        </div>
        <div>
            <p class="order-detail-label" style="margin-bottom: 0.5rem;">Items</p>
            <div class="order-items-list">
                ${order.items.map(item => `
                    <div class="order-item-detail">
                        <span>${item.name} × ${item.quantity}</span>
                        <span>₹${item.price * item.quantity}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="order-detail-row" style="border-bottom: none; padding-bottom: 0;">
            <span class="order-detail-label" style="font-size: 1.1rem;">Total Amount</span>
            <span class="order-detail-value" style="font-size: 1.25rem; color: var(--color-gold);">₹${order.totalAmount}</span>
        </div>
    `;

    document.getElementById('viewOrderModal').classList.add('active');
}

// Load All Users
function loadAllUsers() {
    const users = getFromStorage(KEYS.USERS, []);
    const orders = getFromStorage(KEYS.ORDERS, []);
    const tbody = document.getElementById('usersTableBody');
    const emptyState = document.getElementById('noUsers');
    const tableContainer = document.querySelector('#users-tab .table-container');

    // Filter out managers
    const customers = users.filter(u => !u.isManager);

    if (customers.length === 0) {
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';

    tbody.innerHTML = customers.map(user => {
        const userOrders = orders.filter(o => o.userId === user.id).length;
        return `
            <tr data-name="${user.name.toLowerCase()}" data-email="${user.email.toLowerCase()}">
                <td>${user.id.substring(0, 12)}...</td>
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td>${userOrders}</td>
                <td>
                    <button class="action-btn edit" onclick="editUser('${user.id}')">Edit</button>
                    <button class="action-btn delete" onclick="deleteUser('${user.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Search Users
function searchUsers() {
    const query = document.getElementById('userSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#usersTableBody tr');

    rows.forEach(row => {
        const name = row.dataset.name || '';
        const email = row.dataset.email || '';
        if (name.includes(query) || email.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Edit User
function editUser(userId) {
    const users = getFromStorage(KEYS.USERS, []);
    const user = users.find(u => u.id === userId);

    if (!user) return;

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserName').value = user.name;
    document.getElementById('editUserEmail').value = user.email;

    document.getElementById('editUserModal').classList.add('active');
}

// Save User Changes
function saveUserChanges() {
    const userId = document.getElementById('editUserId').value;
    const name = document.getElementById('editUserName').value;
    const email = document.getElementById('editUserEmail').value;

    const users = getFromStorage(KEYS.USERS, []);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex > -1) {
        users[userIndex].name = name;
        users[userIndex].email = email;
        saveToStorage(KEYS.USERS, users);

        closeModal('editUserModal');
        loadAllUsers();
        showToast('User updated successfully!', 'success');
    }
}

// Delete User
function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    let users = getFromStorage(KEYS.USERS, []);
    users = users.filter(u => u.id !== userId);
    saveToStorage(KEYS.USERS, users);

    loadAllUsers();
    loadOverviewStats();
    showToast('User deleted successfully!', 'success');
}

// Load All Reviews
function loadAllReviews() {
    const reviews = getFromStorage(KEYS.REVIEWS, []);
    const container = document.getElementById('allReviews');
    const emptyState = document.getElementById('noReviews');

    if (reviews.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';

    container.innerHTML = reviews.map(review => `
        <div class="review-card-dash" data-rating="${review.rating}">
            <div class="review-card-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">👤</div>
                    <span class="reviewer-name">${review.userName}</span>
                </div>
                <span class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
            </div>
            <p class="review-text-dash">${review.text}</p>
            <div class="review-meta">
                <span>${review.orderId ? `Order: ${review.orderId}` : 'Sample Review'}</span>
                <span>${formatDate(review.date)}</span>
            </div>
        </div>
    `).join('');
}

// Filter Reviews
function filterReviews() {
    const filter = document.getElementById('reviewFilter').value;
    const cards = document.querySelectorAll('.review-card-dash');

    cards.forEach(card => {
        if (filter === 'all' || card.dataset.rating === filter) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Format Date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Format DateTime
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Manager Logout
function logoutManager() {
    localStorage.removeItem('cafebliss_manager');
    window.location.href = 'manager-login.html';
}
