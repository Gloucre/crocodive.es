// URL pública en formato CSV de tu hoja de Google Sheets
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTO8csb4MxNMokFXjOYc4uLOpOdtd7XSQGppq8qIfAn-RI2wJtEmKdBpjysa38cuymoBxKOmBYXKs7L/pub?output=csv';

// Procesa cada línea del CSV respetando textos con comillas y comas internas
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Descarga la hoja de cálculo y genera las filas de la tabla de calendario
async function cargarSalidasDesdeGoogleSheets() {
  const tbody = document.getElementById('tabla-salidas');
  if (!tbody) return;

  try {
    const respuesta = await fetch(SHEET_CSV_URL);
    if (!respuesta.ok) throw new Error('No se pudo descargar la hoja de cálculo');
    
    const textoCSV = await respuesta.text();
    const lineas = textoCSV.split(/\r?\n/).filter(l => l.trim() !== '');

    if (lineas.length <= 1) {
      tbody.innerHTML = '<tr><td colspan="6" class="ctr">No hay salidas programadas en este momento.</td></tr>';
      return;
    }

    // Omitir la fila 1 (cabeceras de columnas)
    const filasData = lineas.slice(1);
    tbody.innerHTML = '';

    filasData.forEach(linea => {
      const columnas = parseCSVLine(linea);
      const [fecha, actividad, salida, modalidad, nivel, estado, link] = columnas;

      if (!fecha && !actividad) return;

      const estadoTexto = (estado || '').toLowerCase();
      const esCompleto = estadoTexto.includes('completo') || estadoTexto.includes('lleno');
      
      let botonHTML = '';
      if (esCompleto) {
        botonHTML = '<span style="color:#ef4444; font-weight:700;">COMPLETO</span>';
      } else {
        const urlReserva = link && link.startsWith('http') 
          ? link 
          : `https://wa.me/34643194499?text=Hola,%20quiero%20reservar:%20${encodeURIComponent(actividad || 'Salida de buceo')}`;
        botonHTML = `<a class="btn s" href="${urlReserva}" target="_blank" rel="noopener">Reservar</a>`;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${fecha || ''}</td>
        <td><b>${actividad || ''}</b></td>
        <td>${salida || ''}</td>
        <td>${modalidad || ''}</td>
        <td>${nivel || ''}</td>
        <td>${botonHTML}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error cargando las salidas:', error);
    tbody.innerHTML = '<tr><td colspan="6" class="ctr">No se pudieron cargar las salidas en este momento.</td></tr>';
  }
}

// Inicialización de todas las funciones al cargar el documento
document.addEventListener('DOMContentLoaded', function () {
  // 1. Control del menú hamburguesa móvil
  const t = document.querySelector('.tg');
  const l = document.querySelector('.links');
  if (t && l) {
    t.addEventListener('click', function () {
      const o = l.classList.toggle('open');
      t.setAttribute('aria-expanded', o);
    });
  }

  // 2. Año actual automático en el footer
  const y = document.getElementById('y');
  if (y) {
    y.textContent = new Date().getFullYear();
  }

  // 3. Preselección de opción en desplegable por parámetro de URL (?i=...)
  const q = new URLSearchParams(window.location.search).get('i');
  const s = document.querySelector('select[name="Interés"]');
  if (q && s) {
    for (let i = 0; i < s.options.length; i++) {
      if (s.options[i].text === q) {
        s.selectedIndex = i;
        break;
      }
    }
  }

  // 4. Envío de formularios a WhatsApp
  document.querySelectorAll('form[data-wa]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      let m = 'Hola, soy de la web de Crocodive.';
      new FormData(f).forEach(function (v, k) {
        if (v) m += '\n' + k + ': ' + v;
      });
      window.open('https://wa.me/34643194499?text=' + encodeURIComponent(m), '_blank', 'noopener');
      const o = f.querySelector('.ok');
      if (o) o.textContent = 'Abriendo WhatsApp con tu solicitud…';
    });
  });

  // 5. Carga dinámica del calendario desde Google Sheets
  cargarSalidasDesdeGoogleSheets();
});
