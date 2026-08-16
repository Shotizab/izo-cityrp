"use strict";

/* ==========================================
   الف شاپ - سیستم اصلی
========================================== */

const ADMIN_PASSWORD = "fal";

const PRODUCTS_KEY = "alf_shop_products_final";
const CART_KEY = "alf_shop_cart_final";


/* ==========================================
   محصولات اولیه
========================================== */

const DEFAULT_PRODUCTS = [
  {
    id: 1001,
    name: "شومیز سفید زنانه",
    price: 890000,
    category: "شومیز",
    image: "",
    description: "شومیز سفید زنانه شیک و مناسب استفاده روزمره."
  },

  {
    id: 1002,
    name: "مانتو زنانه",
    price: 1290000,
    category: "مانتو",
    image: "",
    description: "مانتو زنانه شیک با طراحی ساده و جذاب."
  },

  {
    id: 1003,
    name: "ست زنانه",
    price: 1490000,
    category: "ست زنانه",
    image: "",
    description: "ست زنانه راحت و مناسب استایل روزانه."
  },

  {
    id: 1004,
    name: "لباس زنانه",
    price: 1190000,
    category: "لباس زنانه",
    image: "",
    description: "لباس زنانه با طراحی جدید و زیبا."
  }
];


/* ==========================================
   خواندن اطلاعات
========================================== */

function readStorage(key, fallback) {

  try {

    const saved =
      localStorage.getItem(key);

    if (saved === null) {
      return fallback;
    }

    const data =
      JSON.parse(saved);

    return data;

  } catch (error) {

    console.error(
      "Storage error:",
      error
    );

    return fallback;

  }

}


let products =
  readStorage(
    PRODUCTS_KEY,
    [...DEFAULT_PRODUCTS]
  );


let cart =
  readStorage(
    CART_KEY,
    []
  );


/* ==========================================
   ذخیره دائمی
========================================== */

function saveProducts() {

  try {

    localStorage.setItem(
      PRODUCTS_KEY,
      JSON.stringify(products)
    );

  } catch (error) {

    console.error(error);

    showToast(
      "ذخیره اطلاعات انجام نشد!"
    );

  }

}


function saveCart() {

  try {

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );

  } catch (error) {

    console.error(error);

  }

}


/* ==========================================
   گرفتن عناصر
========================================== */

const $ = id =>
  document.getElementById(id);


const productsGrid =
  $("productsGrid");

const emptyProducts =
  $("emptyProducts");

const searchInput =
  $("searchInput");

const sortSelect =
  $("sortSelect");


const cartButton =
  $("cartButton");

const cartCount =
  $("cartCount");

const cartPanel =
  $("cartPanel");

const closeCart =
  $("closeCart");

const cartItems =
  $("cartItems");

const emptyCart =
  $("emptyCart");

const cartTotal =
  $("cartTotal");

const checkoutButton =
  $("checkoutButton");

const overlay =
  $("overlay");


const adminButton =
  $("adminButton");

const adminModal =
  $("adminModal");

const closeAdmin =
  $("closeAdmin");

const adminLogin =
  $("adminLogin");

const adminDashboard =
  $("adminDashboard");

const adminPassword =
  $("adminPassword");

const loginButton =
  $("loginButton");

const loginError =
  $("loginError");

const logoutButton =
  $("logoutButton");


const productName =
  $("productName");

const productPrice =
  $("productPrice");

const productCategory =
  $("productCategory");

const productImage =
  $("productImage");

const productDescription =
  $("productDescription");

const addProduct =
  $("addProduct");

const adminProducts =
  $("adminProducts");

const productNumber =
  $("productNumber");

const toast =
  $("toast");


/* ==========================================
   قیمت
========================================== */

function price(value) {

  return (
    new Intl.NumberFormat("fa-IR")
      .format(Number(value))
    + " تومان"
  );

}


/* ==========================================
   امنیت نمایش متن
========================================== */

function safe(text) {

  const div =
    document.createElement("div");

  div.textContent =
    String(text ?? "");

  return div.innerHTML;

}


/* ==========================================
   پیام
========================================== */

function showToast(message) {

  toast.textContent =
    message;

  toast.classList.add("show");

  clearTimeout(
    showToast.timer
  );

  showToast.timer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 2200);

}


