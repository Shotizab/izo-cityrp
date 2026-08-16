/* =====================================================
   الف شاپ
   فروشگاه آنلاین لباس زنانه
   ===================================================== */


/* ================= SETTINGS ================= */

const ADMIN_PASSWORD = "fal";

const PRODUCTS_KEY = "alf_shop_products_v2";

const CART_KEY = "alf_shop_cart_v2";


/* ================= DEFAULT PRODUCTS ================= */

const defaultProducts = [

    {
        id: 1,
        name: "شومیز سفید زنانه",
        category: "شومیز",
        price: 890000,
        image: "assets/product1.jpg",
        description:
            "شومیز سفید زنانه با طراحی ساده و شیک."
    },

    {
        id: 2,
        name: "مانتو زنانه",
        category: "مانتو",
        price: 1290000,
        image: "assets/product2.jpg",
        description:
            "مانتو زنانه مناسب استایل روزمره."
    },

    {
        id: 3,
        name: "ست زنانه",
        category: "ست زنانه",
        price: 1490000,
        image: "assets/product3.jpg",
        description:
            "ست زنانه شیک و راحت برای استفاده روزمره."
    },

    {
        id: 4,
        name: "لباس زنانه",
        category: "لباس زنانه",
        price: 1190000,
        image: "assets/product4.jpg",
        description:
            "لباس زنانه با طراحی جدید و جذاب."
    },

    {
        id: 5,
        name: "کیف زنانه",
        category: "اکسسوری",
        price: 790000,
        image: "assets/product5.jpg",
        description:
            "کیف زنانه شیک برای تکمیل استایل."
    },

    {
        id: 6,
        name: "ست تابستانی",
        category: "ست زنانه",
        price: 1390000,
        image: "assets/product6.jpg",
        description:
            "ست تابستانی سبک و راحت."
    }

];


/* ================= LOAD DATA ================= */

let products =
    JSON.parse(
        localStorage.getItem(PRODUCTS_KEY)
    ) || defaultProducts;


let cart =
    JSON.parse(
        localStorage.getItem(CART_KEY)
    ) || [];


/* ================= ELEMENTS ================= */

const productGrid =
    document.getElementById("productGrid");

const emptyProducts =
    document.getElementById("emptyProducts");

const searchInput =
    document.getElementById("searchInput");

const sortProducts =
    document.getElementById("sortProducts");

const categories =
    document.querySelectorAll(".category");

const cartButton =
    document.getElementById("cartButton");

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

const cartCount =
    document.getElementById("cartCount");

const checkoutButton =
    document.getElementById("checkoutButton");

const adminButton =
    document.getElementById("adminButton");

const adminModal =
    document.getElementById("adminModal");

const closeAdmin =
    document.getElementById("closeAdmin");

const adminPassword =
    document.getElementById("adminPassword");

const loginAdmin =
    document.getElementById("loginAdmin");

const loginError =
    document.getElementById("loginError");

const adminLogin =
    document.getElementById("adminLogin");

const adminPanel =
    document.getElementById("adminPanel");

const logoutAdmin =
    document.getElementById("logoutAdmin");

const productName =
    document.getElementById("productName");

const productPrice =
    document.getElementById("productPrice");

const productCategory =
    document.getElementById("productCategory");

const productImage =
    document.getElementById("productImage");

const productDescription =
    document.getElementById("productDescription");

const addProductButton =
    document.getElementById("addProduct");

const adminProductList =
    document.getElementById("adminProductList");

const adminProductCount =
    document.getElementById("adminProductCount");

const toast =
    document.getElementById("toast");


/* ================= SAVE ================= */

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


/* ================= FORMAT PRICE ================= */

function formatPrice(number) {

    return new Intl.NumberFormat("fa-IR")
        .format(number) + " تومان";

}


/* ================= ESCAPE HTML ================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text ?? "";

    return div.innerHTML;

}


/* ================= PRODUCT IMAGE ================= */

function productImageHtml(product) {

    const safeImage =
        escapeHtml(product.image || "");

    const safeName =
        escapeHtml(product.name);

    return `
        <img
            src="${safeImage}"
            alt="${safeName}"
            onerror="
                this.style.display='none';
                this.parentElement.classList.add('image-error');
            "
        >
    `;

}


/* ================= RENDER PRODUCTS ================= */

