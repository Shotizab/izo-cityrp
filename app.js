"use strict";

/* =========================
   SETTINGS
========================= */

const ADMIN_PASSWORD = "fal";

const PRODUCTS_KEY = "alf_shop_products";
const CART_KEY = "alf_shop_cart";


/* =========================
   DEFAULT PRODUCTS
========================= */

const defaultProducts = [
    {
        id: 1,
        name: "شومیز سفید زنانه",
        category: "شومیز",
        price: 890000,
        image: "",
        description: "شومیز سفید شیک و مناسب استفاده روزمره."
    },
    {
        id: 2,
        name: "مانتو زنانه",
        category: "مانتو",
        price: 1290000,
        image: "",
        description: "مانتو زنانه با طراحی ساده و شیک."
    },
    {
        id: 3,
        name: "ست زنانه",
        category: "ست زنانه",
        price: 1490000,
        image: "",
        description: "ست زنانه راحت و مناسب استایل روزانه."
    },
    {
        id: 4,
        name: "لباس زنانه",
        category: "لباس زنانه",
        price: 1190000,
        image: "",
        description: "لباس زنانه با طراحی جدید."
    }
];


/* =========================
   LOAD DATA
========================= */

function loadProducts() {
    try {
        const saved = localStorage.getItem(PRODUCTS_KEY);

        if (!saved) {
            return [...defaultProducts];
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [...defaultProducts];
        }

        return parsed;

    } catch (error) {
        console.error("Products load error:", error);
        return [...defaultProducts];
    }
}


function loadCart() {
    try {
        const saved = localStorage.getItem(CART_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed) ? parsed : [];

    } catch (error) {
        console.error("Cart load error:", error);
        return [];
    }
}


let products = loadProducts();
let cart = loadCart();


/* =========================
   SAVE
========================= */

function saveProducts() {
    localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(products)
    );
}


function saveCart() {
    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );
}


/* =========================
   DOM
========================= */

const productsGrid =
    document.getElementById("productsGrid");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const sortSelect =
    document.getElementById("sortSelect");

const categoryButtons =
    document.querySelectorAll(".category");

const productsBtn =
    document.getElementById("productsBtn");

const cartBtn =
    document.getElementById("cartBtn");

const cartCount =
    document.getElementById("cartCount");

const cartPanel =
    document.getElementById("cartPanel");

const overlay =
    document.getElementById("overlay");

const closeCart =
    document.getElementById("closeCart");

const cartItems =
    document.getElementById("cartItems");

const cartEmpty =
    document.getElementById("cartEmpty");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutBtn =
    document.getElementById("checkoutBtn");

const adminBtn =
    document.getElementById("adminBtn");

const adminModal =
    document.getElementById("adminModal");

const closeAdmin =
    document.getElementById("closeAdmin");

const loginBox =
    document.getElementById("loginBox");

const adminPanel =
    document.getElementById("adminPanel");

const adminPassword =
    document.getElementById("adminPassword");

const loginBtn =
    document.getElementById("loginBtn");

const loginError =
    document.getElementById("loginError");

const logoutBtn =
    document.getElementById("logoutBtn");

const pName =
    document.getElementById("pName");

const pPrice =
    document.getElementById("pPrice");

const pCategory =
    document.getElementById("pCategory");

const pImage =
    document.getElementById("pImage");

const pDescription =
    document.getElementById("pDescription");

const addProductBtn =
    document.getElementById("addProductBtn");

const adminProducts =
    document.getElementById("adminProducts");

const adminCount =
    document.getElementById("adminCount");

const toast =
    document.getElementById("toast");


/* =========================
   FORMAT
========================= */

function money(value) {
    return new Intl.NumberFormat("fa-IR").format(value) + " تومان";
}


function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = String(value ?? "");

    return div.innerHTML;
}


/* =========================
   PRODUCT IMAGE
========================= */

function imageHTML(product) {

    if (!product.image) {
        return `
            <div class="image-placeholder">
                👗
            </div>
        `;
    }

    return `
        <img
            src="${escapeHTML(product.image)}"
            alt="${escapeHTML(product.name)}"
            onerror="this.outerHTML='<div class=&quot;image-placeholder&quot;>👗</div>'"
        >
    `;
}


/* =========================
   RENDER PRODUCTS
========================= */

