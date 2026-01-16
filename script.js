// DÜKKAN YAPILANDIRMALARI
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

// Masaüstünde tıklamayı garantiye alan ana fonksiyon
window.openShop = function(shopKey) {
    console.log("Dükkan açılıyor:", shopKey); // Hata ayıklama için
    currentShop = SHOPS[shopKey];
    if (!currentShop) return;

    cart = [];
    updateCart();
    
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'block';
    document.getElementById('active-shop-name').innerText = currentShop.name;
    document.getElementById('menu-container').innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-warning"></div><p>Menü yükleniyor...</p></div>';
    
    loadMenu(currentShop.url);
};

window.goHome = function() {
    document.getElementById('home-screen').style.display = 'block';
    document.getElementById('menu-screen').style.display = 'none';
};

async function loadMenu(url) {
    try {
        const response = await fetch(url + '&cb=' + Date.now());
        const csv = await response.text();
        parseCSV(csv);
    } catch (e) {
        document.getElementById('menu-container').innerHTML = "Hata: Veri çekilemedi. Lütfen sayfayı yenileyin.";
    }
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

        html += `
            <div class="product-card d-flex justify-content-between align-items-center">
                <div style="flex:1">
                    <h6 class="mb-1">${cols[1]}</h6>
                    <small class="text-muted d-block">${cols[3] || ''}</small>
                    <span class="price-tag">${cols[2]} TL</span>
                </div>
                <button class="btn btn-add" onclick="addToCart('${cols[1].replace(/'/g, "\\'")}', ${cols[2]})">Ekle</button>
            </div>`;
    }
    document.getElementById('menu-container').innerHTML = html;
}

window.addToCart = function(n, p) {
    cart.push({name: n, price: p});
    updateCart();
};

function updateCart() {
    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
    document.getElementById('total-price').innerText = total;
    document.getElementById('cart-footer').style.display = total > 0 ? 'block' : 'none';
}

window.showOrderForm = function() {
    document.getElementById('cust-name').value = localStorage.getItem('u_name') || '';
    document.getElementById('cust-phone').value = localStorage.getItem('u_phone') || '';
    document.getElementById('cust-address').value = localStorage.getItem('u_address') || '';
    
    var myModal = new bootstrap.Modal(document.getElementById('orderModal'));
    myModal.show();
};

window.sendWhatsApp = function() {
    const n = document.getElementById('cust-name').value, 
          p = document.getElementById('cust-phone').value, 
          a = document.getElementById('cust-address').value, 
          nt = document.getElementById('cust-note').value;

    if(!n || !a || !p) return alert("Lütfen tüm alanları doldurun!");

    localStorage.setItem('u_name', n);
    localStorage.setItem('u_phone', p);
    localStorage.setItem('u_address', a);

    let msg = `*${currentShop.name.toUpperCase()} - YENİ SİPARİŞ*\n`;
    cart.forEach(i => msg += `• ${i.name} - ${i.price} TL\n`);
    msg += `\n*TOPLAM:* ${document.getElementById('total-price').innerText} TL\n*Müşteri:* ${n}\n*Adres:* ${a}\n*Not:* ${nt}`;
    
    window.open(`https://wa.me/${currentShop.number}?text=${encodeURIComponent(msg)}`, '_blank');
};