function renderProducts() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedCategory =
        document.querySelector(
            ".category.active"
        )?.dataset.category || "همه";


    let list =
        products.filter(product => {

            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(search) ||

                product.description
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =
                selectedCategory === "همه" ||
                product.category === selectedCategory;


            return matchesSearch &&
                   matchesCategory;

        });


    /* ================= SORT ================= */

    const sort =
        sortProducts.value;


    if (sort === "cheap") {

        list.sort(
            (a, b) => a.price - b.price
        );

    }


    if (sort === "expensive") {

        list.sort(
            (a, b) => b.price - a.price
        );

    }


    if (sort === "newest") {

        list.sort(
            (a, b) => b.id - a.id
        );

    }


    /* ================= EMPTY ================= */

    if (list.length === 0) {

        productGrid.innerHTML = "";

        emptyProducts.style.display =
            "block";

        return;

    }


    emptyProducts.style.display =
        "none";


    /* ================= CARDS ================= */

    productGrid.innerHTML =
        list.map(product => {

            return `

                <article class="product-card">

                    <div class="product-image">

                        ${productImageHtml(product)}

                        <span class="product-category">
                            ${escapeHtml(product.category)}
                        </span>

                    </div>


                    <div class="product-body">

                        <h3>
                            ${escapeHtml(product.name)}
                        </h3>


                        <p class="product-description">
                            ${escapeHtml(product.description)}
                        </p>


                        <div class="product-bottom">

                            <strong class="product-price">
                                ${formatPrice(product.price)}
                            </strong>


                            <button
                                class="add-cart"
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

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(button.dataset.add);

                    addToCart(id);

                }
            );

        });

}


/* ================= CATEGORY ================= */

categories.forEach(category => {

    category.addEventListener(
        "click",
        () => {

            categories.forEach(item => {

                item.classList.remove("active");

            });


            category.classList.add("active");

            renderProducts();

        }
    );

});


/* ================= SEARCH ================= */

searchInput.addEventListener(
    "input",
    renderProducts
);


/* ================= SORT ================= */

sortProducts.addEventListener(
    "change",
    renderProducts
);


/* ================= CART ================= */

function addToCart(productId) {

    const product =
        products.find(
            p => p.id === productId
        );


    if (!product) return;


    const existing =
        cart.find(
            item => item.id === productId
        );


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            id: productId,

            quantity: 1

        });

    }


    saveCart();

    renderCart();

    showToast(
        "محصول به سبد خرید اضافه شد 💗"
    );

    openCart();

}


/* ================= RENDER CART ================= */

function renderCart() {

    if (cart.length === 0) {

        cartItems.innerHTML = "";

        cartEmpty.style.display =
            "flex";

        cartCount.textContent = "0";

        cartTotal.textContent =
            "۰ تومان";

        return;

    }


    cartEmpty.style.display =
        "none";


    let total = 0;

    let count = 0;


    cartItems.innerHTML =
        cart.map(item => {

            const product =
                products.find(
                    p => p.id === item.id
                );


            if (!product) return "";


            total +=
                product.price *
                item.quantity;


            count +=
                item.quantity;


            return `

                <div class="cart-item">

                    <img
                        class="cart-item-image"
                        src="${escapeHtml(product.image)}"
                        alt="${escapeHtml(product.name)}"
                    >


                    <div class="cart-item-info">

                        <h4>
                            ${escapeHtml(product.name)}
                        </h4>

                        <div class="cart-item-price">
                            ${formatPrice(product.price)}
                        </div>


                        <div class="cart-item-controls">

                            <button
                                class="qty-button"
                                data-minus="${product.id}"
                            >
                                −
                            </button>

                            <span>
                                ${item.quantity}
                            </span>

                            <button
                                class="qty-button"
                                data-plus="${product.id}"
                            >
                                +
                            </button>

                            <button
                                class="remove-item"
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
        count;


    cartTotal.textContent =
        formatPrice(total);


    document
        .querySelectorAll("[data-plus]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    changeQuantity(
                        Number(button.dataset.plus),
                        1
                    );

                }
            );

        });


    document
        .querySelectorAll("[data-minus]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    changeQuantity(
                        Number(button.dataset.minus),
                        -1
                    );

                }
            );

        });


    document
        .querySelectorAll("[data-remove]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    removeFromCart(
                        Number(button.dataset.remove)
                    );

                }
            );

        });

}


/* ================= QUANTITY ================= */

function changeQuantity(
    productId,
    amount
) {

    const item =
        cart.find(
            item => item.id === productId
        );


    if (!item) return;


    item.quantity += amount;


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                item => item.id !== productId
            );

    }


    saveCart();

    renderCart();

}


/* ================= REMOVE CART ================= */

function removeFromCart(productId) {

    cart =
        cart.filter(
            item => item.id !== productId
        );


    saveCart();

    renderCart();

}


/* ================= OPEN CART ================= */

