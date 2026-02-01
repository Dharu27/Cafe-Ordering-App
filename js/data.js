/**
 * CaféBliss - Data Store
 * Menu items with real food images
 */

const MENU_ITEMS = [
    {
        id: 1,
        name: "Espresso",
        description: "Rich and bold single shot",
        price: 120,
        category: "coffee",
        emoji: "☕",
        image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop"
    },
    {
        id: 2,
        name: "Cappuccino",
        description: "Espresso with steamed milk and foam",
        price: 180,
        category: "coffee",
        emoji: "☕",
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop"
    },
    {
        id: 3,
        name: "Latte",
        description: "Smooth espresso with creamy milk",
        price: 200,
        category: "coffee",
        emoji: "🥛",
        image: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&h=300&fit=crop"
    },
    {
        id: 4,
        name: "Americano",
        description: "Espresso diluted with hot water",
        price: 150,
        category: "coffee",
        emoji: "☕",
        image: "https://images.unsplash.com/photo-1551030173-122aaafdadc2?w=400&h=300&fit=crop"
    },
    {
        id: 5,
        name: "Mocha",
        description: "Espresso with chocolate and milk",
        price: 220,
        category: "coffee",
        emoji: "🍫",
        image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&h=300&fit=crop"
    },
    {
        id: 6,
        name: "Cold Coffee",
        description: "Chilled coffee blended with ice",
        price: 180,
        category: "cold",
        emoji: "🧊",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop"
    },
    {
        id: 7,
        name: "Iced Latte",
        description: "Cold espresso with chilled milk",
        price: 200,
        category: "cold",
        emoji: "🧊",
        image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=300&fit=crop"
    },
    {
        id: 8,
        name: "Frappe",
        description: "Blended iced coffee with cream",
        price: 250,
        category: "cold",
        emoji: "🥤",
        image: "https://images.unsplash.com/photo-1530373239216-42518e6b4063?w=400&h=300&fit=crop"
    },
    {
        id: 9,
        name: "Cold Brew",
        description: "Slow-steeped cold coffee",
        price: 220,
        category: "cold",
        emoji: "🫖",
        image: "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=400&h=300&fit=crop"
    },
    {
        id: 10,
        name: "Club Sandwich",
        description: "Triple-layered with chicken and veggies",
        price: 280,
        category: "food",
        emoji: "🥪",
        image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop"
    },
    {
        id: 11,
        name: "Grilled Sandwich",
        description: "Cheese and veggie grilled",
        price: 180,
        category: "food",
        emoji: "🥪",
        image: "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&h=300&fit=crop"
    },
    {
        id: 12,
        name: "Croissant",
        description: "Buttery, flaky French pastry",
        price: 120,
        category: "food",
        emoji: "🥐",
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop"
    },
    {
        id: 13,
        name: "Chocolate Muffin",
        description: "Moist chocolate with chips",
        price: 100,
        category: "food",
        emoji: "🧁",
        image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop"
    },
    {
        id: 14,
        name: "Cheesecake",
        description: "Creamy NY style slice",
        price: 220,
        category: "food",
        emoji: "🍰",
        image: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400&h=300&fit=crop"
    },
    {
        id: 15,
        name: "Brownie",
        description: "Rich chocolate with walnuts",
        price: 150,
        category: "food",
        emoji: "🍫",
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop"
    }
];

const SAMPLE_REVIEWS = [
    { id: 1, userName: "Coffee Lover", rating: 5, text: "Amazing coffee! Will order again!", date: "2024-01-15" },
    { id: 2, userName: "Sarah M.", rating: 4, text: "Great service and delicious food.", date: "2024-01-14" },
    { id: 3, userName: "John D.", rating: 5, text: "Best cold brew in town!", date: "2024-01-13" }
];

const RATING_TEXTS = { 1: "Poor 😞", 2: "Fair 😐", 3: "Good 🙂", 4: "Very Good 😊", 5: "Excellent! 🤩" };

const DEMO_USER = { id: "demo-user-001", name: "Demo User", email: "demo@cafebliss.com", password: "demo123" };

const DEMO_MANAGER = { id: "manager-001", name: "Cafe Manager", email: "manager@cafebliss.com", password: "admin123", isManager: true };