function renderProducts() {

    const search =
        searchInput.value.trim().toLowerCase();

    const activeCategory =
        document.querySelector(".category.active");

    const category =
        activeCategory
            ? activeCategory.dataset.category
            : "همه";


    let list = products.filter(product => {

        const name =
            String(product.name).toLowerCase();

        const description =
            String(product.description).toLowerCase();

        const matchesSearch =
            name.includes(search) ||
            description.includes(search);

        const matchesCategory =
            category === "همه" ||
            product.category === category;

        return matchesSearch && matchesCategory;
    });


    /* SORT */

    if (sortSelect.value === "cheap") {

        list.sort((a,b) => a.price - b.price);

    } else if (sortSelect.value === "expensive") {

        list.sort((a,b) => b.price - a.price);

    } else if (sortSelect.value === "newest") {

        list.sort((a,b) => b.id - a.id);
    }


    if (list.length === 0) {

        productsGrid.innerHTML = "";

        emptyState.classList.remove("hidden");

        return;
    }


    emptyState.classList.add("hidden");


    productsGrid.innerHTML =
        list.map(product => {

            return `
                <article class="product-card">

                    <div class="product-image">

                        ${imageHTML(product)}

                        <span class="product-category">
                            ${escapeHTML(product.category)}
                        </span>

                    </div>


                    <div class="product-info">

                        <h3>
                            ${escapeHTML(product.name)}
                        </h3>

                        <p class="description">
                            ${escapeHTML(product.description)}
                        </p>


                        <div class="product-bottom">

                            <strong class="price">
                                ${money(product.price)}
                            </strong>

                            <button
                                class="add-btn"
                                data-add="${product.id}"
                            >
                                🛒 افزودن
                            </button>

                        </div>

                    </div>

                </article>
            `;

        }).join("");


    document
        .querySelectorAll("[data-add]")
        .forEach(button => {

            button.addEventListener("click", () => {

                addToCart(
                    Number(button.dataset.add)
                );

            });

        });
}


/* =========================
   CATEGORY
========================= */

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        categoryButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        renderProducts();

    });

});


/* =========================
   SEARCH / SORT
========================= */

searchInput.addEventListener(
    "input",
    renderProducts
);

sortSelect.addEventListener(
    "change",
    renderProducts
);


/* =========================
   PRODUCTS BUTTON
========================= */

productsBtn.addEventListener("click", () => {

    document
        .getElementById("products")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

});


/* =========================
   CART
========================= */

function addToCart(id) {

    const product =
        products.find(p => p.id === id);

    if (!product) {
        return;
    }


    const item =
        cart.find(item => item.id === id);


    if (item) {
        item.quantity += 1;
    } else {
        cart.push({
            id: id,
            quantity: 1
        });
    }


    saveCart();

    renderCart();

    showToast("محصول به سبد اضافه شد 💗");

}


function renderCart() {

    if (cart.length === 0) {

        cartItems.innerHTML = "";

        cartEmpty.style.display = "flex";

        cartCount.textContent = "0";

        cartTotal.textContent = "۰ تومان";

        return;
    }


    cartEmpty.style.display = "none";


    let total = 0;
    let count = 0;


    cartItems.innerHTML =
        cart.map(item => {

            const product =
                products.find(
                    p => p.id === item.id
                );


            if (!product) {
                return "";
            }


            total +=
                product.price * item.quantity;

            count += item.quantity;


            return `
                <div class="cart-item">

                    ${
                        product.image
                        ?
                        `<img
                            src="${escapeHTML(product.image)}"
                            alt="${escapeHTML(product.name)}"
                        >`
                        :
                        `<div class="image-placeholder">
                            👗
                        </div>`
                    }


                    <div class="cart-item-info">

                        <b>
                            ${escapeHTML(product.name)}
                        </b>

                        <span class="cart-item-price">
                            ${money(product.price)}
                        </span>


                        <div class="qty">

                            <button
                                data-plus="${product.id}"
                            >
                                +
                            </button>

                            <span>
                                ${item.quantity}
                            </span>

                            <button
                                data-minus="${product.id}"
                            >
                                -
                            </button>

                            <button
                                class="remove"
                                data-remove="${product.id}"
                            >
                                حذف
                            </button>

                        </div>

                    </div>

                </div>
            `;

        }).join("");


    cartCount.textContent =
        String(count);


    cartTotal.textContent =
        money(total);


    document
        .querySelectorAll("[data-plus]")
        .forEach(button => {

            button.addEventListener("click", () => {

                changeQuantity(
                    Number(button.dataset.plus),
                    1
                );

            });

        });


    document
        .querySelectorAll("[data-minus]")
        .forEach(button => {

            button.addEventListener("click", () => {

                changeQuantity(
                    Number(button.dataset.minus),
                    -1
                );

            });

        });


    document
        .querySelectorAll("[data-remove]")
        .forEach(button => {

            button.addEventListener("click", () => {

                removeFromCart(
                    Number(button.dataset.remove)
                );

            });

        });

}


function changeQuantity(id, amount) {

    const item =
        cart.find(item => item.id === id);

    if (!item) {
        return;
    }


    item.quantity += amount;


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                item => item.id !== id
            );

    }


    saveCart();

    renderCart();
}


