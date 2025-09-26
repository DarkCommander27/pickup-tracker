// ...existing code...

// HTML escape function to prevent XSS
function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function api(path, opts) {
  const res = await fetch(path, opts);
  if (!res.ok) throw new Error('API error ' + res.status);
  return res.json();
}

function toast(msg, ms = 2500) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, ms);
}

// Persons page
async function loadPeople() {
  const el = document.getElementById('people');
  if (!el) return;
  const people = await api('/api/persons');
  el.innerHTML = people.map(p => `<div><div><strong>${escapeHtml(p.name)}</strong><div class="small muted">${escapeHtml(p.phone)} ${escapeHtml(p.email)} ${escapeHtml(p.address || '')}</div></div><div><button data-id="${p.id}" class="del secondary">Delete</button></div></div>`).join('');
  el.innerHTML = people.map(p => `<div><div><strong>${p.name}</strong><div class="small muted">${p.phone} ${p.email}</div></div><div><button data-id="${p.id}" class="del secondary">Delete</button></div></div>`).join('');
    el.innerHTML = people.map(p => `<div><div><strong>${escapeHtml(p.name)}</strong><div class="small muted">${escapeHtml(p.phone)} ${escapeHtml(p.email)}</div></div><div><button data-id="${p.id}" class="del secondary">Delete</button></div></div>`).join('');
  el.querySelectorAll('.del').forEach(btn => btn.addEventListener('click', async (e) => {
    const id = e.target.getAttribute('data-id');
    await fetch(`/api/persons/${id}`, { method: 'DELETE' });
    toast('Person deleted');
    loadPeople();
  }));
}

// ...existing code...
if (personForm) {
  personForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
  // Address removed
  await fetch('/api/persons', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name, phone, email }) });
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('email').value = '';
  // Address removed
    toast('Person added');
    loadPeople();
  });
}

// Pickup page
async function setupPickupPage() {
  const select = document.getElementById('personSelect');
  if (!select) return;
  const people = await api('/api/persons');
  select.innerHTML = '<option value="">-- new person --</option>' + people.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
  select.addEventListener('change', async (e) => {
    const id = e.target.value;
    if (!id) return; // new person
    const person = people.find(p => String(p.id) === String(id));
    if (person) {
      document.getElementById('name').value = person.name;
  // Address removed
    }
  });

  // date autofill
  const dateInput = document.getElementById('date');
  if (dateInput) dateInput.value = new Date().toISOString().slice(0,10);

  // signature canvas
  const canvas = document.getElementById('sig');
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  let drawing = false;
  let last = null;
  function pos(e) {
    if (e.touches) {
      const t = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    } else {
      return { x: e.offsetX, y: e.offsetY };
    }
  }
  canvas.addEventListener('pointerdown', (e) => { drawing = true; last = pos(e); });
  canvas.addEventListener('pointermove', (e) => { if (!drawing) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; });
  canvas.addEventListener('pointerup', () => drawing = false);
  canvas.addEventListener('pointerleave', () => drawing = false);
  document.getElementById('clearSig').addEventListener('click', () => { ctx.clearRect(0,0,canvas.width,canvas.height); });
  // Wizard navigation
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const progressEl = document.getElementById('progress');
  function setStep(n) {
    step1.style.display = n===1 ? 'block' : 'none';
    step2.style.display = n===2 ? 'block' : 'none';
    step3.style.display = n===3 ? 'block' : 'none';
    const pct = n===1?33:(n===2?66:100);
    if (progressEl) progressEl.style.width = pct + '%';
  }
  document.getElementById('toStep2').addEventListener('click', () => {
    // validate step1
    const name = document.getElementById('name').value.trim();
    const date = document.getElementById('date').value.trim();
    if (!name || !date) { toast('Name and date required'); return; }
    setStep(2);
  });
  document.getElementById('backTo1').addEventListener('click', () => { setStep(1); });
  document.getElementById('toStep3').addEventListener('click', () => { setStep(3); });
  document.getElementById('backTo2').addEventListener('click', () => { setStep(2); });

  document.getElementById('save').addEventListener('click', async () => {
    const name = document.getElementById('name').value.trim();
    const address = document.getElementById('address').value.trim();
    const date = document.getElementById('date').value.trim();
    const notesEl = document.getElementById('notes');
    const notes = notesEl ? notesEl.value.trim() : '';
    const items = [];
    if (document.getElementById('itemFood').checked) items.push('Food');
    if (document.getElementById('itemHousehold').checked) items.push('Household Items');
    if (document.getElementById('itemClothes').checked) items.push('Clothes');
    if (!name || !date) return alert('Name and date required');
    const signature = canvas.toDataURL('image/png');
  await fetch('/api/pickups/sign', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name, date, notes, signature, items }) });
  toast('Saved pickup');
    // clear form and return to step1
    document.getElementById('name').value = '';
  // Address removed
    if (notesEl) notesEl.value = '';
    document.getElementById('itemFood').checked = false;
    document.getElementById('itemHousehold').checked = false;
    document.getElementById('itemClothes').checked = false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    setStep(1);
  });
}

