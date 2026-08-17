const ADMIN_PASSWORD = "fal";

const KEY = {
  products: "alf_products",
  cart: "alf_cart",
  users: "alf_users",
  session: "alf_session",
  orders: "alf_orders",
  gateway: "alf_gateway"
};


const defaultProducts = [

  {
    id: 1,
    name: "شومیز سفید زنانه",
    price: 890000,
    category: "شومیز",
    image: "",
    description: "شومیز سفید زنانه شیک و جذاب"
  },

  {
    id: 2,
    name: "مانتو زنانه",
    price: 1290000,
    category: "مانتو",
    image: "",
    description: "مانتو زنانه مناسب استفاده روزمره"
  },

  {
    id: 3,
    name: "ست زنانه",
    price: 1490000,
    category: "ست زنانه",
    image: "",
    description: "ست زنانه شیک و راحت"
  },

  {
    id: 4,
    name: "لباس زنانه",
    price: 1190000,
    category: "لباس زنانه",
    image: "",
    description: "لباس زنانه با طراحی جدید"
  }

];


function load(key, fallback) {

  try {

    const value = localStorage.getItem(key);

    return value
      ? JSON.parse(value)
      : fallback;

  } catch {

    return fallback;

  }

}


function save(key, value) {

  localStorage.setItem(
    key,
    JSON.stringify(value)
  );

}


let products =
  load(KEY.products, defaultProducts);

let cart =
  load(KEY.cart, []);

let users =
  load(KEY.users, []);

let orders =
  load(KEY.orders, []);

let session =
  load(KEY.session, null);

let gateway =
  localStorage.getItem(KEY.gateway) || "";


function money(number) {

  return new Intl.NumberFormat("fa-IR")
    .format(number) + " تومان";

}


function toast(message) {

  const element =
    document.getElementById("toast");

  element.textContent = message;

  element.style.display = "block";

  clearTimeout(window.toastTimer);

  window.toastTimer =
    setTimeout(() => {

      element.style.display = "none";

    }, 2500);

}


function openModal(id) {

  document
    .getElementById(id)
    .classList.add("show");

}


function closeModal(id) {

  document
    .getElementById(id)
    .classList.remove("show");

}


function goProducts() {

  document
    .getElementById("products")
    .scrollIntoView({
      behavior: "smooth"
    });

}


function renderProducts() {

  const grid =
    document.getElementById("productsGrid");

  const search =
    document
      .getElementById("searchInput")
      .value
      .toLowerCase();


  const activeCategory =
    document.querySelector(
      ".categories button.active"
    )?.dataset.category || "همه";


  const filtered =
    products.filter(product => {

      const categoryOK =
        activeCategory === "همه" ||
        product.category === activeCategory;

      const searchOK =
        product.name
          .toLowerCase()
          .includes(search);

      return categoryOK && searchOK;

    });


  grid.innerHTML =
    filtered.map(product => `

      <div class="product">

        <div class="product-image">

          ${
            product.image

              ? `<img src="${product.image}"
                  onerror="this.style.display='none'">`

              : "👗"
          }

        </div>

        <div class="product-info">

          <h3>${product.name}</h3>

          <p>${product.description}</p>

          <div class="product-bottom">

            <span class="price">
              ${money(product.price)}
            </span>

            <button
              class="add"
              onclick="addToCart(${product.id})"
            >
              🛒 افزودن
            </button>

          </div>

        </div>

      </div>

    `).join("");

}


function addToCart(id) {

  const item =
    cart.find(x => x.id === id);

  if (item) {

    item.quantity++;

  } else {

    cart.push({
      id,
      quantity: 1
    });

  }

  save(KEY.cart, cart);

  renderCart();

  toast("محصول به سبد اضافه شد 💗");

}


