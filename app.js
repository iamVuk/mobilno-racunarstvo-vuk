// === FORCE LOGOUT preko URL-a (za slučaj "zaglavljene" sesije) ===
if (location.search.includes('logout=1') || location.hash.includes('logout')) {
    try {
        localStorage.removeItem('idToken');
        localStorage.removeItem('uid');
    } catch (e) { }
    history.replaceState(null, '', location.pathname);
}

// === OMDb (Open Movie Database) ===
const OMDB_KEY = "43876d4";
const OMDB_API = "https://www.omdbapi.com/"; // https obavezno

// === Firebase REST konfiguracija ===
const API_KEY = "AIzaSyDyx936Vc2KWtxQo1hZg2VVnKVSniF1dnk";
const DATABASE_URL = "https://mediatrack-76591-default-rtdb.firebaseio.com";

// === DOM elementi ===
const searchEl = document.getElementById('search');
const btnSearch = document.getElementById('btnSearch');
const searchResultsEl = document.getElementById('searchResults');
if (btnSearch) btnSearch.onclick = searchMovies;
if (searchEl) searchEl.addEventListener('keydown', e => { if (e.key === 'Enter') searchMovies(); });

const authCard = document.getElementById('authCard');
const appCard = document.getElementById('appCard');
const emailEl = document.getElementById('email');
const passEl = document.getElementById('pass');
const authErr = document.getElementById('authErr');
const listEl = document.getElementById('list');
const crudErr = document.getElementById('crudErr');
const helloNote = document.getElementById('helloNote');

// Header "Odjava"
const signoutWrap = document.getElementById('signoutWrap');
const btnSignOutTop = document.getElementById('btnSignOutTop');
if (btnSignOutTop) btnSignOutTop.onclick = signOut;

// Donje dugme Odjava
const btnSignOutBottom = document.getElementById('btnSignOut');
if (btnSignOutBottom) btnSignOutBottom.onclick = signOut;

// Dugmad auth
document.getElementById('btnSignIn').onclick = signIn;
document.getElementById('btnSignUp').onclick = signUp;

// Sesija
let idToken = localStorage.getItem('idToken') || '';
let uid = localStorage.getItem('uid') || '';
initSession();

async function initSession() {
    if (!idToken || !uid) { showAuth(); return; }
    const ok = await validateSession(idToken);
    if (ok) { showApp(); listItems(); } else { signOut(); }
}

function showAuth() {
    authCard.style.display = 'block';
    appCard.style.display = 'none';
    if (signoutWrap) signoutWrap.style.display = 'none';
}

function showApp() {
    authCard.style.display = 'none';
    appCard.style.display = 'block';
    if (signoutWrap) signoutWrap.style.display = 'block';
    helloNote.textContent = `Prijavljen: ${emailEl.value || 'korisnik'}`;
}

// === Validacija tokena (Firebase accounts:lookup) ===
async function validateSession(token) {
    try {
        const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token })
        });
        if (!r.ok) return false;
        const j = await r.json();
        if (!Array.isArray(j.users) || j.users.length === 0) return false;

        const found = j.users[0];
        if (typeof found.localId !== 'string' || found.localId !== uid) return false;

        if (found.email) helloNote.textContent = `Prijavljen: ${found.email}`;
        return true;
    } catch {
        return false;
    }
}

// === AUTH (REST) ===
async function signUp() {
    authErr.textContent = '';
    try {
        const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailEl.value, password: passEl.value, returnSecureToken: true })
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?.message || 'Registracija nije uspela');
        idToken = j.idToken; uid = j.localId;
        localStorage.setItem('idToken', idToken);
        localStorage.setItem('uid', uid);
        showApp(); listItems();
    } catch (e) { authErr.textContent = e.message; }
}

async function signIn() {
    authErr.textContent = '';
    try {
        const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailEl.value, password: passEl.value, returnSecureToken: true })
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?.message || 'Prijava nije uspela');
        idToken = j.idToken; uid = j.localId;
        localStorage.setItem('idToken', idToken);
        localStorage.setItem('uid', uid);
        showApp(); listItems();
    } catch (e) { authErr.textContent = e.message; }
}

function signOut() {
    localStorage.removeItem('idToken');
    localStorage.removeItem('uid');
    idToken = ''; uid = '';
    // očisti i pretragu/sugestije da ne ostane otvoreno
    if (searchResultsEl) searchResultsEl.innerHTML = '';
    if (searchEl) searchEl.value = '';
    showAuth();
}

// === CRUD (Firebase REST) ===
async function listItems() {
    crudErr.textContent = '';
    listEl.innerHTML = '';
    try {
        const url = `${DATABASE_URL}/users/${uid}/media.json?auth=${idToken}`;
        const r = await fetch(url);
        if (r.status === 401 || r.status === 403) { signOut(); return; }
        const j = await r.json();
        const items = j ? Object.entries(j).map(([id, v]) => ({ id, ...v })) : [];
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        for (const it of items) renderItem(it);
        if (!items.length) {
            const empty = document.createElement('ion-item');
            empty.innerHTML = `<ion-label><p>Nema filmova. Pretraži iznad i dodaj.</p></ion-label>`;
            listEl.appendChild(empty);
        }
    } catch (e) { crudErr.textContent = e.message; }
}

async function setStatus(id, newStatus) {
    try {
        const url = `${DATABASE_URL}/users/${uid}/media/${id}.json?auth=${idToken}`;
        const r = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (!r.ok) throw new Error('Izmena statusa nije uspela');
        await listItems();
    } catch (e) { crudErr.textContent = e.message; }
}

