let ingatlanok = [];

async function ingatlanokBetoltes() {
    try {
        const response = await fetch('./db/ingatlanok.json');
        ingatlanok = await response.json();

        const kiemelt = ingatlanok.slice(0, 3);
        const container = document.getElementById('kiemelt-ingatlanok');

        container.innerHTML = ''; // töröljük a spinner-t

        kiemelt.forEach(ingatlan => {
            const kartya = document.createElement("div");
            kartya.className = "col-md-6 col-lg-4 mb-4";
            kartya.innerHTML = `
            <div class="card ingatlan-card h-100">
                <div class="image-container position-relative">
                    <img src="${ingatlan.kep}" class="card-img-top" alt="${ingatlan.cim}">
                    <span class="tipus-badge position-absolute top-0 start-0 bg-primary text-white px-2 py-1 m-2 rounded">${ingatlan.tipus.toUpperCase()}</span>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${ingatlan.cim}</h5>
                    <p class="text-muted mb-2"><i class="bi bi-map"></i> ${ingatlan.telepules}</p>
                    <div class="ar-badge fw-bold mb-2">${new Intl.NumberFormat('hu-HU', {style: 'currency', currency: 'HUF', maximumFractionDigits: 0}).format(ingatlan.ar)}</div>
                    <div class="property-meta mb-2">
                        <span class="property-meta-item me-3"><i class="bi bi-maximize"></i> ${ingatlan.alapterulet} m²</span>
                        <span class="property-meta-item"><i class="bi bi-bed"></i> ${ingatlan.szobak > 0 ? ingatlan.szobak + ' szoba' : 'N/A'}</span>
                    </div>
                    <p class="card-text">${ingatlan.leiras.substring(0,100)}${ingatlan.leiras.length > 100 ? '...' : ''}</p>
                </div>
            </div>`;
            container.appendChild(kartya);
        });

        document.getElementById('stat-ingatlan').textContent = ingatlanok.length;
    } catch (err) {
        console.error("Hiba a betöltés során:", err);
        const container = document.getElementById('kiemelt-ingatlanok');
        container.innerHTML = '<p class="text-danger">Hiba történt az ingatlanok betöltése során.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ingatlanokBetoltes();
});