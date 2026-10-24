const form = document.getElementById('rideForm');
const list = document.getElementById('requestsList');
const message = document.getElementById('formMessage');
const dateInput = document.getElementById('pickupDate');
const STORAGE_KEY = 'picopride-demo-requests';

document.getElementById('year').textContent = new Date().getFullYear();
dateInput.min = new Date().toISOString().slice(0, 10);

const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
menuToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

function getRequests() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveRequests(requests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}
function formatDate(value) {
  if (!value) return 'Fecha pendiente';
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat('es-GT', {day:'numeric', month:'short', year:'numeric'}).format(date);
}
function renderRequests() {
  const requests = getRequests();
  if (!requests.length) {
    list.innerHTML = '<div class="empty-state"><span>📦</span><p>Aún no hay solicitudes. Completa el formulario para probar la aplicación.</p></div>';
    return;
  }
  list.innerHTML = requests.slice().reverse().map(request => `
    <article class="request-item">
      <div class="request-item-top">
        <h3>${escapeHTML(request.product)}</h3>
        <span class="request-status">Solicitud creada</span>
      </div>
      <div class="request-route">📍 ${escapeHTML(request.origin)} <strong>→</strong> ${escapeHTML(request.destination)}</div>
      <div class="request-meta">
        <span>👤 ${escapeHTML(request.name)}</span>
        <span>📦 ${escapeHTML(request.load)}</span>
        <span>🛻 ${escapeHTML(request.vehicle)}</span>
      </div>
      <div class="request-date">Recogida: ${escapeHTML(formatDate(request.date))} · Código: ${escapeHTML(request.id)}</div>
    </article>`).join('');
}
form.addEventListener('submit', event => {
  event.preventDefault();
  message.className = 'form-message';
  message.textContent = '';
  if (!form.reportValidity()) return;

  const data = Object.fromEntries(new FormData(form).entries());
  const request = {
    ...data,
    id: `PR-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString()
  };
  try {
    const requests = getRequests();
    requests.push(request);
    saveRequests(requests);
    renderRequests();
    message.textContent = `¡Solicitud creada! Tu código de demostración es ${request.id}. Puedes verla en “Solicitudes recientes”.`;
    message.className = 'form-message success';
    form.reset();
    dateInput.min = new Date().toISOString().slice(0, 10);
    document.getElementById('mis-solicitudes').scrollIntoView({behavior:'smooth', block:'start'});
  } catch (error) {
    message.textContent = 'No se pudo guardar la solicitud en este navegador. Revisa el almacenamiento local o prueba en otro navegador.';
    message.className = 'form-message error';
  }
});
document.getElementById('clearRequests').addEventListener('click', () => {
  if (!getRequests().length) {
    message.textContent = 'No hay solicitudes para eliminar.';
    message.className = 'form-message error';
    return;
  }
  if (window.confirm('¿Seguro que quieres borrar todas las solicitudes guardadas en este navegador?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderRequests();
    message.textContent = 'Se limpiaron las solicitudes guardadas en este navegador.';
    message.className = 'form-message success';
  }
});
renderRequests();