function removeFromCart(id) {

    cart =
        cart.filter(
            item => item.id !== id
        );

    saveCart();

    renderCart();
}


/* =========================
   OPEN / CLOSE CART
========================= */

function openCart() {

    cartPanel.classList.add("active");

    overlay.classList.add("active");

}


function closeCartPanel() {

    cartPanel.classList.remove("active");

    overlay.classList.remove("active");

}


cartBtn.addEventListener(
    "click",
    openCart
);

closeCart.addEventListener(
    "click",
    closeCartPanel
);

overlay.addEventListener(
    "click",
    closeCartPanel
);


/* =========================
   ADMIN OPEN
========================= */

adminBtn.addEventListener("click", () => {

    adminModal.classList.add("active");

    loginBox.classList.remove("hidden");

    adminPanel.classList.add("hidden");

    loginError.style.display = "none";

    adminPassword.value = "";

});


closeAdmin.addEventListener("click", () => {

    adminModal.classList.remove("active");

});


/* =========================
   LOGIN
========================= */

function loginAdmin() {

    if (adminPassword.value === ADMIN_PASSWORD) {

        loginBox.classList.add("hidden");

        adminPanel.classList.remove("hidden");

        loginError.style.display = "none";

        renderAdminProducts();

    } else {

        loginError.style.display = "block";

    }

}


loginBtn.addEventListener(
    "click",
    loginAdmin
);


adminPassword.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            loginAdmin();
        }

    }
);


/* =========================
   LOGOUT
========================= */

logoutBtn.addEventListener("click", () => {

    adminPanel.classList.add("hidden");

    loginBox.classList.remove("hidden");

    adminPassword.value = "";

});


/* =========================
   ADD PRODUCT
========================= */

addProductBtn.addEventListener(
    "click",
    addProduct
);


function addProduct() {

    const name =
        pName.value.trim();

    const price =
        Number(pPrice.value);

    const category =
        pCategory.value;

    const image =
        pImage.value.trim();

    const description =
        pDescription.value.trim();


    if (!name) {
        alert("نام محصول را وارد کن.");
        return;
    }


    if (!price || price <= 0) {
        alert("قیمت محصول را وارد کن.");
        return;
    }


    const product = {

        id: Date.now(),

        name: name,

        price: price,

        category: category,

        image: image,

        description:
            description ||
            "محصول جدید الف شاپ"

    };


    products.unshift(product);

    saveProducts();

    renderProducts();

    renderAdminProducts();


    pName.value = "";
    pPrice.value = "";
    pImage.value = "";
    pDescription.value = "";


    showToast("محصول با موفقیت اضافه شد ✅");

}


/* =========================
   ADMIN PRODUCTS
========================= */

function renderAdminProducts() {

    adminCount.textContent =
        products.length;


    if (products.length === 0) {

        adminProducts.innerHTML =
            "<p>محصولی وجود ندارد.</p>";

        return;
    }


    adminProducts.innerHTML =
        products.map(product => {

            return `
                <div class="admin-product">

                    ${
                        product.image
                        ?
                        `<img
                            src="${escapeHTML(product.image)}"
                            alt=""
                        >`
                        :
                        `<div class="image-placeholder">
                            👗
                        </div>`
                    }


                    <div class="admin-product-info">

                        <b>
                            ${escapeHTML(product.name)}
                        </b>

                        <span>
                            ${money(product.price)}
                        </span>

                    </div>


                    <button
                        class="delete-btn"
                        data-delete="${product.id}"
                    >
                        🗑️
                    </button>

                </div>
            `;

        }).join("");


    document
        .querySelectorAll("[data-delete]")
        .forEach(button => {

            button.addEventListener("click", () => {

                deleteProduct(
                    Number(button.dataset.delete)
                );

            });

        });

}


/* =========================
   DELETE PRODUCT
========================= */

function deleteProduct(id) {

    const product =
        products.find(p => p.id === id);

    if (!product) {
        return;
    }


    const yes =
        confirm(
            "محصول «" +
            product.name +
            "» حذف شود؟"
        );


    if (!yes) {
        return;
    }


    products =
        products.filter(
            p => p.id !== id
        );


    cart =
        cart.filter(
            item => item.id !== id
        );


    saveProducts();

    saveCart();

    renderProducts();

    renderCart();

    renderAdminProducts();

    showToast("محصول حذف شد 🗑️");

}


/* =========================
   CHECKOUT
========================= */

checkoutBtn.addEventListener(
    "click",
    () => {

        if (cart.length === 0) {

            alert(
                "سبد خرید خالی است."
            );

            return;
        }


        alert(
            "سبد خرید آماده ثبت سفارش است."
        );

    }
);


/* =========================
   TOAST
========================= */

let toastTimer;

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2200);

}


/* =========================
   START
========================= */

renderProducts();

renderCart();
