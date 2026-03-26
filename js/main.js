let ingatlanok = [];
let torlendoId = null;

function szamotTagol(szam) {
    return szam.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
fetch("navbar.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("navbar").innerHTML = data;
  });

fetch("footer.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("footer").innerHTML = data;
  });
async function betoltes() {
    try {
        let tarolt = JSON.parse(localStorage.getItem("ingatlanok")) || [];

        if (tarolt.length === 0) {
            const response = await fetch('./db/ingatlanok.json');
            let alap = await response.json();
            
            localStorage.setItem("ingatlanok", JSON.stringify(alap));

            ingatlanok = alap; 
        }
        else 
        {
            ingatlanok = tarolt;
        }

        if (document.getElementById("kiemelt-ingatlanok")) {
            megjeleniteskiemelt(ingatlanok);
        }

        if (document.getElementById("ingatlan-lista")) {
            megjelenites(ingatlanok); 
        }

    } catch (error) {
        console.error("Hiba:", error);
    }
}
function formatDatum(datum) {
    const d = new Date(datum);
    return d.toLocaleDateString('hu-HU');
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
                </div>
                <div class="card-body">
                    <h5 class="card-title">${i.cim}</h5>
                    <p class="text-muted mb-2">${i.telepules}</p>
                    <span class="tipus-badge">${i.tipus.toUpperCase()}</span>
                    <div class="ar-badge fw-bold mb-2">${szamotTagol(i.ar)} Ft</div>
                    <p class="card-text">${i.leiras ? (i.leiras.length > 100 ? i.leiras.substring(0, 100) + '...' : i.leiras) : ''}</p>
                    <p class="text-muted small mb-0">Hozzáadva: ${formatDatum(i.datum)}</p>                
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

    const torlesModalText = document.getElementById('torlesModalText');
    torlesModalText.textContent = `Biztosan törölni szeretné ezt az ingatlant?\n${ingatlan.cim}`;

    const modal = new bootstrap.Modal(document.getElementById('torlesModal'));
    modal.show();

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    confirmDeleteBtn.onclick = function() {
        torles();  
        modal.hide();  
    };
}

function torles() {
    if (torlendoId === null) return;

    ingatlanok = ingatlanok.filter(i => i.id !== torlendoId);
    localStorage.setItem("ingatlanok", JSON.stringify(ingatlanok));  

    megjelenites(ingatlanok);
    torlendoId = null;
}
document.getElementById("ingatlan-form")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const uj = {
        id: Date.now(),
        cim: document.getElementById("cim").value,
        telepules: document.getElementById("telepules").value,
        tipus: document.getElementById("tipus").value,
        alapterulet: parseInt(document.getElementById("alapterulet").value),
        szobak: parseInt(document.getElementById("szobak").value),
        ar: parseInt(document.getElementById("ar").value),
        leiras: document.getElementById("leiras").value,
        kep: document.getElementById("kep").value || "https://via.placeholder.com/400x300",
        datum: new Date().toISOString()
    };

    let tarolt = JSON.parse(localStorage.getItem("ingatlanok")) || [];
    tarolt.push(uj);

    localStorage.setItem("ingatlanok", JSON.stringify(tarolt));

    const modal = new bootstrap.Modal(document.getElementById('sikerModal'));
    modal.show();

    this.reset();
});
function showModal() {
    const nev = document.getElementById("nev");
    const email = document.getElementById("email");
    const uzenet = document.getElementById("uzenet");

    let valid = true;

    if (nev.value.trim() === "") {
        document.getElementById("nevHiba").classList.remove("d-none");
        valid = false;
    } else {
        document.getElementById("nevHiba").classList.add("d-none");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        document.getElementById("emailHiba").classList.remove("d-none");
        valid = false;
    } else {
        document.getElementById("emailHiba").classList.add("d-none");
    }

    if (uzenet.value.trim() === "") {
        document.getElementById("uzenetHiba").classList.remove("d-none");
        valid = false;
    } else {
        document.getElementById("uzenetHiba").classList.add("d-none");
    }

    if (valid) {
        const myModal = new bootstrap.Modal(document.getElementById('hirlapModal'));
        myModal.show();

        nev.value = "";
        email.value = "";
        uzenet.value = "";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    betoltes();
});