// Pickups list
async function loadPickupsList() {
  const el = document.getElementById('list');
  if (!el) return;
  const pickups = await api('/api/pickups');
  el.innerHTML = `<table class="table"><thead><tr><th>Name</th><th>Date</th><th>Items</th><th>Signature</th></tr></thead><tbody>` + pickups.map(p => `<tr><td>${escapeHtml(p.name)}<div class="small muted">${escapeHtml(p.address||'')}</div></td><td>${escapeHtml(p.date)}</td><td>${escapeHtml((p.items||[]).join(', '))}</td><td>${p.signature?`<img class="sig-preview" src="${escapeHtml(p.signature)}" />`:'-'}</td></tr>`).join('') + `</tbody></table>`;
  el.innerHTML = `<table class="table"><thead><tr><th>Name</th><th>Date</th><th>Items</th><th>Signature</th></tr></thead><tbody>` + pickups.map(p => `<tr><td>${p.name}</td><td>${p.date}</td><td>${(p.items||[]).join(', ')}</td><td>${p.signature?`<img class="sig-preview" src="${p.signature}" />`:'-'}</td></tr>`).join('') + `</tbody></table>`;
    el.innerHTML = `<table class="table"><thead><tr><th>Name</th><th>Date</th><th>Items</th><th>Signature</th></tr></thead><tbody>` + pickups.map(p => `<tr><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.date)}</td><td>${(p.items||[]).join(', ')}</td><td>${p.signature?`<img class="sig-preview" src="${escapeHtml(p.signature)}" />`:'-'}</td></tr>`).join('') + `</tbody></table>`;
  // preview click
  el.querySelectorAll('.sig-preview').forEach(img => img.addEventListener('click', (e)=>{
    const w = window.open(''); w.document.write(`<img src="${e.target.src}" style="max-width:100%">`);
  }));
}

// Init
// ...existing code...

// HTML escape function to prevent XSS
function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function api(path, opts) {
  const res = await fetch(path, opts);
  if (!res.ok) throw new Error('API error ' + res.status);
  return res.json();
}

function toast(msg, ms = 2500) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, ms);
}

// Persons page
async function loadPeople() {
  const el = document.getElementById('people');
  if (!el) return;
  const people = await api('/api/persons');
  el.innerHTML = people.map(p => `<div><div><strong>${escapeHtml(p.name)}</strong><div class="small muted">${escapeHtml(p.phone)} ${escapeHtml(p.email)}</div></div><div><button data-id="${p.id}" class="del secondary">Delete</button></div></div>`).join('');
  el.querySelectorAll('.del').forEach(btn => btn.addEventListener('click', async (e) => {
    const id = e.target.getAttribute('data-id');
    await fetch(`/api/persons/${id}`, { method: 'DELETE' });
    toast('Person deleted');
    loadPeople();
  }));
}

// ...existing code...
if (personForm) {
  personForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    await fetch('/api/persons', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name, phone, email }) });
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('email').value = '';
    toast('Person added');
    loadPeople();
  });
}

