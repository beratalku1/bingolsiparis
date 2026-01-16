// AYARLAR
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQentwjOm1FHCk0IIDLVau_oeD_mUv2qUvOgikWcJgpypTkGaiC1C_pJ-Z8CVorR9K0iraEwuQAvoou/pub?gid=0&single=true&output=csv';
const WHATSAPP_NUMBER = '905454254212';

let cart = [];

// Menüyü Google Sheets'ten Çek
fetch(SHEET_URL)
    .then(response => response.text())
    .then(data => {
        if (!data || data.includes("<!DOCTYPE html>")) {
            throw new Error("CSV verisi alınamadı, linki kontrol edin.");
        }
        parseCSV(data);
    })
    .catch(err => {
        console.error("Veri çekilemedi:", err);
        document.getElementById('menu-container').innerHTML = `<p class="text-center mt-5 text-danger">Menü yüklenirken bir hata oluştu. Lütfen bağlantıyı kontrol edin.</p>`;
    });

function parseCSV(csv) {
    // Satırları ayır (hem \n hem \r\n destekler)
    const lines = csv.split(/\r?\n/);
    let html = '';
    let currentCategory = '';

    // İlk satırı (başlıklar) atla ve döngüye gir
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // CSV virgül ile ayrıldığı için parçalara böl
        // Not: Eğer hücre içinde virgül varsa bu basit ayırıcı sorun çıkarabilir
        const columns = line.split(',');
        
        if (columns.length < 3) continue;

        const kategori = columns[0].replace(/"/g, '').trim();
        const urunAd = columns[1].replace(/"/g, '').trim();
        const fiyat = columns[2].replace(/"/g, '').trim();
        const aciklama = columns[3] ? columns[3].replace(/"/g, '').trim() : '';

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
    }

    if (html === '') {
        document.getElementById('menu-container').innerHTML = `<p class="text-center mt-5">Henüz ürün bulunamadı.</p>`;
    } else {
        document.getElementById('menu-container').innerHTML = html;
    }
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
    const savedName = localStorage.getItem('bingol_user_name');
    const savedPhone = localStorage.getItem('bingol_user_phone');
    const savedAddress = localStorage.getItem('bingol_user_address');

    if (savedName) document.getElementById('cust-name').value = savedName;
    if (savedPhone) document.getElementById('cust-phone').value = savedPhone;
    if (savedAddress) document.getElementById('cust-address').value = savedAddress;

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

    localStorage.setItem('bingol_user_name', name);
    localStorage.setItem('bingol_user_phone', phone);
    localStorage.setItem('bingol_user_address', address);

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
