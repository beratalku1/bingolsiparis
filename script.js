// AYARLAR
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQentwjOm1FHCk0IIDLVau_oeD_mUv2qUvOgikWcJgpypTkGaiC1C_pJ-Z8CVorR9K0iraEwuQAvoou/pub?gid=0&single=true&output=csv';
const WHATSAPP_NUMBER = '905454254212';

let cart = [];

// Menüyü Google Sheets'ten Çek
fetch(SHEET_URL)
    .then(response => response.text())
    .then(data => {
        if (!data || data.includes("<!DOCTYPE html>")) {
            throw new Error("CSV verisi alınamadı.");
        }
        parseCSV(data);
    })
    .catch(err => {
        console.error("Hata:", err);
        document.getElementById('menu-container').innerHTML = `<p class="text-center mt-5 text-danger">Menü yüklenirken bir hata oluştu.</p>`;
    });

function parseCSV(csv) {
    // Satır içi virgülleri korumak için Regex (Düzenli İfade) kullanıyoruz
    const rows = csv.split(/\r?\n/);
    let html = '';
    let currentCategory = '';

    for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;

        // Bu özel kod, tırnak içindeki virgülleri görmezden gelir
        const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
        const columns = rows[i].split(regex).map(col => col.replace(/^"|"$/g, '').trim());

        if (columns.length < 3) continue;

        const kategori = columns[0];
        const urunAd = columns[1];
        const fiyat = columns[2];
        const aciklama = columns[3] || '';

        // Kategori Başlığı
        if (kategori !== currentCategory) {
            currentCategory = kategori;
            html += `<h4 class="category-header">${currentCategory}</h4>`;
        }

        // Ürün Kartı
        html += `
            <div class="product-card d-flex justify-content-between align-items-center">
                <div style="flex: 1; padding-right: 10px;">
                    <h6 class="mb-1">${urunAd}</h6>
                    <p class="small text-muted mb-1">${aciklama}</p>
                    <span class="price-tag">${fiyat} TL</span>
                </div>
                <button class="btn btn-add" onclick="addToCart('${urunAd.replace(/'/g, "\\'")}', ${fiyat})">Ekle</button>
            </div>`;
    }
    document.getElementById('menu-container').innerHTML = html || '<p class="text-center mt-5">Ürün bulunamadı.</p>';
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
    document.getElementById('cust-name').value = localStorage.getItem('bingol_user_name') || '';
    document.getElementById('cust-phone').value = localStorage.getItem('bingol_user_phone') || '';
    document.getElementById('cust-address').value = localStorage.getItem('bingol_user_address') || '';
    
    new bootstrap.Modal(document.getElementById('orderModal')).show();
}

function sendWhatsApp() {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const address = document.getElementById('cust-address').value;
    const note = document.getElementById('cust-note').value;

    if(!name || !address || !phone) return alert("Lütfen eksik alanları doldurun!");

    localStorage.setItem('bingol_user_name', name);
    localStorage.setItem('bingol_user_phone', phone);
    localStorage.setItem('bingol_user_address', address);

    let message = `*BİNGÖLLÜ DÖNER - YENİ SİPARİŞ*\n--------------------------\n`;
    cart.forEach(item => message += `• ${item.name} - ${item.price} TL\n`);
    message += `--------------------------\n*TOPLAM:* ${document.getElementById('total-price').innerText} TL\n\n`;
    message += `*MÜŞTERİ:* ${name}\n*TELEFON:* ${phone}\n*ADRES:* ${address}\n`;
    if(note) message += `*NOT:* ${note}`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}
