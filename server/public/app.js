function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

async function api(path, opts) {
  const res = await fetch(path, opts);
  if (!res.ok) throw new Error('API error ' + res.status);
  return res.json();
}

async function fetchAdmin(path, opts) {
  const res = await fetch(path, opts);
  if (res.status === 401) {
    try { await res.json(); } catch(e) {}
    toast('Admin login required. Redirecting...', 4000, () => { window.location.href = '/admin.html'; });
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

async function loadPeople() {
  const el = document.getElementById('people');
  if (!el) return;
  try {
    const people = await fetchAdmin('/admin/persons');
    if (people.length === 0) {
      el.innerHTML = '<p class="field-hint" style="text-align:center;padding:20px 0">No people added yet.</p>';
      return;
    }
    el.innerHTML = people.map(p => `<div><strong>${escapeHtml(p.name)}</strong><button data-id="${p.id}" class="btn-secondary delete-btn" style="padding:8px 14px;min-height:36px;font-size:13px">Delete</button></div>`).join('');
    el.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      const name = e.target.closest('div').querySelector('strong').textContent;
      if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
      try {
        await fetchAdmin(`/admin/persons/${id}`, { method: 'DELETE' });
        toast('Person deleted');
        loadPeople();
      } catch (err) {}
    }));
  } catch (err) {
    console.error('loadPeople', err);
  }
}

const personForm = document.getElementById('personForm');
if (personForm) {
  personForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameEl = document.getElementById('name');
    const name = nameEl.value.trim();
    if (!name) return toast('Please enter a name.');
    try {
      await fetchAdmin('/admin/persons', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name }) });
      nameEl.value = '';
      toast('Person added');
      loadPeople();
    } catch (err) {}
  });
}

async function setupPickupPage() {
  let savedNames = [];
  let items = [];
  try {
    const config = await fetch('/api/config').then(r => r.json());
    items = config.items || [];
    const people = await fetch('/api/persons').then(r => r.json());
    savedNames = people.map(p => p.name);
  } catch (err) {
    console.warn('Could not load config or persons:', err.message);
  }

  const itemsContainer = document.getElementById('itemsContainer');
  if (itemsContainer && items.length > 0) {
    itemsContainer.innerHTML = items.map(item =>
      `<label><input type="checkbox" value="${escapeHtml(item)}" /> ${escapeHtml(item)}</label>`
    ).join('');
  }

  const nameInput = document.getElementById('name');
  const autocompleteDiv = document.getElementById('nameAutocomplete');
  if (nameInput && autocompleteDiv) {
    nameInput.addEventListener('input', (e) => {
      const value = e.target.value.toLowerCase();
      const matches = savedNames.filter(n => n.toLowerCase().includes(value) && value.length > 0);
      if (matches.length > 0 && value.length > 0) {
        autocompleteDiv.innerHTML = matches.slice(0, 5).map(n =>
          `<div class="autocomplete-item" data-name="${escapeHtml(n)}">${escapeHtml(n)}</div>`
        ).join('');
        autocompleteDiv.style.display = 'block';
        autocompleteDiv.querySelectorAll('.autocomplete-item').forEach(el => {
          el.addEventListener('click', () => {
            nameInput.value = el.dataset.name;
            autocompleteDiv.style.display = 'none';
          });
        });
      } else {
        autocompleteDiv.style.display = 'none';
      }
    });
    document.addEventListener('click', (e) => {
      if (!nameInput.contains(e.target) && !autocompleteDiv.contains(e.target)) {
        autocompleteDiv.style.display = 'none';
      }
    });
  }

  const dateInput = document.getElementById('date');
  if (dateInput) dateInput.value = new Date().toISOString().slice(0,10);

  const canvas = document.getElementById('sig');
  if (!canvas) return;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = 220 * (window.devicePixelRatio || 1);
    canvas.style.height = '220px';
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  resizeCanvas();
  let drawing = false, last = null;

  function pos(e) {
    if (e.touches) {
      const t = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: e.offsetX, y: e.offsetY };
  }

  canvas.addEventListener('pointerdown', (e) => { drawing = true; last = pos(e); canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { if (!drawing) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; });
  canvas.addEventListener('pointerup', () => drawing = false);
  canvas.addEventListener('pointerleave', () => drawing = false);

  document.getElementById('clearSig').addEventListener('click', () => { ctx.clearRect(0,0,canvas.width,canvas.height); });

  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const progressEl = document.getElementById('progress');
  const labels = [document.getElementById('stepLabel1'), document.getElementById('stepLabel2'), document.getElementById('stepLabel3')];

  function setStep(n) {
    step1.style.display = n === 1 ? 'block' : 'none';
    step2.style.display = n === 2 ? 'block' : 'none';
    step3.style.display = n === 3 ? 'block' : 'none';
    progressEl.style.width = (n === 1 ? 33 : n === 2 ? 66 : 100) + '%';
    labels.forEach((l, i) => {
      if (l) l.className = 'step-label' + (i + 1 === n ? ' active' : '');
    });
  }

  document.getElementById('toStep2').addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const date = document.getElementById('date').value.trim();
    if (!name || !date) { toast('Please enter a name and date.'); return; }
    setStep(2);
  });
  document.getElementById('backTo1').addEventListener('click', () => setStep(1));
  document.getElementById('toStep3').addEventListener('click', () => setStep(3));
  document.getElementById('backTo2').addEventListener('click', () => setStep(2));

  document.getElementById('save').addEventListener('click', async () => {
    const name = document.getElementById('name').value.trim();
    const date = document.getElementById('date').value.trim();
    if (!name || !date) return toast('Please enter a name and date.');
    const notesEl = document.getElementById('notes');
    const notes = notesEl ? notesEl.value.trim() : '';
    const items = [];
    document.querySelectorAll('#itemsContainer input[type=checkbox]:checked').forEach(cb => items.push(cb.value));

    if (!savedNames.includes(name)) {
      try {
        await fetch('/api/persons', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name }) });
        savedNames.push(name);
      } catch (err) { console.warn('Could not auto-add person:', err.message); }
    }

    const sigData = canvas.toDataURL('image/png');
    const isBlank = sigData === 'data:image/png;base64,' + 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const signature = isBlank ? null : sigData;

    try {
      await fetch('/api/pickups/sign', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name, date, notes, signature, items }) });
      document.getElementById('wizardCard').style.display = 'none';
      document.getElementById('successName').textContent = name + ' — ' + date;
      document.getElementById('successCard').style.display = 'block';
    } catch (err) {
      toast('Could not save. Check connection and try again.');
    }
  });

  document.getElementById('anotherPickup').addEventListener('click', () => {
    document.getElementById('name').value = '';
    const notesField = document.getElementById('notes');
    if (notesField) notesField.value = '';
    document.getElementById('itemsContainer').querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = false);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dateInput.value = new Date().toISOString().slice(0,10);
    document.getElementById('successCard').style.display = 'none';
    document.getElementById('wizardCard').style.display = 'block';
    setStep(1);
  });
}

