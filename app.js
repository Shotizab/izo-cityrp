"use strict";

/* =========================
   SETTINGS
========================= */

const ADMIN_PASSWORD = "fal";

const PRODUCTS_KEY = "alf_shop_products_v3";
const CART_KEY = "alf_shop_cart_v3";


/* =========================
   DEFAULT PRODUCTS
========================= */

const defaultProducts = [

  {
    id: 1,
    name: "شومیز سفید زنانه",
    price: 890000,
    category: "شومیز",
    image: "",
    description: "شومیز سفید شیک و مناسب استفاده روزمره."
  },

  {
    id: 2,
    name: "مانتو زنانه",
    price: 1290000,
    category: "مانتو",
    image: "",
    description: "مانتو زنانه با طراحی ساده و شیک."
  },

  {
    id: 3,
    name: "ست زنانه",
    price: 1490000,
    category: "ست زنانه",
    image: "",
    description: "ست زنانه راحت و مناسب استایل روزانه."
  },

  {
    id: 4,
    name: "لباس زنانه",
    price: 1190000,
    category: "لباس زنانه",
    image: "",
    description: "لباس زنانه با طراحی جدید."
  },

  {
    id: 5,
    name: "کیف زنانه",
    price: 790000,
    category: "اکسسوری",
    image: "",
    description: "کیف زنانه مناسب استایل روزمره."
  }

];


/* =========================
   LOAD
========================= */

function loadData(key, fallback) {

  try {

    const data = localStorage.getItem(key);

    if (!data) {
      return fallback;
    }

    const parsed = JSON.parse(data);

    return parsed;

  } catch (error) {

    console.error(error);

    return fallback;

  }

}


let products =
  loadData(
    PRODUCTS_KEY,
    [...defaultProducts]
  );


let cart =
  loadData(
    CART_KEY,
    []
  );


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
   ELEMENTS
========================= */

const productsGrid =
  document.getElementById("productsGrid");

const emptyProducts =
  document.getElementById("emptyProducts");

const searchInput =
  document.getElementById("searchInput");

const sortSelect =
  document.getElementById("sortSelect");

const categories =
  document.querySelectorAll(".category");

const showProducts =
  document.getElementById("showProducts");


/* CART */

const cartButton =
  document.getElementById("cartButton");

const cartCount =
  document.getElementById("cartCount");

const cartPanel =
  document.getElementById("cartPanel");

const cartItems =
  document.getElementById("cartItems");

const emptyCart =
  document.getElementById("emptyCart");

const cartTotal =
  document.getElementById("cartTotal");

const closeCart =
  document.getElementById("closeCart");

const checkoutButton =
  document.getElementById("checkoutButton");

const overlay =
  document.getElementById("overlay");


/* ADMIN */

const adminButton =
  document.getElementById("adminButton");

const adminModal =
  document.getElementById("adminModal");

const closeAdmin =
  document.getElementById("closeAdmin");

const adminLogin =
  document.getElementById("adminLogin");

const adminDashboard =
  document.getElementById("adminDashboard");

const adminPassword =
  document.getElementById("adminPassword");

const loginButton =
  document.getElementById("loginButton");

const loginError =
  document.getElementById("loginError");

const logoutButton =
  document.getElementById("logoutButton");

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

const addProduct =
  document.getElementById("addProduct");

const adminProducts =
  document.getElementById("adminProducts");

const productNumber =
  document.getElementById("productNumber");

const toast =
  document.getElementById("toast");


/* =========================
   HELPERS
========================= */

function formatPrice(price) {

  return new Intl.NumberFormat("fa-IR")
    .format(Number(price)) + " تومان";

}


function escapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent =
    String(value ?? "");

  return div.innerHTML;

}


function showToast(message) {

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer =
    setTimeout(() => {

      toast.classList.remove("show");

    }, 2200);

}


/* =========================
   IMAGE
========================= */