function renderCart() {

  const container =
    document.getElementById("cartItems");

  let total = 0;

  let count = 0;


  container.innerHTML =
    cart.map(item => {

      const product =
        products.find(
          x => x.id === item.id
        );

      if (!product) return "";

      total +=
        product.price *
        item.quantity;

      count += item.quantity;


      return `

        <div class="cart-item">

          <div class="cart-info">

            <b>${product.name}</b>

            <small>
              ${money(product.price)}
            </small>

            <div class="quantity">

              <button
                onclick="changeQuantity(${product.id},1)"
              >
                +
              </button>

              <span>
                ${item.quantity}
              </span>

              <button
                onclick="changeQuantity(${product.id},-1)"
              >
                −
              </button>

              <button
                class="delete"
                onclick="removeFromCart(${product.id})"
              >
                حذف
              </button>

            </div>

          </div>

        </div>

      `;

    }).join("");


  document.getElementById(
    "cartTotal"
  ).textContent = money(total);


  document.getElementById(
    "cartCount"
  ).textContent = count;

}


function changeQuantity(id, amount) {

  const item =
    cart.find(x => x.id === id);

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {

    cart =
      cart.filter(
        x => x.id !== id
      );

  }

  save(KEY.cart, cart);

  renderCart();

}


function removeFromCart(id) {

  cart =
    cart.filter(
      x => x.id !== id
    );

  save(KEY.cart, cart);

  renderCart();

}


function login() {

  const username =
    document
      .getElementById("loginUsername")
      .value
      .trim();

  const phone =
    document
      .getElementById("loginPhone")
      .value
      .trim();

  const password =
    document
      .getElementById("loginPassword")
      .value;


  const user =
    users.find(x =>
      x.username === username &&
      x.phone === phone &&
      x.password === password
    );


  if (!user) {

    document.getElementById(
      "loginMessage"
    ).textContent =
      "اطلاعات ورود صحیح نیست.";

    return;

  }


  session = {
    username: user.username,
    phone: user.phone
  };


  save(KEY.session, session);

  toast("ورود موفق بود ✅");

  showProfile();

}


function register() {

  const username =
    document
      .getElementById("registerUsername")
      .value
      .trim();

  const phone =
    document
      .getElementById("registerPhone")
      .value
      .trim();

  const password =
    document
      .getElementById("registerPassword")
      .value;

  const password2 =
    document
      .getElementById("registerPassword2")
      .value;


  if (!username || !phone || !password) {

    document.getElementById(
      "registerMessage"
    ).textContent =
      "همه فیلدها را کامل کن.";

    return;

  }


  if (password !== password2) {

    document.getElementById(
      "registerMessage"
    ).textContent =
      "تکرار رمز عبور صحیح نیست.";

    return;

  }


  if (
    users.some(
      x =>
        x.username === username ||
        x.phone === phone
    )
  ) {

    document.getElementById(
      "registerMessage"
    ).textContent =
      "این نام کاربری یا شماره قبلاً ثبت شده.";

    return;

  }


  const user = {
    username,
    phone,
    password
  };


  users.push(user);

  save(KEY.users, users);


  session = {
    username,
    phone
  };

  save(KEY.session, session);

  toast("حساب ساخته شد 💗");

  showProfile();

}


function showProfile() {

  document
    .getElementById("loginBox")
    .classList.add("hidden");

  document
    .getElementById("registerBox")
    .classList.add("hidden");

  document
    .getElementById("profileBox")
    .classList.remove("hidden");


  document.getElementById(
    "profileName"
  ).textContent =
    "نام کاربری: " + session.username;


  document.getElementById(
    "profilePhone"
  ).textContent =
    "شماره تماس: " + session.phone;


  renderMyOrders();

}


function renderMyOrders() {

  const box =
    document.getElementById(
      "myOrders"
    );


  const mine =
    orders.filter(
      x =>
        x.username === session.username
    );


  box.innerHTML =
    mine.length

      ? mine.map(order => `

          <div class="order-card">

            <b>
              ${order.id}
            </b>

            <p>
              ${money(order.total)}
            </p>

            <small>
              وضعیت: ${order.status}
            </small>

          </div>

        `).join("")

      : "<p>هنوز سفارشی نداری.</p>";

}