async function loadPickupsList() {
  const el = document.getElementById('list');
  if (!el) return;
  try {
    const pickups = await api('/api/pickups');
    if (pickups.length === 0) {
      document.getElementById('emptyState').style.display = 'block';
      el.innerHTML = '';
      return;
    }
    document.getElementById('emptyState').style.display = 'none';
    el.innerHTML = `<table class="table"><thead><tr><th>Name</th><th>Date</th><th>Items</th><th>Signature</th></tr></thead><tbody>` +
      pickups.map(p => `<tr><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.date)}</td><td>${escapeHtml((p.items||[]).join(', '))}</td><td>${p.signature ? '<img class="sig-preview" src="' + escapeHtml(p.signature) + '" />' : '—'}</td></tr>`).join('') +
      `</tbody></table>`;
    let modal = document.getElementById('sigModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sigModal';
      modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;justify-content:center;align-items:center';
      modal.addEventListener('click', () => modal.style.display = 'none');
      const img = document.createElement('img');
      img.id = 'sigModalImg';
      img.style.cssText = 'max-width:90vw;max-height:90vh;border-radius:8px;background:#fff;padding:16px';
      modal.appendChild(img);
      document.body.appendChild(modal);
    }
    el.querySelectorAll('.sig-preview').forEach(img => img.addEventListener('click', () => {
      document.getElementById('sigModalImg').src = img.src;
      modal.style.display = 'flex';
    }));
  } catch (err) {
    console.error('loadPickupsList', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('people')) loadPeople();
  if (document.getElementById('wizard')) setupPickupPage();
  if (document.getElementById('list')) {
    loadPickupsList();
    const refresh = document.getElementById('refresh');
    if (refresh) refresh.addEventListener('click', loadPickupsList);
  }
});
