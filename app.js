function loadScriptSeq(urls,cb,failCb){
  let i=0;
  function next(){
    if(i>=urls.length){ failCb&&failCb(); return; }
    const s=document.createElement('script');
    s.src=urls[i]; s.onload=cb;
    s.onerror=function(){ i++; next(); };
    document.head.appendChild(s);
  }
  next();
}
const FB_APP_URLS=['https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js','https://cdn.jsdelivr.net/npm/firebase@10.13.1/firebase-app-compat.js','https://unpkg.com/firebase@10.13.1/firebase-app-compat.js'];
const FB_FS_URLS=['https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore-compat.js','https://cdn.jsdelivr.net/npm/firebase@10.13.1/firebase-firestore-compat.js','https://unpkg.com/firebase@10.13.1/firebase-firestore-compat.js'];
function showFbError(){
  document.body.insertAdjacentHTML('afterbegin','<div style="background:#3a0d16;color:#ffb3c6;padding:14px;text-align:center;font-family:sans-serif;font-size:14px;">اتصال به دیتابیس برقرار نشد. اینترنتت رو چک کن یا صفحه رو رفرش کن.</div>');
}
loadScriptSeq(FB_APP_URLS,function(){ loadScriptSeq(FB_FS_URLS,startApp,showFbError); },showFbError);