/* ==========================================
   تصویر محصول
========================================== */

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
      src="${safe(product.image)}"
      alt="${safe(product.name)}"
      onerror="this.parentElement.innerHTML='<div class=&quot;image-placeholder&quot;>👗</div>';"
    >
  `;

}


/* ==========================================
   نمایش محصولات
========================================== */

function renderProducts() {

  const search =
    searchInput
      .value
      .trim()
      .toLowerCase();


  const active =
    document.querySelector(
      ".category.active"
    );


  const category =
    active
      ? active.dataset.category
      : "همه";


  let result =
    products.filter(product => {

      const name =
        String(product.name)
          .toLowerCase();

      const description =
        String(product.description)
          .toLowerCase();


      const searchOK =
        !search ||
        name.includes(search) ||
        description.includes(search);


      const categoryOK =
        category === "همه" ||
        product.category === category;


      return (
        searchOK &&
        categoryOK
      );

    });


  if (sortSelect.value === "cheap") {

    result.sort(
      (a,b) => a.price - b.price
    );

  }

  if (sortSelect.value === "expensive") {

    result.sort(
      (a,b) => b.price - a.price
    );

  }

  if (sortSelect.value === "newest") {

    result.sort(
      (a,b) => b.id - a.id
    );

  }


  if (!result.length) {

    productsGrid.innerHTML = "";

    emptyProducts.classList.remove(
      "hidden"
    );

    return;

  }


  emptyProducts.classList.add(
    "hidden"
  );


  productsGrid.innerHTML =
    result.map(product => `

      <article class="product-card">

        <div class="product-image">

          ${imageHTML(product)}

          <span class="product-category">
            ${safe(product.category)}
          </span>

        </div>

        <div class="product-content">

          <h3>
            ${safe(product.name)}
          </h3>

          <p class="product-description">
            ${safe(product.description)}
          </p>

          <div class="product-bottom">

            <strong class="product-price">
              ${price(product.price)}
            </strong>

            <button
              class="add-to-cart"
              data-add="${product.id}"
            >
              🛒 افزودن
            </button>

          </div>

        </div>

      </article>

    `).join("");


  document
    .querySelectorAll("[data-add]")
    .forEach(button => {

      button.onclick = () => {

        addToCart(
          Number(button.dataset.add)
        );

      };

    });

}


/* ==========================================
   دسته‌بندی
========================================== */

document
  .querySelectorAll(".category")
  .forEach(button => {

    button.onclick = () => {

      document
        .querySelectorAll(".category")
        .forEach(item => {

          item.classList.remove(
            "active"
          );

        });


      button.classList.add(
        "active"
      );


      renderProducts();

    };

  });


/* ==========================================
   جستجو
========================================== */

searchInput.oninput =
  renderProducts;


sortSelect.onchange =
  renderProducts;


/* ==========================================
   رفتن به محصولات
========================================== */

$("showProducts").onclick = () => {

  $("products").scrollIntoView({
    behavior: "smooth"
  });

};


/* ==========================================
   سبد خرید
========================================== */

function addToCart(id) {

  const product =
    products.find(
      item => item.id === id
    );


  if (!product) {
    return;
  }


  const item =
    cart.find(
      item => item.id === id
    );


  if (item) {

    item.quantity++;

  } else {

    cart.push({
      id: id,
      quantity: 1
    });

  }


  saveCart();

  renderCart();

  showToast(
    "محصول به سبد اضافه شد 💗"
  );

}


function renderCart() {

  if (!cart.length) {

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
                src="${safe(product.image)}"
                alt=""
              >`
              :
              "👗"
            }

          </div>

          <div class="cart-item-info">

            <strong>
              ${safe(product.name)}
            </strong>

            <span class="cart-item-price">
              ${price(product.price)}
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
    price(total);


  document
    .querySelectorAll("[data-plus]")
    .forEach(button => {

      button.onclick = () => {

        changeQuantity(
          Number(button.dataset.plus),
          1
        );

      };

    });


  document
    .querySelectorAll("[data-minus]")
    .forEach(button => {

      button.onclick = () => {

        changeQuantity(
          Number(button.dataset.minus),
          -1
        );

      };

    });


  document
    .querySelectorAll("[data-remove]")
    .forEach(button => {

      button.onclick = () => {

        removeCart(
          Number(button.dataset.remove)
        );

      };

    });

}