// Pickup page
async function setupPickupPage() {
  const select = document.getElementById('personSelect');
  if (!select) return;
  const people = await api('/api/persons');
  select.innerHTML = '<option value="">-- new person --</option>' + people.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
  select.addEventListener('change', async (e) => {
    const id = e.target.value;
    if (!id) return; // new person
    const person = people.find(p => String(p.id) === String(id));
    if (person) {
      document.getElementById('name').value = person.name;
    }
  });

  // date autofill
  const dateInput = document.getElementById('date');
  if (dateInput) dateInput.value = new Date().toISOString().slice(0,10);

  // signature canvas
  const canvas = document.getElementById('sig');
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  let drawing = false;
  let last = null;
  function pos(e) {
    if (e.touches) {
      const t = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    } else {
      return { x: e.offsetX, y: e.offsetY };
    }
  }
  canvas.addEventListener('pointerdown', (e) => { drawing = true; last = pos(e); });
  canvas.addEventListener('pointermove', (e) => { if (!drawing) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; });
  canvas.addEventListener('pointerup', () => drawing = false);
  canvas.addEventListener('pointerleave', () => drawing = false);
  document.getElementById('clearSig').addEventListener('click', () => { ctx.clearRect(0,0,canvas.width,canvas.height); });
  // Wizard navigation
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const progressEl = document.getElementById('progress');
  function setStep(n) {
    step1.style.display = n===1 ? 'block' : 'none';
    step2.style.display = n===2 ? 'block' : 'none';
    step3.style.display = n===3 ? 'block' : 'none';
    const pct = n===1?33:(n===2?66:100);
    if (progressEl) progressEl.style.width = pct + '%';
  }
  document.getElementById('toStep2').addEventListener('click', () => {
    // validate step1
    const name = document.getElementById('name').value.trim();
    const date = document.getElementById('date').value.trim();
    if (!name || !date) { toast('Name and date required'); return; }
    setStep(2);
  });
  document.getElementById('backTo1').addEventListener('click', () => { setStep(1); });
  document.getElementById('toStep3').addEventListener('click', () => { setStep(3); });
  document.getElementById('backTo2').addEventListener('click', () => { setStep(2); });

  document.getElementById('save').addEventListener('click', async () => {
    const name = document.getElementById('name').value.trim();
    const date = document.getElementById('date').value.trim();
    const notesEl = document.getElementById('notes');
    const notes = notesEl ? notesEl.value.trim() : '';
    const items = [];
    if (document.getElementById('itemFood').checked) items.push('Food');
    if (document.getElementById('itemHousehold').checked) items.push('Household Items');
    if (document.getElementById('itemClothes').checked) items.push('Clothes');
    if (!name || !date) return alert('Name and date required');
    const signature = canvas.toDataURL('image/png');
    await fetch('/api/pickups/sign', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name, date, notes, signature, items }) });
    toast('Saved pickup');
    // clear form and return to step1
    document.getElementById('name').value = '';
    if (notesEl) notesEl.value = '';
    document.getElementById('itemFood').checked = false;
    document.getElementById('itemHousehold').checked = false;
    document.getElementById('itemClothes').checked = false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    setStep(1);
  });
}

// Pickups list
async function loadPickupsList() {
  const el = document.getElementById('list');
  if (!el) return;
  const pickups = await api('/api/pickups');
  el.innerHTML = `<table class="table"><thead><tr><th>Name</th><th>Date</th><th>Items</th><th>Signature</th></tr></thead><tbody>` + pickups.map(p => `<tr><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.date)}</td><td>${escapeHtml((p.items||[]).join(', '))}</td><td>${p.signature?`<img class="sig-preview" src="${escapeHtml(p.signature)}" />`:'-'}</td></tr>`).join('') + `</tbody></table>`;
  // preview click
  el.querySelectorAll('.sig-preview').forEach(img => img.addEventListener('click', (e)=>{
    const w = window.open(''); w.document.write(`<img src="${e.target.src}" style="max-width:100%">`);
  }));
}