function openCart() {

    cartPanel.classList.add("active");

    overlay.classList.add("active");

}


function closeCartPanel() {

    cartPanel.classList.remove("active");

    overlay.classList.remove("active");

}


cartButton.addEventListener(
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


/* ================= ADMIN ================= */

adminButton.addEventListener(
    "click",
    () => {

        adminModal.classList.add("active");

        adminPassword.focus();

    }
);


closeAdmin.addEventListener(
    "click",
    () => {

        adminModal.classList.remove(
            "active"
        );

    }
);


/* ================= LOGIN ================= */

function login() {

    if (
        adminPassword.value ===
        ADMIN_PASSWORD
    ) {

        adminLogin.classList.add(
            "hidden"
        );

        adminPanel.classList.remove(
            "hidden"
        );

        loginError.style.display =
            "none";

        adminPassword.value = "";

        renderAdminProducts();

    } else {

        loginError.style.display =
            "block";

    }

}


loginAdmin.addEventListener(
    "click",
    login
);


adminPassword.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            login();

        }

    }
);


/* ================= LOGOUT ================= */

logoutAdmin.addEventListener(
    "click",
    () => {

        adminPanel.classList.add(
            "hidden"
        );

        adminLogin.classList.remove(
            "hidden"
        );

    }
);


/* ================= ADD PRODUCT ================= */

addProductButton.addEventListener(
    "click",
    addProduct
);


function addProduct() {

    const name =
        productName.value.trim();

    const price =
        Number(productPrice.value);

    const category =
        productCategory.value;

    const image =
        productImage.value.trim() ||
        "assets/product1.jpg";

    const description =
        productDescription.value.trim() ||
        "محصول شیک و جدید الف شاپ";


    if (!name) {

        alert(
            "لطفاً نام محصول را وارد کن."
        );

        return;

    }


    if (!price || price <= 0) {

        alert(
            "لطفاً قیمت محصول را وارد کن."
        );

        return;

    }


    const newProduct = {

        id:
            Date.now(),

        name,

        category,

        price,

        image,

        description

    };


    products.unshift(
        newProduct
    );


    saveProducts();

    renderProducts();

    renderAdminProducts();


    productName.value = "";

    productPrice.value = "";

    productImage.value = "";

    productDescription.value = "";


    showToast(
        "محصول جدید اضافه شد ✅"
    );

}


/* ================= ADMIN PRODUCTS ================= */

function renderAdminProducts() {

    adminProductCount.textContent =
        `${products.length} محصول`;


    if (products.length === 0) {

        adminProductList.innerHTML = `
            <p>
                هنوز محصولی وجود ندارد.
            </p>
        `;

        return;

    }


    adminProductList.innerHTML =
        products.map(product => {

            return `

                <div class="admin-product">

                    <img
                        src="${escapeHtml(product.image)}"
                        alt="${escapeHtml(product.name)}"
                    >


                    <div class="admin-product-info">

                        <strong>
                            ${escapeHtml(product.name)}
                        </strong>

                        <span>
                            ${formatPrice(product.price)}
                        </span>

                    </div>


                    <button
                        class="delete-product"
                        data-delete="${product.id}"
                    >
                        🗑️ حذف
                    </button>

                </div>

            `;

        }).join("");


    document
        .querySelectorAll("[data-delete]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteProduct(
                        Number(
                            button.dataset.delete
                        )
                    );

                }
            );

        });

}


/* ================= DELETE PRODUCT ================= */

function deleteProduct(productId) {

    const product =
        products.find(
            p => p.id === productId
        );


    if (!product) return;


    const confirmed =
        confirm(
            `محصول «${product.name}» حذف شود؟`
        );


    if (!confirmed) return;


    products =
        products.filter(
            p => p.id !== productId
        );


    cart =
        cart.filter(
            item => item.id !== productId
        );


    saveProducts();

    saveCart();

    renderProducts();

    renderCart();

    renderAdminProducts();


    showToast(
        "محصول حذف شد 🗑️"
    );

}


/* ================= CHECKOUT ================= */

checkoutButton.addEventListener(
    "click",
    () => {

        if (cart.length === 0) {

            alert(
                "سبد خرید خالی است."
            );

            return;

        }


        alert(
            "سبد خرید شما آماده ثبت سفارش است 💗\n\nبرای اتصال به درگاه یا ثبت سفارش واقعی باید بخش سفارش و سرور به سایت اضافه شود."
        );

    }
);


/* ================= TOAST ================= */

let toastTimer;


function showToast(message) {

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* ================= START ================= */

renderProducts();

renderCart();
