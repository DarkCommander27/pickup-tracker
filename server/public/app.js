// Frontend app.js - consolidated and cleaned

// Helper to escape HTML
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

// wrapper for admin fetches to show a friendly message on 401
async function fetchAdmin(path, opts) {
  const res = await fetch(path, opts);
  if (res.status === 401) {
    try { const j = await res.json(); } catch(e) {}
    toast('Admin login required — click to log in', 6000, () => { window.location.href = '/admin.html'; });
    throw new Error('unauthorized');
  }
  if (!res.ok) throw new Error('API error ' + res.status);
  return res.json();
}

function toast(msg, ms = 2500, action) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.style.display = 'block';
  if (action) {
    t.style.cursor = 'pointer';
    const handler = () => { try { action(); } finally { t.removeEventListener('click', handler); } };
    t.addEventListener('click', handler);
  } else {
    t.style.cursor = 'default';
  }
  setTimeout(() => { t.style.display = 'none'; if (action) t.style.cursor = 'default'; }, ms);
}

// --- Persons (admin only) ---
async function loadPeople() {
  const el = document.getElementById('people');
  if (!el) return;
    try {
      const people = await fetchAdmin('/admin/persons');
    el.innerHTML = people.map(p => `<div class="person-row"><div><strong>${escapeHtml(p.name)}</strong></div><div><button data-id="${p.id}" class="del secondary">Delete</button></div></div>`).join('');
    el.querySelectorAll('.del').forEach(btn => btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      try {
        await fetchAdmin(`/admin/persons/${id}`, { method: 'DELETE' });
        toast('Person deleted');
        loadPeople();
      } catch (err) { /* handled in fetchAdmin */ }
    }));
  } catch (err) {
    console.error('loadPeople', err);
  }
}

// Hook up person form (admin)
const personForm = document.getElementById('personForm');
if (personForm) {
  personForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameEl = document.getElementById('name');
    const name = nameEl.value.trim();
    if (!name) return toast('Name required');
    try {
      await fetchAdmin('/admin/persons', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name }) });
      nameEl.value = '';
      toast('Person added');
      loadPeople();
    } catch (err) {
      /* fetchAdmin already toasts */
    }
  });
}

// --- Pickup wizard and signing (client-facing) ---
async function setupPickupPage() {
  // If there is a person select (admin-ish), populate from admin persons
  const select = document.getElementById('personSelect');
  if (select) {
    try {
      const people = await fetchAdmin('/admin/persons');
      select.innerHTML = '<option value="">-- new person --</option>' + people.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
      select.addEventListener('change', (e) => {
        const id = e.target.value;
        if (!id) return;
        const person = people.find(p => String(p.id) === String(id));
        if (person) document.getElementById('name').value = person.name;
      });
    } catch (err) {
      console.warn('Could not load people for select (admin only).');
    }
  }

  // date autofill: YYYY-MM-DD
  const dateInput = document.getElementById('date');
  if (dateInput) dateInput.value = new Date().toISOString().slice(0,10);

  // signature canvas
  const canvas = document.getElementById('sig');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    let drawing = false; let last = null;
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
    const clearBtn = document.getElementById('clearSig');
    if (clearBtn) clearBtn.addEventListener('click', () => { ctx.clearRect(0,0,canvas.width,canvas.height); });

    // Wizard navigation
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const progressEl = document.getElementById('progress');
    function setStep(n) {
      if (step1) step1.style.display = n===1 ? 'block' : 'none';
      if (step2) step2.style.display = n===2 ? 'block' : 'none';
      if (step3) step3.style.display = n===3 ? 'block' : 'none';
      if (progressEl) progressEl.style.width = (n===1?33:(n===2?66:100)) + '%';
    }
    const toStep2 = document.getElementById('toStep2');
    if (toStep2) toStep2.addEventListener('click', () => {
      const name = document.getElementById('name').value.trim();
      const date = document.getElementById('date').value.trim();
      if (!name || !date) { toast('Name and date required'); return; }
      setStep(2);
    });
    const backTo1 = document.getElementById('backTo1'); if (backTo1) backTo1.addEventListener('click', () => setStep(1));
    const toStep3 = document.getElementById('toStep3'); if (toStep3) toStep3.addEventListener('click', () => setStep(3));
    const backTo2 = document.getElementById('backTo2'); if (backTo2) backTo2.addEventListener('click', () => setStep(2));

    const saveBtn = document.getElementById('save');
    if (saveBtn) saveBtn.addEventListener('click', async () => {
      const name = document.getElementById('name').value.trim();
      const date = document.getElementById('date').value.trim();
      const notesEl = document.getElementById('notes');
      const notes = notesEl ? notesEl.value.trim() : '';
      const items = [];
      if (document.getElementById('itemFood') && document.getElementById('itemFood').checked) items.push('Food');
      if (document.getElementById('itemHousehold') && document.getElementById('itemHousehold').checked) items.push('Household Items');
      if (document.getElementById('itemClothes') && document.getElementById('itemClothes').checked) items.push('Clothes');
      if (!name || !date) return alert('Name and date required');
      const signature = canvas.toDataURL('image/png');
      await fetch('/api/pickups/sign', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name, date, notes, signature, items }) });
      toast('Saved pickup');
      // clear
      document.getElementById('name').value = '';
      if (notesEl) notesEl.value = '';
      if (document.getElementById('itemFood')) document.getElementById('itemFood').checked = false;
      if (document.getElementById('itemHousehold')) document.getElementById('itemHousehold').checked = false;
      if (document.getElementById('itemClothes')) document.getElementById('itemClothes').checked = false;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      setStep(1);
    });
  }
}

// --- Pickups list (admin or public) ---
async function loadPickupsList() {
  const el = document.getElementById('list');
  if (!el) return;
  try {
    const pickups = await api('/api/pickups');
    el.innerHTML = `<table class="table"><thead><tr><th>Name</th><th>Date</th><th>Items</th><th>Signature</th></tr></thead><tbody>` + pickups.map(p => `<tr><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.date)}</td><td>${escapeHtml((p.items||[]).join(', '))}</td><td>${p.signature?`<img class="sig-preview" src="${escapeHtml(p.signature)}" />`:'-'}</td></tr>`).join('') + `</tbody></table>`;
    el.querySelectorAll('.sig-preview').forEach(img => img.addEventListener('click', (e)=>{ const w = window.open(''); w.document.write(`<img src="${e.target.src}" style="max-width:100%">`); }));
  } catch (err) {
    console.error('loadPickupsList', err);
  }
}

// Auto-run page-specific setup
document.addEventListener('DOMContentLoaded', () => {
  // If on persons/admin page
  if (document.getElementById('people')) loadPeople();
  if (document.getElementById('personForm')) { /* form handler already wired above via element reference */ }
  if (document.getElementById('wizard')) setupPickupPage();
  if (document.getElementById('list')) loadPickupsList();
});
// end of app.js - all page-specific setup is above
