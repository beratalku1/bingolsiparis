const SHOPS = {
    doner: {
        name: "Bingöllü Döner",
        url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQentwjOm1FHCk0IIDLVau_oeD_mUv2qUvOgikWcJgpypTkGaiC1C_pJ-Z8CVorR9K0iraEwuQAvoou/pub?gid=0&single=true&output=csv',
        number: '905454254212'
    },
    tatli: {
        name: "Vangölü Tatlıcısı",
        url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSsAUsKqa8Z4hFgiL6rGGi2na95e71trkX_hRzhm8H4AUubEXIbnJE6k7uwMXOxFR3UoNMveyVObjt2/pub?gid=510928920&single=true&output=csv',
        number: '905454254212'
    }
};

let currentShop = null;
let cart = [];

// URL PARAMETRESİ İLE OTOMATİK DÜKKAN AÇMA
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('s');
    if (s && SHOPS[s]) openShop(s);
});

window.toggleOrderInput = function(type) {
    const addressArea = document.getElementById('address-input-area');
    const tableArea = document.getElementById('table-input-area');
    const phoneInput = document.getElementById('cust-phone');
    if (type === 'table') {
        addressArea.style.display = 'none';
        phoneInput.style.display = 'none';
        tableArea.style.display = 'block';
    } else {
        addressArea.style.display = 'block';
        phoneInput.style.display = 'block';
        tableArea.style.display = 'none';
    }
};

window.openShop = function(shopKey) {
    currentShop = SHOPS[shopKey];
    cart = [];
    updateCart();
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'block';
    document.getElementById('active-shop-name').innerText = currentShop.name;
    const lastData = localStorage.getItem('last_order_' + shopKey);
    const container = document.getElementById('repeat-order-container');
    if (lastData) {
        const parsed = JSON.parse(lastData);
        const itemNames = parsed.items.map(i => i.name).join(", ");
        container.innerHTML = `<button class="btn btn-light mb-3 text-start w-100 p-3" onclick="repeatLastOrder('${shopKey}')"><strong>🔄 Son Siparişi Tekrarla (${parsed.total} TL)</strong><span class="last-order-detail">${itemNames}</span></button>`;
        container.style.display = 'block';
    } else { container.style.display = 'none'; }
    loadMenu(currentShop.url);
};

window.repeatLastOrder = function(shopKey) {
    const lastData = JSON.parse(localStorage.getItem('last_order_' + shopKey));
    if (lastData) { cart = lastData.items; updateCart(); showOrderForm(); }
};

window.goHome = function() {
    window.history.pushState({}, '', window.location.pathname); // URL'yi temizle
    document.getElementById('home-screen').style.display = 'block';
    document.getElementById('menu-screen').style.display = 'none';
};

async function loadMenu(url) {
    try {
        const response = await fetch(url + '&cb=' + Date.now());
        const csv = await response.text();
        parseCSV(csv);
    } catch (e) { document.getElementById('menu-container').innerHTML = "Menü yüklenemedi."; }
}

function parseCSV(csv) {
    const rows = csv.split(/\r?\n/);
    let html = '';
    let currentCat = '';
    for (let i = 1; i < rows.length; i++) {
        let row = rows[i].trim();
        if (!row) continue;
        const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
        const cols = row.split(regex).map(c => c.replace(/^"|"$/g, '').trim());
        if (cols.length < 3) continue;
        if (cols[0] !== currentCat) {
            currentCat = cols[0];
            html += `<h4 class="category-header">${currentCat}</h4>`;
        }
        html += `<div class="product-card d-flex justify-content-between align-items-center"><div style="flex:1"><h6 class="mb-1">${cols[1]}</h6><small class="text-muted d-block">${cols[3] || ''}</small><span class="price-tag">${cols[2]} TL</span></div><button class="btn btn-add" onclick="addToCart('${cols[1].replace(/'/g, "\\'")}', ${cols[2]})">Ekle</button></div>`;
    }
    document.getElementById('menu-container').innerHTML = html;
}

window.addToCart = function(n, p) { cart.push({name: n, price: p}); updateCart(); };
window.removeFromCart = function(index) { cart.splice(index, 1); updateCart(); };

function updateCart() {
    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
    const cartList = document.getElementById('cart-items-list');
    cartList.innerHTML = '';
    cart.forEach((item, index) => {
        cartList.innerHTML += `<div class="cart-item"><span>${item.name} (${item.price} TL)</span><button class="btn-remove" onclick="removeFromCart(${index})">✕</button></div>`;
    });
    document.getElementById('total-price').innerText = total;
    document.getElementById('cart-footer').style.display = total > 0 ? 'block' : 'none';
}

window.showOrderForm = function() {
    document.getElementById('cust-name').value = localStorage.getItem('u_name') || '';
    document.getElementById('cust-phone').value = localStorage.getItem('u_phone') || '';
    document.getElementById('cust-address').value = localStorage.getItem('u_address') || '';
    document.getElementById('typeAddress').checked = true;
    toggleOrderInput('address');
    new bootstrap.Modal(document.getElementById('orderModal')).show();
};

window.sendWhatsApp = function() {
    const n = document.getElementById('cust-name').value, p = document.getElementById('cust-phone').value, nt = document.getElementById('cust-note').value, isTable = document.getElementById('typeTable').checked;
    if(!n) return alert("Lütfen adınızı girin!");
    let loc = "";
    if(isTable) {
        const t = document.getElementById('cust-table').value;
        if(!t) return alert("Masa no girin!");
        loc = `📍 *MASA NO:* ${t}`;
    } else {
        const a = document.getElementById('cust-address').value;
        if(!p || !a) return alert("Telefon ve adres girin!");
        loc = `🏠 *ADRES:* ${a}\n📞 *TEL:* ${p}`;
        localStorage.setItem('u_address', a);
        localStorage.setItem('u_phone', p);
    }
    const tp = document.getElementById('total-price').innerText;
    const sk = currentShop.name === "Bingöllü Döner" ? 'doner' : 'tatli';
    localStorage.setItem('last_order_' + sk, JSON.stringify({ items: cart, total: tp }));
    localStorage.setItem('u_name', n);
    let msg = `*${currentShop.name.toUpperCase()}*\n${isTable ? '🔔 *MASADAN*' : '🛵 *ADRESE*'}\n--------------------------\n`;
    cart.forEach(i => msg += `• ${i.name} - ${i.price} TL\n`);
    msg += `--------------------------\n*TOPLAM:* ${tp} TL\n*Müşteri:* ${n}\n${loc}\n${nt ? '*Not:* '+nt : ''}`;
    window.open(`https://wa.me/${currentShop.number}?text=${encodeURIComponent(msg)}`, '_blank');
};