function checkout() {

  if (!cart.length) {

    toast("سبد خرید خالی است.");

    return;

  }


  if (!session) {

    closeModal("cartModal");

    openModal("accountModal");

    return;

  }


  let total = 0;


  const items =
    cart.map(item => {

      const product =
        products.find(
          x => x.id === item.id
        );

      total +=
        product.price *
        item.quantity;


      return {

        id: product.id,

        name: product.name,

        price: product.price,

        quantity: item.quantity

      };

    });


  const orderId =
    "AF-" + Date.now();


  const order = {

    id: orderId,

    username: session.username,

    phone: session.phone,

    items,

    total,

    status: "در انتظار بررسی",

    date:
      new Date()
        .toLocaleString("fa-IR")

  };


  orders.unshift(order);

  save(KEY.orders, orders);


  cart = [];

  save(KEY.cart, cart);

  renderCart();


  if (gateway) {

    const paymentUrl =
      gateway
        .replaceAll(
          "{amount}",
          encodeURIComponent(total)
        )
        .replaceAll(
          "{orderId}",
          encodeURIComponent(orderId)
        );


    window.open(
      paymentUrl,
      "_blank"
    );

    toast(
      "سفارش ثبت شد و درگاه باز شد 💳"
    );

  } else {

    toast(
      "سفارش ثبت شد؛ لینک درگاه تنظیم نشده."
    );

  }

}


function adminLogin() {

  const password =
    document
      .getElementById(
        "adminPassword"
      )
      .value;


  if (password !== ADMIN_PASSWORD) {

    document.getElementById(
      "adminMessage"
    ).textContent =
      "رمز مدیریت اشتباه است.";

    return;

  }


  document
    .getElementById("adminLogin")
    .classList.add("hidden");


  document
    .getElementById("adminPanel")
    .classList.remove("hidden");


  document.getElementById(
    "gatewayInput"
  ).value = gateway;


  renderAdmin();

}


function renderAdmin() {

  renderOrders();

  renderAdminProducts();

}


function renderOrders() {

  const pending =
    orders.filter(
      x =>
        x.status === "در انتظار بررسی"
    );


  const accepted =
    orders.filter(
      x =>
        x.status === "تأیید شده"
    );


  document.getElementById(
    "pendingOrders"
  ).innerHTML =
    pending.length

      ? pending
          .map(orderHTML)
          .join("")

      : "<p>سفارشی نیست.";


  document.getElementById(
    "acceptedOrders"
  ).innerHTML =
    accepted.length

      ? accepted
          .map(orderHTML)
          .join("")

      : "<p>سفارشی نیست.";

}


function orderHTML(order) {

  return `

    <div class="order-card">

      <b>
        سفارش ${order.id}
      </b>

      <p>
        کاربر:
        ${order.username}
      </p>

      <p>
        شماره:
        ${order.phone}
      </p>

      <ul>

        ${
          order.items
            .map(
              item =>
                `<li>
                  ${item.name}
                  × ${item.quantity}
                </li>`
            )
            .join("")
        }

      </ul>

      <strong>
        ${money(order.total)}
      </strong>

      <div class="order-actions">

        ${
          order.status ===
          "در انتظار بررسی"

            ? `

              <button
                class="accept"
                onclick="acceptOrder('${order.id}')"
              >
                ✅ قبول سفارش
              </button>

              <button
                class="reject"
                onclick="rejectOrder('${order.id}')"
              >
                ❌ رد سفارش
              </button>

            `

            : ""

        }

      </div>

    </div>

  `;

}


function acceptOrder(id) {

  const order =
    orders.find(
      x => x.id === id
    );


  if (!order) return;


  order.status =
    "تأیید شده";


  save(KEY.orders, orders);


  renderAdmin();

  renderMyOrders();

  toast(
    "سفارش قبول شد و وارد سفارش‌های اصلی شد ✅"
  );

}


function rejectOrder(id) {

  const order =
    orders.find(
      x => x.id === id
    );


  if (!order) return;


  order.status =
    "رد شده";


  save(KEY.orders, orders);

  renderAdmin();

  toast(
    "سفارش رد شد."
  );

}