function changeQuantity(id, amount) {

  const item =
    cart.find(
      item => item.id === id
    );


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


function removeCart(id) {

  cart =
    cart.filter(
      item => item.id !== id
    );


  saveCart();

  renderCart();

  showToast(
    "محصول حذف شد"
  );

}


/* ==========================================
   باز کردن سبد
========================================== */

cartButton.onclick = () => {

  cartPanel.classList.add("show");

  overlay.classList.add("show");

};


function closeCartPanel() {

  cartPanel.classList.remove(
    "show"
  );

  overlay.classList.remove(
    "show"
  );

}


closeCart.onclick =
  closeCartPanel;


overlay.onclick =
  closeCartPanel;


/* ==========================================
   پنل مدیریت
========================================== */

adminButton.onclick = () => {

  adminModal.classList.add(
    "show"
  );

  adminLogin.classList.remove(
    "hidden"
  );

  adminDashboard.classList.add(
    "hidden"
  );

  loginError.classList.remove(
    "show"
  );

  adminPassword.value = "";

};


closeAdmin.onclick = () => {

  adminModal.classList.remove(
    "show"
  );

};


/* ==========================================
   ورود مدیریت
========================================== */

function loginAdmin() {

  if (
    adminPassword.value ===
    ADMIN_PASSWORD
  ) {

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

  } else {

    loginError.classList.add(
      "show"
    );

  }

}


loginButton.onclick =
  loginAdmin;


adminPassword.onkeydown =
  event => {

    if (
      event.key === "Enter"
    ) {

      loginAdmin();

    }

  };


/* ==========================================
   خروج
========================================== */

logoutButton.onclick = () => {

  adminDashboard.classList.add(
    "hidden"
  );

  adminLogin.classList.remove(
    "hidden"
  );

  adminPassword.value = "";

};


/* ==========================================
   افزودن محصول
========================================== */

addProduct.onclick =
  createProduct;


function createProduct() {

  const name =
    productName.value.trim();

  const priceValue =
    Number(productPrice.value);

  const category =
    productCategory.value;

  const image =
    productImage.value.trim();

  const description =
    productDescription.value.trim();


  if (!name) {

    showToast(
      "نام محصول را وارد کن"
    );

    productName.focus();

    return;

  }


  if (
    !priceValue ||
    priceValue <= 0
  ) {

    showToast(
      "قیمت محصول را وارد کن"
    );

    productPrice.focus();

    return;

  }


  const newProduct = {

    id:
      Date.now(),

    name:
      name,

    price:
      priceValue,

    category:
      category,

    image:
      image,

    description:
      description ||
      "محصول جدید الف شاپ"

  };


  /* اضافه کردن */

  products.unshift(
    newProduct
  );


  /* ذخیره فوری */

  saveProducts();


  /* نمایش فوری */

  renderProducts();

  renderAdminProducts();


  /* پاک کردن فرم */

  productName.value = "";

  productPrice.value = "";

  productImage.value = "";

  productDescription.value = "";


  showToast(
    "محصول ذخیره شد و بعد از رفرش هم باقی می‌ماند ✅"
  );

}


/* ==========================================
   مدیریت محصولات
========================================== */

function renderAdminProducts() {

  productNumber.textContent =
    products.length;


  if (!products.length) {

    adminProducts.innerHTML =
      `
        <p style="font-size:10px;color:#917d86">
          هنوز محصولی اضافه نشده.
        </p>
      `;

    return;

  }


  adminProducts.innerHTML =
    products.map(product => `

      <div class="admin-product">

        <div class="admin-product-image">

          ${
            product.image
            ?
            `<img
              src="${safe(product.image)}"
              alt=""
            >`
            :
            "👗"
          }

        </div>


        <div class="admin-product-info">

          <strong>
            ${safe(product.name)}
          </strong>

          <span>
            ${price(product.price)}
          </span>

        </div>


        <button
          class="delete-product"
          data-delete="${product.id}"
        >
          🗑️
        </button>

      </div>

    `).join("");


  document
    .querySelectorAll("[data-delete]")
    .forEach(button => {

      button.onclick = () => {

        deleteProduct(
          Number(button.dataset.delete)
        );

      };

    });

}


/* ==========================================
   حذف محصول
========================================== */

function deleteProduct(id) {

  const product =
    products.find(
      item => item.id === id
    );


  if (!product) {
    return;
  }


  if (
    !confirm(
      `محصول «${product.name}» حذف شود؟`
    )
  ) {

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


/* ==========================================
   ثبت سفارش
========================================== */

checkoutButton.onclick = () => {

  if (!cart.length) {

    showToast(
      "سبد خرید خالی است"
    );

    return;

  }


  alert(
    "سبد خرید شما آماده ثبت سفارش است 💗"
  );

};


/* ==========================================
   ESC
========================================== */

document.onkeydown =
  event => {

    if (
      event.key === "Escape"
    ) {

      closeCartPanel();

      adminModal.classList.remove(
        "show"
      );

    }

  };


/* ==========================================
   شروع سایت
========================================== */

renderProducts();

renderCart();


/*
   این قسمت باعث می‌شود اگر صفحه Refresh شود،
   اطلاعات از localStorage دوباره خوانده شوند.
*/

window.addEventListener(
  "load",
  () => {

    products =
      readStorage(
        PRODUCTS_KEY,
        products
      );

    cart =
      readStorage(
        CART_KEY,
        cart
      );

    renderProducts();

    renderCart();

  }
);
