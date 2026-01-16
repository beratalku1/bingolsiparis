// AYARLAR
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQentwjOm1FHCk0IIDLVau_oeD_mUv2qUvOgikWcJgpypTkGaiC1C_pJ-Z8CVorR9K0iraEwuQAvoou/pub?gid=0&single=true&output=csv';
const WHATSAPP_NUMBER = '905454254212';

let cart = [];

// Menüyü Google Sheets'ten Çek
fetch(SHEET_URL)
    .then(response => response.text())
    .then(data => {
        parseCSV(data);
    })
    .catch(err => console.error("Veri çekilemedi:", err));

function parseCSV(csv) {
    const lines = csv.split('\n').slice(1);
    let html = '';
    let currentCategory = '';

    lines.forEach(line => {
        // Virgül ile ayrılmış verileri temizle
        const columns = line.split(',');
        if (columns.length < 3) return;

        const kategori = columns[0].trim();
        const urunAd = columns[1].trim();
        const fiyat = columns[2].trim();
        const aciklama = columns[3] ? columns[3].trim() : '';

        // Kategori Başlığı Oluştur
        if (kategori !== currentCategory) {
            currentCategory = kategori;
            html += `<h4 class="category-header">${currentCategory}</h4>`;
        }

        // Ürün Kartı Oluştur
        html += `
            <div class="product-card d-flex justify-content-between align-items-center">
                <div style="flex: 1; padding-right: 10px;">
                    <h6 class="mb-1">${urunAd}</h6>
                    <p class="small text-muted mb-1">${aciklama}</p>
                    <span class="price-tag">${fiyat} TL</span>
                </div>
                <button class="btn btn-add" onclick="addToCart('${urunAd}', ${fiyat})">Ekle</button>
            </div>`;
    });
    document.getElementById('menu-container').innerHTML = html;
}

function addToCart(name, price) {
    cart.push({name, price});
    updateCart();
}

function updateCart() {
    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
    document.getElementById('total-price').innerText = total;
    document.getElementById('cart-footer').style.display = total > 0 ? 'block' : 'none';
}

function showOrderForm() {
    new bootstrap.Modal(document.getElementById('orderModal')).show();
}

function sendWhatsApp() {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const address = document.getElementById('cust-address').value;
    const note = document.getElementById('cust-note').value;

    if(!name || !address || !phone) {
        alert("Lütfen tüm alanları doldurun!");
        return;
    }

    let message = `*BİNGÖLLÜ DÖNER - YENİ SİPARİŞ*\n`;
    message += `--------------------------\n`;
    cart.forEach(item => {
        message += `• ${item.name} - ${item.price} TL\n`;
    });
    message += `--------------------------\n`;
    message += `*TOPLAM:* ${document.getElementById('total-price').innerText} TL\n\n`;
    message += `*MÜŞTERİ:* ${name}\n`;
    message += `*TELEFON:* ${phone}\n`;
    message += `*ADRES:* ${address}\n`;
    if(note) message += `*NOT:* ${note}`;

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
}