function addProduct() {

  const name =
    document
      .getElementById(
        "productName"
      )
      .value
      .trim();

  const price =
    Number(
      document
        .getElementById(
          "productPrice"
        )
        .value
    );

  const category =
    document
      .getElementById(
        "productCategory"
      )
      .value;

  const image =
    document
      .getElementById(
        "productImage"
      )
      .value
      .trim();

  const description =
    document
      .getElementById(
        "productDescription"
      )
      .value
      .trim();


  if (!name || !price) {

    toast(
      "نام و قیمت محصول را وارد کن."
    );

    return;

  }


  products.unshift({

    id: Date.now(),

    name,

    price,

    category,

    image,

    description:
      description ||
      "محصول جدید الف شاپ"

  });


  save(KEY.products, products);

  renderProducts();

  renderAdmin();

  toast(
    "محصول اضافه شد 💗"
  );

}


function renderAdminProducts() {

  document.getElementById(
    "adminProducts"
  ).innerHTML =

    products.map(product => `

      <div class="admin-product">

        <div class="admin-product-info">

          <b>
            ${product.name}
          </b>

          <small>
            ${money(product.price)}
          </small>

        </div>

        <button
          class="delete"
          onclick="deleteProduct(${product.id})"
        >
          🗑️
        </button>

      </div>

    `).join("");

}


function deleteProduct(id) {

  products =
    products.filter(
      x => x.id !== id
    );

  save(KEY.products, products);

  renderProducts();

  renderAdmin();

  toast(
    "محصول حذف شد."
  );

}


/* دکمه‌ها */

document
  .getElementById("cartButton")
  .onclick = () => {

    openModal("cartModal");

    renderCart();

  };


document
  .getElementById("accountButton")
  .onclick = () => {

    openModal("accountModal");

    if (session) {

      showProfile();

    } else {

      document
        .getElementById("profileBox")
        .classList.add("hidden");

      document
        .getElementById("loginBox")
        .classList.remove("hidden");

    }

  };


document
  .getElementById("loginButton")
  .onclick = login;


document
  .getElementById("registerButton")
  .onclick = register;


document
  .getElementById("showRegister")
  .onclick = () => {

    document
      .getElementById("loginBox")
      .classList.add("hidden");

    document
      .getElementById("registerBox")
      .classList.remove("hidden");

  };


document
  .getElementById("showLogin")
  .onclick = () => {

    document
      .getElementById("registerBox")
      .classList.add("hidden");

    document
      .getElementById("loginBox")
      .classList.remove("hidden");

  };


document
  .getElementById("logoutButton")
  .onclick = () => {

    session = null;

    localStorage.removeItem(
      KEY.session
    );

    closeModal("accountModal");

    toast(
      "از حساب خارج شدی."
    );

  };


document
  .getElementById("checkoutButton")
  .onclick = checkout;


document
  .getElementById("adminButton")
  .onclick = () => {

    openModal("adminModal");

  };


document
  .getElementById("adminLoginButton")
  .onclick = adminLogin;


document
  .getElementById("saveGateway")
  .onclick = () => {

    gateway =
      document
        .getElementById(
          "gatewayInput"
        )
        .value
        .trim();


    localStorage.setItem(
      KEY.gateway,
      gateway
    );


    toast(
      "لینک درگاه ذخیره شد 💳"
    );

  };


document
  .getElementById("addProduct")
  .onclick = addProduct;


document
  .getElementById("searchInput")
  .oninput =
    renderProducts;


document
  .querySelectorAll(
    ".categories button"
  )
  .forEach(button => {

    button.onclick = () => {

      document
        .querySelectorAll(
          ".categories button"
        )
        .forEach(x =>
          x.classList.remove("active")
        );


      button.classList.add("active");

      renderProducts();

    };

  });


/* شروع */

document
  .querySelector(
    '.categories button[data-category="همه"]'
  )
  .classList.add("active");


renderProducts();

renderCart();