function startApp(){
const ADMIN_PASSWORD="fal";
const firebaseConfig={
  apiKey:"AIzaSyB4HTC5_rJ-phcWE_iKHKbWZkQzjCLdc50",
  authDomain:"izo-city.firebaseapp.com",
  projectId:"izo-city",
  storageBucket:"izo-city.firebasestorage.app",
  messagingSenderId:"1047171617464",
  appId:"1:1047171617464:web:c2536811746524711d9a4d"
};
firebase.initializeApp(firebaseConfig);
const db=firebase.firestore();
const siteDocRef=db.collection('alefShop').doc('siteData');

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function escapeHtml(str){ const d=document.createElement('div'); d.innerText=str||''; return d.innerHTML; }
function money(n){ return Math.round(n).toLocaleString('fa-IR')+' تومان'; }

let siteData={products:[],pendingOrders:[],confirmedOrders:[],gatewayLink:''};
let cart={};
let currentUser=null;
let activeCategory='همه';

async function loadData(){
  try{
    const snap=await siteDocRef.get();
    if(snap.exists){
      const d=snap.data();
      siteData.products=d.products||[];
      siteData.pendingOrders=d.pendingOrders||[];
      siteData.confirmedOrders=d.confirmedOrders||[];
      siteData.gatewayLink=d.gatewayLink||'';
    }else{
      await siteDocRef.set({products:[],pendingOrders:[],confirmedOrders:[],gatewayLink:''});
    }
  }catch(e){ console.error('load failed',e); }
  restoreSession();
  render();
}
async function saveData(){
  try{
    await siteDocRef.set({
      products:siteData.products,pendingOrders:siteData.pendingOrders,
      confirmedOrders:siteData.confirmedOrders,gatewayLink:siteData.gatewayLink
    });
  }catch(e){ console.error('save failed',e); }
}
siteDocRef.onSnapshot((snap)=>{
  if(!snap.exists) return;
  const d=snap.data();
  siteData.products=d.products||[];
  siteData.pendingOrders=d.pendingOrders||[];
  siteData.confirmedOrders=d.confirmedOrders||[];
  siteData.gatewayLink=d.gatewayLink||'';
  render();
});

function restoreSession(){
  const phone=localStorage.getItem('alefShopPhone');
  if(!phone) return;
  const u=siteData.users_cache; // not used, users stored separately below
}

/* users stored in a separate doc so login works even before products load fully */
let users=[];
const usersDocRef=db.collection('alefShop').doc('users');
async function loadUsers(){
  try{
    const snap=await usersDocRef.get();
    if(snap.exists) users=snap.data().list||[];
    else await usersDocRef.set({list:[]});
  }catch(e){ console.error('users load failed',e); }
  const phone=localStorage.getItem('alefShopPhone');
  if(phone){
    const u=users.find(x=>x.phone===phone);
    if(u) currentUser=u;
  }
  updateAccountUI();
}
usersDocRef.onSnapshot((snap)=>{
  if(!snap.exists) return;
  users=snap.data().list||[];
  if(currentUser){
    const u=users.find(x=>x.phone===currentUser.phone);
    if(u) currentUser=u;
  }
});
async function saveUsers(){
  try{ await usersDocRef.set({list:users}); }catch(e){ console.error('users save failed',e); }
}

function render(){
  renderProducts();
  renderCart();
  renderAdminProducts();
  renderAdminPending();
  renderAdminConfirmed();
  renderGatewayInput();
}

function renderProducts(){
  const grid=document.getElementById('productsGrid');
  let list=siteData.products.filter(p=>activeCategory==='همه'||p.category===activeCategory);
  const sort=document.getElementById('sortSelect').value;
  if(sort==='cheap') list=[...list].sort((a,b)=>a.price-b.price);
  else if(sort==='expensive') list=[...list].sort((a,b)=>b.price-a.price);
  else list=[...list].sort((a,b)=>b.ts-a.ts);

  if(!list.length){
    grid.innerHTML='<div class="empty-state">🛍️<h3>محصولی پیدا نشد</h3><p>جستجو یا دسته‌بندی رو تغییر بده.</p></div>';
    return;
  }
  grid.innerHTML=list.map(p=>`
    <div class="product-card">
      <div class="product-img">${p.image?`<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}">`:'👗'}</div>
      <div class="product-body">
        <div class="product-cat">${escapeHtml(p.category)}</div>
        <div class="product-name">${escapeHtml(p.name)}</div>
        <div class="product-price">${money(p.price)}</div>
        <button class="add-cart-btn" data-add="${p.id}">افزودن به سبد</button>
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('[data-add]').forEach(b=>{
    b.addEventListener('click',()=>{
      cart[b.dataset.add]=(cart[b.dataset.add]||0)+1;
      renderCart();
    });
  });
}

document.querySelectorAll('.chip').forEach(c=>{
  c.addEventListener('click',()=>{
    document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
    c.classList.add('active');
    activeCategory=c.dataset.cat;
    renderProducts();
  });
});
document.getElementById('sortSelect').addEventListener('change',renderProducts);

function cartItemsArray(){
  return Object.entries(cart).map(([id,qty])=>{
    const p=siteData.products.find(x=>x.id===id);
    return p?{id,name:p.name,price:p.price,qty,image:p.image}:null;
  }).filter(Boolean);
}
function cartTotal(){
  return cartItemsArray().reduce((s,i)=>s+i.price*i.qty,0);
}
function renderCart(){
  const items=cartItemsArray();
  document.getElementById('cartCount').textContent=items.reduce((s,i)=>s+i.qty,0);
  const box=document.getElementById('cartItemsBox');
  if(!items.length){
    box.innerHTML='<div class="empty-state">🛒<h3>سبد خرید خالیه</h3><p>هنوز محصولی انتخاب نکردی.</p></div>';
  }else{
    box.innerHTML=items.map(i=>`
      <div class="cart-item">
        <div style="width:52px;height:64px;border-radius:8px;overflow:hidden;background:var(--panel-2);flex-shrink:0;">
          ${i.image?`<img src="${escapeHtml(i.image)}" style="width:100%;height:100%;object-fit:cover;">`:''}
        </div>
        <div style="flex:1;">
          <div style="font-size:13.5px;font-weight:700;">${escapeHtml(i.name)}</div>
          <div class="mono" style="font-size:12.5px;color:var(--text-dim);">${money(i.price)}</div>
        </div>
        <div class="qty-ctrl">
          <button data-dec="${i.id}">−</button>
          <span class="mono">${i.qty}</span>
          <button data-inc="${i.id}">+</button>
        </div>
      </div>
    `).join('');
    box.querySelectorAll('[data-inc]').forEach(b=>b.addEventListener('click',()=>{ cart[b.dataset.inc]++; renderCart(); }));
    box.querySelectorAll('[data-dec]').forEach(b=>b.addEventListener('click',()=>{
      cart[b.dataset.dec]--; if(cart[b.dataset.dec]<=0) delete cart[b.dataset.dec];
      renderCart();
    }));
  }
  document.getElementById('cartTotal').textContent=money(cartTotal());
  document.getElementById('paymentBox').style.display='none';
}

document.getElementById('cartBtn').addEventListener('click',()=>document.getElementById('cartOverlay').classList.add('show'));
document.getElementById('closeCart').addEventListener('click',()=>document.getElementById('cartOverlay').classList.remove('show'));

document.getElementById('checkoutBtn').addEventListener('click',async()=>{
  const toast=document.getElementById('checkoutToast');
  toast.classList.add('show');
  const items=cartItemsArray();
  if(!items.length){ toast.className='toast err show'; toast.textContent='سبد خریدت خالیه.'; return; }
  if(!currentUser){
    toast.className='toast err show'; toast.textContent='اول باید وارد حسابت بشی.';
    document.getElementById('accountOverlay').classList.add('show');
    return;
  }
  const total=cartTotal();
  const order={id:uid(),items,total,phone:currentUser.phone,name:currentUser.name,status:'pending',ts:Date.now()};
  siteData.pendingOrders.push(order);
  await saveData();
  cart={};
  renderCart();
  toast.className='toast ok show'; toast.textContent='سفارش ثبت شد و برای بررسی مدیریت ارسال شد.';

  const payBox=document.getElementById('paymentBox');
  if(siteData.gatewayLink){
    const url=siteData.gatewayLink+(siteData.gatewayLink.includes('?')?'&':'?')+'amount='+Math.round(total);
    payBox.innerHTML=`<div class="card" style="margin-top:0;">
      <div style="font-size:13.5px;color:var(--text-dim);">مبلغ قابل پرداخت</div>
      <div class="mono" style="font-size:20px;color:var(--berry);margin:6px 0 14px;">${money(total)}</div>
      <a href="${url}" target="_blank" rel="noopener" class="btn btn-primary" style="width:100%;justify-content:center;">پرداخت از طریق درگاه</a>
    </div>`;
    payBox.style.display='block';
  }
});

/* ---------- account ---------- */
document.getElementById('accountBtn').addEventListener('click',()=>document.getElementById('accountOverlay').classList.add('show'));
document.getElementById('closeAccount').addEventListener('click',()=>document.getElementById('accountOverlay').classList.remove('show'));
document.querySelectorAll('[data-atab]').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('[data-atab]').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('#loggedOutView .tab-view').forEach(v=>v.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(t.dataset.atab).classList.add('active');
  });
});
function updateAccountUI(){
  const label=document.getElementById('accountLabel');
  const loggedOut=document.getElementById('loggedOutView');
  const loggedIn=document.getElementById('loggedInView');
  if(currentUser){
    label.textContent=currentUser.name||currentUser.phone;
    loggedOut.style.display='none';
    loggedIn.style.display='block';
    document.getElementById('accountNameSpan').textContent=currentUser.name||currentUser.phone;
  }else{
    label.textContent='ورود';
    loggedOut.style.display='block';
    loggedIn.style.display='none';
  }
}
document.getElementById('signupBtn').addEventListener('click',async()=>{
  const phone=document.getElementById('signupPhone').value.trim();
  const name=document.getElementById('signupName').value.trim();
  const pass=document.getElementById('signupPass').value;
  const toast=document.getElementById('signupToast');
  toast.classList.add('show');
  if(!phone||!name||!pass){ toast.className='toast err show'; toast.textContent='همه‌ی فیلدها رو پر کن.'; return; }
  if(users.find(u=>u.phone===phone)){ toast.className='toast err show'; toast.textContent='این شماره قبلاً ثبت‌نام کرده.'; return; }
  const newUser={phone,name,password:pass,ts:Date.now()};
  users.push(newUser);
  await saveUsers();
  currentUser=newUser;
  localStorage.setItem('alefShopPhone',phone);
  toast.className='toast ok show'; toast.textContent='ثبت‌نام موفق بود!';
  updateAccountUI();
  setTimeout(()=>document.getElementById('accountOverlay').classList.remove('show'),700);
});
document.getElementById('loginBtn').addEventListener('click',async()=>{
  const phone=document.getElementById('loginPhone').value.trim();
  const pass=document.getElementById('loginPass').value;
  const toast=document.getElementById('loginToast');
  toast.classList.add('show');
  const u=users.find(x=>x.phone===phone && x.password===pass);
  if(!u){ toast.className='toast err show'; toast.textContent='شماره یا رمز اشتباهه.'; return; }
  currentUser=u;
  localStorage.setItem('alefShopPhone',phone);
  toast.className='toast ok show'; toast.textContent='خوش اومدی!';
  updateAccountUI();
  setTimeout(()=>document.getElementById('accountOverlay').classList.remove('show'),700);
});
document.getElementById('logoutBtn').addEventListener('click',()=>{
  currentUser=null;
  localStorage.removeItem('alefShopPhone');
  updateAccountUI();
});

