let ingatlanok = [];
let torlendoId = null;

function szamotTagol(szam) {
    return szam.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

async function betoltes() {
    try {
        const response = await fetch('./db/ingatlanok.json');
        ingatlanok = await response.json();

        if (document.getElementById("kiemelt-ingatlanok")) {
            megjeleniteskiemelt(ingatlanok);
        }

        if (document.getElementById("ingatlan-lista")) {
            megjelenites(ingatlanok); 
        }

    } catch (error) {
        console.error("Hiba a betöltés során:", error);
    }
}

function megjelenites(lista) {
    const container = document.getElementById("ingatlan-lista");
    const nincs = document.getElementById("nincs-talalat");
    if (!container || !nincs) return;

    document.getElementById("talalat-szam").textContent = lista.length;

    if (lista.length === 0) {
        container.innerHTML = "";
        nincs.classList.remove("d-none");
        return;
    } else {
        nincs.classList.add("d-none");
    }

    container.innerHTML = "";

    lista.forEach(i => {
        const div = document.createElement("div");
        div.className = "col-md-4";

        div.innerHTML = `
            <div class="card ingatlan-card h-100">
                <div class="image-container position-relative">
                    <img src="${i.kep}" class="card-img-top" alt="${i.cim}">
                    <span class="tipus-badge position-absolute top-0 start-0 bg-primary text-white px-2 py-1 m-2 rounded">${i.tipus.toUpperCase()}</span>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${i.cim}</h5>
                    <p class="text-muted mb-2">${i.telepules}</p>
                    <div class="ar-badge fw-bold mb-2">${szamotTagol(i.ar)} Ft</div>
                    <p class="card-text">${i.leiras ? (i.leiras.length>100 ? i.leiras.substring(0,100)+'...' : i.leiras) : ''}</p>
                    <button class="btn btn-danger btn-sm mt-2" onclick="torlesModal(${i.id})">Törlés</button>
                </div>
            </div>
        `;

        container.appendChild(div);
    });
}
function megjeleniteskiemelt(lista) {
    const kiemelt = document.getElementById("kiemelt-ingatlanok");

    if (!kiemelt) return;

    document.getElementById("talalat-szam").textContent = lista.length;

    kiemelt.innerHTML = "";

    lista.slice(0, 3).forEach(i => {
        const div = document.createElement("div");
        div.className = "col-md-4";

        div.innerHTML = `
            <div class="card ingatlan-card h-100">
                <img src="${i.kep}" class="card-img-top" alt="${i.cim}">
                <div class="card-body">
                    <h5 class="card-title">${i.cim}</h5>
                    <p class="text-muted mb-2">${i.telepules}</p>
                    <div class="ar-badge fw-bold mb-2">${szamotTagol(i.ar)} Ft</div>
                    <p class="card-text">${i.leiras ? (i.leiras.length>100 ? i.leiras.substring(0,100)+'...' : i.leiras) : ''}</p>
                </div>
            </div>
        `;

        kiemelt.appendChild(div);
    });
}
function kereses() {
    const telepules = document.getElementById("search-telepules").value.toLowerCase();
    const tipus = document.getElementById("search-tipus").value;
    const maxAr = parseInt(document.getElementById("search-ar")?.value) || Infinity;
    const minSzobak = parseInt(document.getElementById("search-szobak")?.value) || 0;

    const szurt = ingatlanok.filter(i =>
        i.telepules.toLowerCase().includes(telepules) &&
        (!tipus || i.tipus === tipus) &&
        i.ar <= maxAr &&
        i.szobak >= minSzobak
    );

    megjelenites(szurt);
}

function szuresReset() {
    document.getElementById("search-telepules").value = "";
    document.getElementById("search-tipus").value = "";
    document.getElementById("search-ar").value = "";
    document.getElementById("search-szobak").value = "";
    megjelenites(ingatlanok);
}

function rendezesValtas() {
    const mod = document.getElementById("rendezes")?.value;
    let rendezett = [...ingatlanok];

    switch(mod) {
        case 'ar-novekvo': rendezett.sort((a,b)=>a.ar-b.ar); break;
        case 'ar-csokkeno': rendezett.sort((a,b)=>b.ar-a.ar); break;
        case 'terulet-novekvo': rendezett.sort((a,b)=>a.alapterulet-b.alapterulet); break;
        case 'terulet-csokkeno': rendezett.sort((a,b)=>b.alapterulet-a.alapterulet); break;
        case 'datum': rendezett.sort((a,b)=>new Date(b.datum)-new Date(a.datum)); break;
    }
    megjelenites(rendezett);
}

function torlesModal(id) {
    torlendoId = id;
    const ingatlan = ingatlanok.find(i => i.id === id);
    if (!ingatlan) return;

    const confirmDelete = confirm(`Biztosan törölni szeretné ezt az ingatlant?\n${ingatlan.cim}`);
    if (confirmDelete) torles();
}

function torles() {
    if (torlendoId === null) return;

    ingatlanok = ingatlanok.filter(i => i.id !== torlendoId);
    megjelenites(ingatlanok);
    torlendoId = null;
}
function ujhirdetes() {
    const mentes = document.getElementById("mentes");
    
}
document.addEventListener("DOMContentLoaded", () => {
    betoltes();
});