function productImageHTML(product) {

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
      onerror="this.style.display='none';"
    >
  `;

}


/* =========================
   PRODUCTS
========================= */

function renderProducts() {

  const search =
    searchInput.value
      .trim()
      .toLowerCase();


  const activeCategory =
    document.querySelector(
      ".category.active"
    );


  const selectedCategory =
    activeCategory
      ? activeCategory.dataset.category
      : "همه";


  let result =
    products.filter(product => {

      const name =
        String(product.name)
          .toLowerCase();

      const description =
        String(product.description)
          .toLowerCase();


      const matchesSearch =
        !search ||
        name.includes(search) ||
        description.includes(search);


      const matchesCategory =
        selectedCategory === "همه" ||
        product.category === selectedCategory;


      return (
        matchesSearch &&
        matchesCategory
      );

    });


  /* SORT */

  if (sortSelect.value === "cheap") {

    result.sort(
      (a, b) => a.price - b.price
    );

  }

  else if (sortSelect.value === "expensive") {

    result.sort(
      (a, b) => b.price - a.price
    );

  }

  else if (sortSelect.value === "newest") {

    result.sort(
      (a, b) => b.id - a.id
    );

  }


  if (result.length === 0) {

    productsGrid.innerHTML = "";

    emptyProducts.classList.remove("hidden");

    return;

  }


  emptyProducts.classList.add("hidden");


  productsGrid.innerHTML =
    result.map(product => {

      return `

        <article class="product-card">

          <div class="product-image">

            ${productImageHTML(product)}

            <span class="product-category">
              ${escapeHTML(product.category)}
            </span>

          </div>


          <div class="product-content">

            <h3>
              ${escapeHTML(product.name)}
            </h3>

            <p class="product-description">
              ${escapeHTML(product.description)}
            </p>


            <div class="product-bottom">

              <strong class="product-price">
                ${formatPrice(product.price)}
              </strong>

              <button
                class="add-to-cart"
                data-add-cart="${product.id}"
              >
                🛒 افزودن
              </button>

            </div>

          </div>

        </article>

      `;

    }).join("");


  document
    .querySelectorAll("[data-add-cart]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            Number(
              button.dataset.addCart
            );

          addToCart(id);

        }
      );

    });

}


/* =========================
   CATEGORY
========================= */

categories.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      categories.forEach(item => {

        item.classList.remove(
          "active"
        );

      });


      button.classList.add("active");

      renderProducts();

    }
  );

});


/* =========================
   SEARCH
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
   SHOW PRODUCTS
========================= */

showProducts.addEventListener(
  "click",
  () => {

    document
      .getElementById("products")
      .scrollIntoView({
        behavior: "smooth"
      });

  }
);


/* =========================
   CART
========================= */

function addToCart(id) {

  const product =
    products.find(
      item => item.id === id
    );


  if (!product) {
    return;
  }


  const existing =
    cart.find(
      item => item.id === id
    );


  if (existing) {

    existing.quantity++;

  }

  else {

    cart.push({
      id: id,
      quantity: 1
    });

  }


  saveCart();

  renderCart();

  showToast(
    "محصول به سبد خرید اضافه شد 💗"
  );

}


function renderCart() {

  let total = 0;
  let count = 0;


  if (cart.length === 0) {

    cartItems.innerHTML = "";

    emptyCart.style.display =
      "flex";

    cartCount.textContent =
      "0";

    cartTotal.textContent =
      "۰ تومان";

    return;

  }


  emptyCart.style.display =
    "none";


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
        product.price *
        item.quantity;


      count +=
        item.quantity;


      return `

        <div class="cart-item">

          <div class="cart-item-image">

            ${
              product.image
              ?
              `<img
                src="${escapeHTML(product.image)}"
                alt=""
              >`
              :
              "👗"
            }

          </div>


          <div class="cart-item-info">

            <strong>
              ${escapeHTML(product.name)}
            </strong>

            <span class="cart-item-price">
              ${formatPrice(product.price)}
            </span>


            <div class="quantity">

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
    String(count);


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


function changeQuantity(id, amount) {

  const item =
    cart.find(
      product => product.id === id
    );


  if (!item) {
    return;
  }


  item.quantity += amount;


  if (item.quantity <= 0) {

    cart =
      cart.filter(
        product => product.id !== id
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

  showToast(
    "محصول از سبد حذف شد"
  );

}


/* =========================
   CART OPEN
========================= */

function openCart() {

  cartPanel.classList.add("show");

  overlay.classList.add("show");

}


function closeCartPanel() {

  cartPanel.classList.remove("show");

  overlay.classList.remove("show");

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


/* =========================
   ADMIN
========================= */

function openAdmin() {

  adminModal.classList.add("show");

  adminLogin.classList.remove("hidden");

  adminDashboard.classList.add("hidden");

  loginError.classList.remove("show");

  adminPassword.value = "";

}


adminButton.addEventListener(
  "click",
  openAdmin
);


closeAdmin.addEventListener(
  "click",
  () => {

    adminModal.classList.remove(
      "show"
    );

  }
);


/* =========================
   LOGIN
========================= */

function login() {

  const password =
    adminPassword.value;


  if (password === ADMIN_PASSWORD) {

    adminLogin.classList.add(
      "hidden"
    );

    adminDashboard.classList.remove(
      "hidden"
    );

    loginError.classList.remove(
      "show"
    );

    renderAdminProducts();

  }

  else {

    loginError.classList.add(
      "show"
    );

  }

}


loginButton.addEventListener(
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


/* =========================
   LOGOUT
========================= */

logoutButton.addEventListener(
  "click",
  () => {

    adminDashboard.classList.add(
      "hidden"
    );

    adminLogin.classList.remove(
      "hidden"
    );

    adminPassword.value = "";

  }
);


/* =========================
   ADD PRODUCT
========================= */

addProduct.addEventListener(
  "click",
  createProduct
);


function createProduct() {

  const name =
    productName.value.trim();

  const price =
    Number(productPrice.value);

  const category =
    productCategory.value;

  const image =
    productImage.value.trim();

  const description =
    productDescription.value.trim();


  if (!name) {

    alert(
      "نام محصول را وارد کن."
    );

    productName.focus();

    return;

  }


  if (!price || price <= 0) {

    alert(
      "قیمت محصول را وارد کن."
    );

    productPrice.focus();

    return;

  }


  const newProduct = {

    id: Date.now(),

    name: name,

    price: price,

    category: category,

    image: image,

    description:
      description ||
      "محصول جدید الف شاپ"

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
    "محصول با موفقیت اضافه شد ✅"
  );

}


/* =========================
   ADMIN PRODUCTS
========================= */

function renderAdminProducts() {

  productNumber.textContent =
    products.length;


  if (products.length === 0) {

    adminProducts.innerHTML =
      `
        <p style="font-size:11px;color:#917d86">
          هنوز محصولی اضافه نشده است.
        </p>
      `;

    return;

  }


  adminProducts.innerHTML =
    products.map(product => {

      return `

        <div class="admin-product">

          <div class="admin-product-image">

            ${
              product.image
              ?
              `<img
                src="${escapeHTML(product.image)}"
                alt=""
              >`
              :
              "👗"
            }

          </div>


          <div class="admin-product-info">

            <strong>
              ${escapeHTML(product.name)}
            </strong>

            <span>
              ${formatPrice(product.price)}
            </span>

          </div>


          <button
            class="delete-product"
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

      button.addEventListener(
        "click",
        () => {

          deleteProduct(
            Number(button.dataset.delete)
          );

        }
      );

    });

}


/* =========================
   DELETE
========================= */

function deleteProduct(id) {

  const product =
    products.find(
      item => item.id === id
    );


  if (!product) {
    return;
  }


  const confirmed =
    confirm(
      `محصول «${product.name}» حذف شود؟`
    );


  if (!confirmed) {
    return;
  }


  products =
    products.filter(
      item => item.id !== id
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


  showToast(
    "محصول حذف شد 🗑️"
  );

}


/* =========================
   CHECKOUT
========================= */

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
      "سبد خرید آماده ثبت سفارش است. 💗"
    );

  }
);


/* =========================
   ESC KEY
========================= */

document.addEventListener(
  "keydown",
  event => {

    if (event.key !== "Escape") {
      return;
    }


    closeCartPanel();

    adminModal.classList.remove(
      "show"
    );

  }
);


/* =========================
   START
========================= */

renderProducts();

renderCart();