/* ---------- admin ---------- */
document.getElementById('openAdmin').addEventListener('click',()=>document.getElementById('adminOverlay').classList.add('show'));
document.getElementById('closeAdmin').addEventListener('click',()=>document.getElementById('adminOverlay').classList.remove('show'));
document.getElementById('adminLoginBtn').addEventListener('click',()=>{
  if(document.getElementById('adminPass').value===ADMIN_PASSWORD){
    document.getElementById('adminLoginView').style.display='none';
    document.getElementById('adminPanelView').style.display='block';
  }else{
    document.getElementById('adminLoginError').classList.add('show');
  }
});
document.querySelectorAll('#adminPanelView .tab-btn').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('#adminPanelView .tab-btn').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('#adminPanelView .tab-view').forEach(v=>v.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(t.dataset.tab).classList.add('active');
  });
});

document.getElementById('addProductBtn').addEventListener('click',async()=>{
  const name=document.getElementById('pName').value.trim();
  const price=parseFloat(document.getElementById('pPrice').value);
  const category=document.getElementById('pCat').value;
  const image=document.getElementById('pImg').value.trim();
  const desc=document.getElementById('pDesc').value.trim();
  if(!name||!price) return;
  siteData.products.push({id:uid(),name,price,category,image,desc,ts:Date.now()});
  await saveData();
  ['pName','pPrice','pImg','pDesc'].forEach(id=>document.getElementById(id).value='');
  render();
});
function renderAdminProducts(){
  const box=document.getElementById('adminProductsList');
  if(!siteData.products.length){ box.innerHTML='<p style="color:var(--text-dim);font-size:14px;">محصولی ثبت نشده.</p>'; return; }
  const sorted=[...siteData.products].sort((a,b)=>b.ts-a.ts);
  box.innerHTML=sorted.map(p=>`
    <div class="row-item">
      <div><b>${escapeHtml(p.name)}</b> <span class="mono" style="color:var(--text-dim);">${money(p.price)}</span> · ${escapeHtml(p.category)}</div>
      <button class="del-btn" data-del-p="${p.id}">حذف</button>
    </div>
  `).join('');
  box.querySelectorAll('[data-del-p]').forEach(b=>b.addEventListener('click',async()=>{
    siteData.products=siteData.products.filter(x=>x.id!==b.dataset.delP);
    await saveData(); render();
  }));
}
function renderAdminPending(){
  const box=document.getElementById('pendingOrdersList');
  if(!siteData.pendingOrders.length){ box.innerHTML='<p style="color:var(--text-dim);font-size:14px;">سفارشی در انتظار نیست.</p>'; return; }
  const sorted=[...siteData.pendingOrders].sort((a,b)=>b.ts-a.ts);
  box.innerHTML=sorted.map(o=>`
    <div class="row-item">
      <div>
        <div><b>${escapeHtml(o.name)}</b> <span class="mono" style="color:var(--text-dim);">${escapeHtml(o.phone)}</span></div>
        <div style="font-size:12.5px;color:var(--text-dim);">${o.items.map(i=>escapeHtml(i.name)+' ×'+i.qty).join('، ')}</div>
        <div class="mono" style="color:var(--berry);margin-top:4px;">${money(o.total)}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="accept-btn" data-accept-o="${o.id}">قبول سفارش</button>
        <button class="del-btn" data-del-o="${o.id}">رد</button>
      </div>
    </div>
  `).join('');
  box.querySelectorAll('[data-accept-o]').forEach(b=>b.addEventListener('click',async()=>{
    const o=siteData.pendingOrders.find(x=>x.id===b.dataset.acceptO);
    if(o){ o.status='confirmed'; siteData.confirmedOrders.push(o); siteData.pendingOrders=siteData.pendingOrders.filter(x=>x.id!==o.id); }
    await saveData(); render();
  }));
  box.querySelectorAll('[data-del-o]').forEach(b=>b.addEventListener('click',async()=>{
    siteData.pendingOrders=siteData.pendingOrders.filter(x=>x.id!==b.dataset.delO);
    await saveData(); render();
  }));
}
function renderAdminConfirmed(){
  const box=document.getElementById('confirmedOrdersList');
  if(!siteData.confirmedOrders.length){ box.innerHTML='<p style="color:var(--text-dim);font-size:14px;">هنوز سفارشی تأیید نشده.</p>'; return; }
  const sorted=[...siteData.confirmedOrders].sort((a,b)=>b.ts-a.ts);
  box.innerHTML=sorted.map(o=>`
    <div class="row-item">
      <div>
        <div><b>${escapeHtml(o.name)}</b> <span class="mono" style="color:var(--text-dim);">${escapeHtml(o.phone)}</span></div>
        <div style="font-size:12.5px;color:var(--text-dim);">${o.items.map(i=>escapeHtml(i.name)+' ×'+i.qty).join('، ')}</div>
        <div class="mono" style="color:var(--berry);margin-top:4px;">${money(o.total)}</div>
      </div>
      <button class="del-btn" data-del-co="${o.id}">حذف</button>
    </div>
  `).join('');
  box.querySelectorAll('[data-del-co]').forEach(b=>b.addEventListener('click',async()=>{
    siteData.confirmedOrders=siteData.confirmedOrders.filter(x=>x.id!==b.dataset.delCo);
    await saveData(); render();
  }));
}
function renderGatewayInput(){
  const el=document.getElementById('gatewayInput');
  if(document.activeElement!==el) el.value=siteData.gatewayLink||'';
}
document.getElementById('saveGatewayBtn').addEventListener('click',async()=>{
  siteData.gatewayLink=document.getElementById('gatewayInput').value.trim();
  await saveData(); render();
});

loadUsers();
loadData();
}