async function removeItem(id) {
    try {
        const url = `${DATABASE_URL}/users/${uid}/media/${id}.json?auth=${idToken}`;
        const r = await fetch(url, { method: 'DELETE' });
        if (!r.ok) throw new Error('Brisanje nije uspelo');
        await listItems();
    } catch (e) { crudErr.textContent = e.message; }
}

// === OMDb: pretraga + detalji (za opis) ===
async function searchMovies() {
    if (!searchEl) return;
    const q = (searchEl.value || '').trim();

    // ako je polje prazno, zatvori sugestije i izađi
    if (!q) { if (searchResultsEl) searchResultsEl.innerHTML = ''; return; }

    searchResultsEl.innerHTML = '';
    try {
        const url = `${OMDB_API}?apikey=${OMDB_KEY}&type=movie&s=${encodeURIComponent(q)}`;
        const r = await fetch(url);
        if (!r.ok) throw new Error('Pretraga nije uspela');
        const data = await r.json();
        if (data.Response === "False" || !data.Search) {
            const it = document.createElement('ion-item');
            it.innerHTML = `<ion-label><p>Nema rezultata za: <b>${escapeHtml(q)}</b></p></ion-label>`;
            searchResultsEl.appendChild(it);
            return;
        }
        const results = data.Search.slice(0, 8);
        for (const m of results) renderSearchResult(m);
    } catch (e) {
        const it = document.createElement('ion-item');
        it.textContent = e.message;
        searchResultsEl.appendChild(it);
    }
}

function renderSearchResult(m) {
    const title = m.Title || '(bez naziva)';
    const year = m.Year ? `(${m.Year})` : '';
    const posterUrl = (m.Poster && m.Poster !== 'N/A') ? m.Poster : '';

    const it = document.createElement('ion-item');
    it.innerHTML = `
    ${posterUrl ? `<img class="result-poster" src="${posterUrl}" alt="">` : ''}
    <ion-label>
      <div style="font-weight:600">${escapeHtml(title)} ${year}</div>
      <div style="font-size:.85rem;color:#64748b;">IMDb: ${escapeHtml(m.imdbID || '')}</div>
    </ion-label>
    <ion-button class="add-mini" size="small" data-add>➕ Dodaj</ion-button>
  `;

    it.querySelector('[data-add]').onclick = async () => {
        await addFromOmdb(m.imdbID || '', title, posterUrl);
    };

    searchResultsEl.appendChild(it);
}

// Dovuci detalje (Plot) pa upiši u Firebase
async function addFromOmdb(imdbId, fallbackTitle, posterUrl) {
    try {
        let title = fallbackTitle;
        let plot = '';
        if (imdbId) {
            const dUrl = `${OMDB_API}?apikey=${OMDB_KEY}&i=${encodeURIComponent(imdbId)}&plot=short`;
            const dr = await fetch(dUrl);
            if (dr.ok) {
                const dj = await dr.json();
                if (dj && dj.Response !== "False") {
                    title = dj.Title || title;
                    plot = (dj.Plot && dj.Plot !== "N/A") ? dj.Plot : '';
                }
            }
        }
        const payload = {
            title,
            note: plot,          // opis prikazujemo kao "note"
            status: 'PLANIRAM',
            poster: posterUrl || '',
            imdbId: imdbId || '',
            createdAt: Date.now()
        };
        const url = `${DATABASE_URL}/users/${uid}/media.json?auth=${idToken}`;
        const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!r.ok) throw new Error('Dodavanje iz OMDb nije uspelo');

        await listItems();

        // zatvori sugestije i očisti polje
        if (searchResultsEl) searchResultsEl.innerHTML = '';
        if (searchEl) { searchEl.value = ''; searchEl.blur(); }
    } catch (e) {
        alert(e.message);
    }
}

// === render liste ===
function nextStatus(s) {
    const order = ['PLANIRAM', 'GLEDAM', 'GOTOVO'];
    const i = order.indexOf(s);
    return order[(i + 1) % order.length];
}

function renderItem(it) {
    const li = document.createElement('ion-item');
    li.classList.add('media-item'); // za stilove kartice

    // boje statusa
    let badgeColor = '#60a5fa';           // PLANIRAM
    if (it.status === 'GLEDAM') badgeColor = '#fbbf24';
    if (it.status === 'GOTOVO') badgeColor = '#22c55e';

    const poster = it.poster || '';

    li.innerHTML = `
    ${poster ? `<img class="poster-square" src="${poster}" alt="">` : ''}
    <ion-label class="media-content">
      <h2>${escapeHtml(it.title || '(bez naslova)')}</h2>
      ${it.note ? `<div class="media-desc">${escapeHtml(it.note)}</div>` : ''}
      <ion-badge class="status-badge"
        style="background:${badgeColor};color:#fff;padding:4px 10px;border-radius:8px;cursor:pointer;">
        ${it.status || 'PLANIRAM'}
      </ion-badge>
    </ion-label>
    <div class="media-actions">
      <ion-button color="danger" fill="clear" size="small" data-action="del">Obriši</ion-button>
    </div>
  `;

    li.querySelector('.status-badge').onclick = () => {
        const next = nextStatus(it.status || 'PLANIRAM');
        setStatus(it.id, next);
    };

    li.querySelector('[data-action="del"]').onclick = () => {
        if (confirm('Da li sigurno želiš da obrišeš ovaj film?')) removeItem(it.id);
    };

    listEl.appendChild(li);
}

// === helper ===
function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

// === Zatvori sugestije klikom van pretrage/listе rezultata ===
document.addEventListener('click', (e) => {
    const t = e.target;
    const insideResults = searchResultsEl && searchResultsEl.contains(t);
    const onSearchOrBtn = t === searchEl || t === btnSearch;
    if (!insideResults && !onSearchOrBtn) {
        if (searchResultsEl) searchResultsEl.innerHTML = '';
    }
});
