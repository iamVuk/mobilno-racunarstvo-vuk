
const API_KEY = "AIzaSyDyx936Vc2KWtxQo1hZg2VVnKVSniF1dnk";
const DATABASE_URL = "https://mediatrack-76591-default-rtdb.firebaseio.com";


const authCard = document.getElementById('authCard');
const appCard = document.getElementById('appCard');
const emailEl = document.getElementById('email');
const passEl = document.getElementById('pass');
const authErr = document.getElementById('authErr');
const titleEl = document.getElementById('title');
const noteEl = document.getElementById('note');
const statusEl = document.getElementById('status');
const listEl = document.getElementById('list');
const crudErr = document.getElementById('crudErr');
const helloNote = document.getElementById('helloNote');


document.getElementById('btnSignIn').onclick = signIn;
document.getElementById('btnSignUp').onclick = signUp;
document.getElementById('btnAdd').onclick = addItem;
document.getElementById('btnSignOut').onclick = signOut;


let idToken = localStorage.getItem('idToken') || '';
let uid = localStorage.getItem('uid') || '';
if (idToken && uid) { showApp(); listItems(); }


async function signUp() {
    authErr.textContent = '';
    try {
        const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: emailEl.value,
                password: passEl.value,
                returnSecureToken: true
            })
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
            body: JSON.stringify({
                email: emailEl.value,
                password: passEl.value,
                returnSecureToken: true
            })
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
    appCard.style.display = 'none';
    authCard.style.display = 'block';
}

function showApp() {
    authCard.style.display = 'none';
    appCard.style.display = 'block';
    helloNote.textContent = `Prijavljen: ${emailEl.value || 'korisnik'}`;
}


async function listItems() {
    crudErr.textContent = '';
    listEl.innerHTML = '';
    try {
        const url = `${DATABASE_URL}/users/${uid}/media.json?auth=${idToken}`;
        const r = await fetch(url);
        const j = await r.json();
        const items = j ? Object.entries(j).map(([id, v]) => ({ id, ...v })) : [];
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        for (const it of items) renderItem(it);
        if (!items.length) {
            const empty = document.createElement('ion-item');
            empty.innerHTML = `<ion-label><p>Nema filmova. Dodaj prvi iznad.</p></ion-label>`;
            listEl.appendChild(empty);
        }
    } catch (e) { crudErr.textContent = e.message; }
}

async function addItem() {
    crudErr.textContent = '';
    const payload = {
        title: titleEl.value || '',
        note: noteEl.value || '',
        status: statusEl.value || 'PLANIRAM',
        createdAt: Date.now()
    };
    try {
        const url = `${DATABASE_URL}/users/${uid}/media.json?auth=${idToken}`;
        const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!r.ok) throw new Error('Dodavanje nije uspelo');
        titleEl.value = ''; noteEl.value = ''; statusEl.value = 'PLANIRAM';
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

function renderItem(it) {
    const li = document.createElement('ion-item');


    let badgeColor = '#60a5fa'; 
    if (it.status === 'GLEDAM') badgeColor = '#fbbf24'; 
    if (it.status === 'GOTOVO') badgeColor = '#22c55e'; 

    li.innerHTML = `
    <ion-label>
      <h2>${escapeHtml(it.title || '(bez naslova)')}</h2>
      ${it.note ? `<p>${escapeHtml(it.note)}</p>` : ''}
      <ion-badge style="background:${badgeColor};color:white;padding:4px 8px;border-radius:6px;">${it.status || 'PLANIRAM'}</ion-badge>
    </ion-label>
    <ion-button color="danger" fill="clear" size="small" data-action="del">Obriši</ion-button>
  `;

    li.querySelector('[data-action="del"]').onclick = () => {
        if (confirm('Da li sigurno želiš da obrišeš ovaj film?')) removeItem(it.id);
    };

    listEl.appendChild(li);
}


function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}
