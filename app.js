"use strict";


/* ================================
   تنظیمات اصلی
================================ */

const ADMIN_PASSWORD = "fal";

const STORAGE_KEY = "alf_shop_products_v1";
const CART_KEY = "alf_shop_cart_v1";


/* ================================
   محصولات پیش‌فرض
================================ */

const DEFAULT_PRODUCTS = [

    {
        id: 1,
        name: "شومیز سفید زنانه",
        category: "شومیز",
        price: 890000,
        image: "assets/banner.jpg",
        desc: "شومیز زنانه شیک و مناسب استفاده روزمره."
    },

    {
        id: 2,
        name: "مانتو زنانه",
        category: "مانتو",
        price: 1290000,
        image: "assets/banner.jpg",
        desc: "مانتو زنانه با طراحی شیک و مناسب استایل روزانه."
    },

    {
        id: 3,
        name: "ست زنانه",
        category: "ست",
        price: 1490000,
        image: "assets/banner.jpg",
        desc: "ست زنانه شیک و راحت برای استفاده روزمره."
    }

];


/* ================================
   گرفتن اطلاعات از LocalStorage
================================ */

function loadProducts() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            return JSON.parse(saved);
        }

    } catch (error) {

        console.error("خطا در خواندن محصولات:", error);

    }

    return DEFAULT_PRODUCTS;

}


function saveProducts() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(products)
    );

}


/* ================================
   متغیرها
================================ */

let products = loadProducts();

let cart = loadCart();

let selectedCategory = "همه";


/* ================================
   ابزارهای عمومی
================================ */

function formatPrice(price) {

    return Number(price).toLocaleString("fa-IR") + " تومان";

}


function escapeHtml(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


function openModal(id) {

    const modal = document.getElementById(id);

    if (modal) {
        modal.classList.add("show");
    }

}


function closeModal(id) {

    const modal = document.getElementById(id);

    if (modal) {
        modal.classList.remove("show");
    }

}


/* ================================
   نمایش محصولات
================================ */

function renderProducts() {

    const grid = document.getElementById("productGrid");
    const empty = document.getElementById("emptyProducts");

    const searchInput = document.getElementById("searchInput");

    const query = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const categorySelect =
        document.getElementById("categoryFilter");

    const category =
        categorySelect
            ? categorySelect.value
            : selectedCategory;


    const filtered = products.filter(product => {

        const matchesSearch =
            product.name.toLowerCase().includes(query) ||
            product.desc.toLowerCase().includes(query);

        const matchesCategory =
            category === "همه" ||
            product.category === category;

        return matchesSearch && matchesCategory;

    });


    if (filtered.length === 0) {

        grid.innerHTML = "";

        empty.style.display = "block";

        return;

    }


    empty.style.display = "none";


    grid.innerHTML = filtered.map(product => {

        return `

            <article class="product-card">

                <img
                    class="product-image"
                    src="${escapeHtml(product.image)}"
                    alt="${escapeHtml(product.name)}"
                    onerror="this.src='assets/banner.jpg'"
                >

                <div class="product-body">

                    <div class="product-category">
                        ${escapeHtml(product.category)}
                    </div>

                    <h3 class="product-title">
                        ${escapeHtml(product.name)}
                    </h3>

                    <p class="product-description">
                        ${escapeHtml(product.desc)}
                    </p>

                    <div class="product-price">
                        ${formatPrice(product.price)}
                    </div>

                    <div class="product-buttons">

                        <button
                            onclick="showProduct(${product.id})"
                        >
                            مشاهده
                        </button>

                        <button
                            class="buy"
                            onclick="addToCart(${product.id})"
                        >
                            🛒 افزودن
                        </button>

                    </div>

                </div>

            </article>

        `;

    }).join("");

}


/* ================================
   نمایش محصول
================================ */

function showProduct(id) {

    const product = products.find(
        p => p.id === id
    );

    if (!product) {
        return;
    }


    const detail =
        document.getElementById("productDetail");


    detail.innerHTML = `

        <h2>${escapeHtml(product.name)}</h2>

        <img
            class="detail-image"
            src="${escapeHtml(product.image)}"
            alt="${escapeHtml(product.name)}"
            onerror="this.src='assets/banner.jpg'"
        >

        <div class="product-category">
            ${escapeHtml(product.category)}
        </div>

        <div class="detail-price">
            ${formatPrice(product.price)}
        </div>

        <p class="detail-description">
            ${escapeHtml(product.desc)}
        </p>

        <br>

        <button
            class="primary-button"
            onclick="addToCart(${product.id}); closeModal('productModal')"
        >
            🛒 افزودن به سبد خرید
        </button>

    `;


    openModal("productModal");

}


/* ================================
   سبد خرید
================================ */

function loadCart() {

    try {

        const saved = localStorage.getItem(CART_KEY);

        if (saved) {
            return JSON.parse(saved);
        }

    } catch (error) {

        console.error(error);

    }

    return [];

}


function saveCart() {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}


function addToCart(id) {

    const product = products.find(
        p => p.id === id
    );

    if (!product) {
        return;
    }


    cart.push(id);

    saveCart();

    updateCartCount();

    showToast("محصول به سبد خرید اضافه شد 🛒");

}


function removeFromCart(index) {

    cart.splice(index, 1);

    saveCart();

    renderCart();

    updateCartCount();

}


function updateCartCount() {

    document.getElementById("cartCount").textContent =
        cart.length.toLocaleString("fa-IR");

}


function renderCart() {

    const container =
        document.getElementById("cartItems");

    const totalElement =
        document.getElementById("cartTotal");


    if (cart.length === 0) {

        container.innerHTML = `
            <div class="empty-products">
                <div>🛒</div>
                <h3>سبد خرید خالی است</h3>
                <p>محصولات مورد علاقه‌ات را اضافه کن.</p>
            </div>
        `;

        totalElement.textContent = "0 تومان";

        return;

    }


    let total = 0;


    container.innerHTML = cart.map((id, index) => {

        const product =
            products.find(p => p.id === id);


        if (!product) {
            return "";
        }


        total += Number(product.price);


        return `

            <div class="cart-item">

                <img
                    src="${escapeHtml(product.image)}"
                    alt="${escapeHtml(product.name)}"
                    onerror="this.src='assets/banner.jpg'"
                >

                <div class="cart-item-info">

                    <strong>
                        ${escapeHtml(product.name)}
                    </strong>

                    <span>
                        ${formatPrice(product.price)}
                    </span>

                </div>

                <button
                    class="remove-cart"
                    onclick="removeFromCart(${index})"
                >
                    حذف
                </button>

            </div>

        `;

    }).join("");


    totalElement.textContent =
        formatPrice(total);

}


/* ================================
   پنل مدیریت
================================ */

function openAdmin() {

    document.getElementById("adminPassword").value = "";

    document.getElementById("loginError").textContent = "";

    openModal("loginModal");

}


function loginAdmin() {

    const password =
        document.getElementById("adminPassword").value;

    const error =
        document.getElementById("loginError");


    if (password === ADMIN_PASSWORD) {

        closeModal("loginModal");

        renderAdminProducts();

        openModal("adminModal");

        showToast("ورود به پنل مدیریت موفق بود");

    } else {

        error.textContent =
            "رمز مدیریت اشتباه است.";

    }

}


function logoutAdmin() {

    closeModal("adminModal");

    showToast("از پنل مدیریت خارج شدید");

}


/* ================================
   نمایش محصولات در مدیریت
================================ */

function renderAdminProducts() {

    const container =
        document.getElementById("adminProducts");


    if (products.length === 0) {

        container.innerHTML = `
            <p>محصولی وجود ندارد.</p>
        `;

        return;

    }


    container.innerHTML = products.map(product => {

        return `

            <div class="admin-product">

                <div class="admin-product-info">

                    <img
                        class="admin-product-image"
                        src="${escapeHtml(product.image)}"
                        alt=""
                        onerror="this.src='assets/banner.jpg'"
                    >

                    <div>

                        <strong>
                            ${escapeHtml(product.name)}
                        </strong>

                        <div>
                            ${formatPrice(product.price)}
                        </div>

                    </div>

                </div>

                <button
                    class="delete-product"
                    onclick="deleteProduct(${product.id})"
                >
                    🗑️ حذف
                </button>

            </div>

        `;

    }).join("");

}


/* ================================
   افزودن محصول
================================ */

function addProduct(event) {

    event.preventDefault();


    const name =
        document.getElementById("productName").value.trim();

    const price =
        Number(document.getElementById("productPrice").value);

    const category =
        document.getElementById("productCategory").value;

    const image =
        document.getElementById("productImage").value.trim();

    const desc =
        document.getElementById("productDescription").value.trim();


    if (!name || !price) {

        showToast("نام و قیمت محصول را وارد کنید.");

        return;

    }


    const newProduct = {

        id: Date.now(),

        name: name,

        price: price,

        category: category,

        image: image || "assets/banner.jpg",

        desc: desc || "محصول جدید الف شاپ"

    };


    products.unshift(newProduct);

    saveProducts();

    renderProducts();

    renderAdminProducts();


    document.getElementById("productForm").reset();


    showToast("محصول با موفقیت اضافه شد ✅");

}


/* ================================
   حذف محصول
================================ */

function deleteProduct(id) {

    const product =
        products.find(p => p.id === id);


    if (!product) {
        return;
    }


    const answer =
        confirm(
            `آیا از حذف «${product.name}» مطمئن هستید؟`
        );


    if (!answer) {
        return;
    }


    products =
        products.filter(p => p.id !== id);


    saveProducts();

    renderProducts();

    renderAdminProducts();

    showToast("محصول حذف شد 🗑️");

}


/* ================================
   دسته‌بندی‌ها
================================ */

function setCategory(category) {

    selectedCategory = category;


    const select =
        document.getElementById("categoryFilter");


    select.value = category;


    renderProducts();


    document
        .getElementById("products")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* ================================
   رویدادها
================================ */

document.addEventListener("DOMContentLoaded", () => {


    renderProducts();

    updateCartCount();


    /* مدیریت */

    document
        .getElementById("adminButton")
        .addEventListener(
            "click",
            openAdmin
        );


    document
        .getElementById("loginButton")
        .addEventListener(
            "click",
            loginAdmin
        );


    document
        .getElementById("logoutButton")
        .addEventListener(
            "click",
            logoutAdmin
        );


    document
        .getElementById("adminPassword")
        .addEventListener("keydown", event => {

            if (event.key === "Enter") {

                loginAdmin();

            }

        });


    /* فرم محصول */

    document
        .getElementById("productForm")
        .addEventListener(
            "submit",
            addProduct
        );


    /* جستجو */

    document
        .getElementById("searchInput")
        .addEventListener(
            "input",
            renderProducts
        );


    /* فیلتر */

    document
        .getElementById("categoryFilter")
        .addEventListener(
            "change",
            renderProducts
        );


    /* دسته‌بندی */

    document
        .querySelectorAll(".category-card")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    setCategory(
                        button.dataset.category
                    );

                }
            );

        });


    /* سبد خرید */

    document
        .getElementById("cartButton")
        .addEventListener("click", () => {

            renderCart();

            openModal("cartModal");

        });


    /* ثبت سفارش */

    document
        .getElementById("checkoutButton")
        .addEventListener("click", () => {

            if (cart.length === 0) {

                showToast(
                    "سبد خرید شما خالی است."
                );

                return;

            }


            alert(
                "سفارش شما ثبت شد.\n\nبرای اتصال به درگاه پرداخت و ثبت سفارش واقعی باید بک‌اند و دیتابیس به سایت اضافه شود."
            );

        });


    /* بستن مودال */

    document
        .querySelectorAll("[data-close]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.dataset.close
                    );

                }
            );

        });


    /* کلیک بیرون مودال */

    document
        .querySelectorAll(".modal")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (event.target === modal) {

                        modal.classList.remove("show");

                    }

                }
            );

        });

});


/* ================================
   دسترسی توابع از HTML
================================ */

window.showProduct = showProduct;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.deleteProduct = deleteProduct;
window.closeModal = closeModal;
