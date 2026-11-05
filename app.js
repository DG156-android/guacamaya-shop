/**
 * Guacamaya Shop - Aplicación de Gestión de Mercado
 * Lógica principal (app.js)
 */

(() => {
  'use strict';

  // --- 1. CATÁLOGO BASE PREDETERMINADO ---
  const DEFAULT_CATALOG = [
    { store: 'Ara', product: 'Leche Entera 1L', price: 3400, qty: 2, bought: false },
    { store: 'D1', product: 'Huevos AA x30', price: 16500, qty: 1, bought: false },
    { store: 'Ara', product: 'Arroz Diana 1kg', price: 4200, qty: 1, bought: false },
    { store: 'Éxito', product: 'Aceite Vegetal 900ml', price: 9800, qty: 1, bought: false }
  ];

  // --- 2. ESTADO DE LA APLICACIÓN ---
  const state = {
    items: [],
    trm: 4200, // Tasa de respaldo por defecto
    activeStoreFilter: 'ALL',
    editingItemId: null
  };

  const STORAGE_KEY = 'guacamaya_market_items';
  const TRM_STORAGE_KEY = 'guacamaya_trm_value';

  // Formateadores numéricos de moneda
  const copFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  });

  const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function formatCOP(amount) {
    return copFormatter.format(amount || 0);
  }

  function formatUSD(amount) {
    return usdFormatter.format(amount || 0);
  }

  // --- 3. ELEMENTOS DEL DOM ---
  const formItem = document.getElementById('formItem');
  const inputStore = document.getElementById('inputStore');
  const inputProduct = document.getElementById('inputProduct');
  const inputPrice = document.getElementById('inputPrice');
  const inputQty = document.getElementById('inputQty');
  const btnSubmit = document.getElementById('btnSubmit') || document.querySelector('button[type="submit"]');
  const btnCancelEdit = document.getElementById('btnCancelEdit');

  const storeFilterButtons = document.querySelectorAll('.filter-btn');
  const itemsContainer = document.getElementById('itemsContainer');
  const emptyState = document.getElementById('emptyState');

  const totalCopElem = document.getElementById('totalCop');
  const totalUsdElem = document.getElementById('totalUsd');
  const itemsCountElem = document.getElementById('itemsCount');

  const btnBottomExportPdf = document.getElementById('btnBottomExportPdf');
  const btnBottomClearAll = document.getElementById('btnBottomClearAll');
  const toastContainer = document.getElementById('toastContainer');

  // Badge TRM del header
  const trmBadge = document.getElementById('trmValue') || 
                   document.getElementById('trmBadge') || 
                   document.querySelector('.header-trm span') ||
                   document.querySelector('[id*="trm"]');

  // --- 4. GESTIÓN DE NOTIFICACIONES TOAST ---
  let toastTimeout;
  function showToast(message) {
    if (!toastContainer) return;
    toastContainer.textContent = message;
    toastContainer.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastContainer.classList.remove('show');
    }, 3200);
  }

  // --- 5. CONSULTA DE LA TRM (TIEMPO REAL + OFFLINE) ---
  async function fetchTRM() {
    try {
      // Intentar API pública de TRM Colombia
      const res = await fetch('https://trm-colombia.response.workers.dev/', { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.valor) {
          state.trm = Math.round(data.valor);
          localStorage.setItem(TRM_STORAGE_KEY, state.trm);
        }
      }
    } catch (err) {
      console.warn('Usando TRM en caché o por defecto:', err);
      const cachedTRM = localStorage.getItem(TRM_STORAGE_KEY);
      if (cachedTRM) state.trm = parseFloat(cachedTRM);
    } finally {
      // Actualizar la interfaz visual del badge de la TRM
      if (trmBadge) {
        trmBadge.textContent = `$${state.trm.toLocaleString('es-CO')} COP`;
      }
      updateTotalsDisplay();
    }
  }

  // --- 6. PERSISTENCIA (LOCALSTORAGE) ---
  function loadInitialData() {
    try {
      const storedItems = localStorage.getItem(STORAGE_KEY);
      if (storedItems) {
        state.items = JSON.parse(storedItems);
      } else {
        // Cargar catálogo inicial por defecto si es primera instalación
        state.items = DEFAULT_CATALOG.map((item, idx) => ({
          ...item,
          id: `${Date.now()}_${idx}`
        }));
        saveItemsToStorage();
      }

      const storedTrm = localStorage.getItem(TRM_STORAGE_KEY);
      if (storedTrm) {
        state.trm = parseFloat(storedTrm) || 4200;
      }
    } catch (e) {
      console.error('Error cargando datos locales:', e);
      state.items = DEFAULT_CATALOG;
    }
  }

  function saveItemsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (e) {
      console.error('Error guardando datos:', e);
    }
  }

  // --- 7. CÁLCULO DE TOTALES ---
  function calculateTotals(itemsToSum) {
    const totalCop = itemsToSum.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const totalUsd = state.trm > 0 ? (totalCop / state.trm) : 0;
    return { totalCop, totalUsd };
  }

  function updateTotalsDisplay() {
    const filteredItems = getFilteredItems();
    const { totalCop, totalUsd } = calculateTotals(filteredItems);

    if (totalCopElem) totalCopElem.textContent = formatCOP(totalCop);
    if (totalUsdElem) totalUsdElem.textContent = formatUSD(totalUsd);
    if (itemsCountElem) {
      const count = filteredItems.length;
      itemsCountElem.textContent = `(${count} ${count === 1 ? 'ítem' : 'ítems'})`;
    }
  }

  function getFilteredItems() {
    if (state.activeStoreFilter === 'ALL') {
      return state.items;
    }
    return state.items.filter((i) => i.store.toUpperCase() === state.activeStoreFilter.toUpperCase());
  }

  // --- 8. RENDERIZADO DE LA INTERFAZ ---
  function renderAll() {
    renderList();
    updateTotalsDisplay();
  }

  function renderList() {
    const list = getFilteredItems();
    if (!itemsContainer) return;

    itemsContainer.innerHTML = '';

    if (list.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    list.forEach((item) => {
      const card = document.createElement('div');
      card.className = `item-card ${item.bought ? 'item-bought' : ''}`;
      card.setAttribute('data-id', item.id);

      const subtotal = item.price * item.qty;

      card.innerHTML = `
        <div class="item-left">
          <input type="checkbox" class="item-checkbox" ${item.bought ? 'checked' : ''} />
          <div class="item-details">
            <span class="item-store-badge">${escapeHTML(item.store)}</span>
            <strong class="item-name">${escapeHTML(item.product)}</strong>
            <span class="item-price-unit">${formatCOP(item.price)} × ${item.qty} u.</span>
          </div>
        </div>
        <div class="item-right">
          <span class="item-subtotal">${formatCOP(subtotal)}</span>
          <div class="item-actions">
            <button class="btn-action btn-edit" title="Editar">✏️</button>
            <button class="btn-action btn-delete" title="Eliminar">🗑️</button>
          </div>
        </div>
      `;

      const checkbox = card.querySelector('.item-checkbox');
      if (checkbox) checkbox.addEventListener('change', () => toggleItemBought(item.id));

      const btnEdit = card.querySelector('.btn-edit');
      if (btnEdit) btnEdit.addEventListener('click', () => startEditing(item.id));

      const btnDelete = card.querySelector('.btn-delete');
      if (btnDelete) btnDelete.addEventListener('click', () => deleteSingleItem(item.id));

      itemsContainer.appendChild(card);
    });
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // --- 9. ACCIONES SOBRE PRODUCTOS ---
  function toggleItemBought(id) {
    const item = state.items.find(i => i.id === id);
    if (item) {
      item.bought = !item.bought;
      saveItemsToStorage();
      renderAll();
    }
  }

  function deleteSingleItem(id) {
    state.items = state.items.filter(i => i.id !== id);
    if (state.editingItemId === id) resetFormMode();
    saveItemsToStorage();
    renderAll();
    showToast('Producto eliminado');
  }

  function startEditing(id) {
    const item = state.items.find(i => i.id === id);
    if (!item) return;

    state.editingItemId = id;
    if (inputStore) inputStore.value = item.store;
    if (inputProduct) inputProduct.value = item.product;
    if (inputPrice) inputPrice.value = item.price;
    if (inputQty) inputQty.value = item.qty;

    if (btnSubmit) btnSubmit.textContent = 'Actualizar';
    if (btnCancelEdit) btnCancelEdit.style.display = 'inline-block';
    if (inputProduct) inputProduct.focus();
  }

  function resetFormMode() {
    state.editingItemId = null;
    if (formItem) formItem.reset();
    if (inputQty) inputQty.value = '1';
    if (btnSubmit) btnSubmit.textContent = '¡Agregar a la cesta!';
    if (btnCancelEdit) btnCancelEdit.style.display = 'none';
  }

  // --- 10. VACIAR LISTA (DOBLE PULSACIÓN PARA ANDROID) ---
  let clearConfirmPending = false;
  let clearConfirmTimer = null;

  function clearAllItems() {
    if (!state.items.length) {
      showToast('La lista ya está vacía');
      return;
    }

    if (!clearConfirmPending) {
      clearConfirmPending = true;
      showToast('⚠️ Presiona la papelera otra vez para vaciar');
      clearTimeout(clearConfirmTimer);
      clearConfirmTimer = setTimeout(() => {
        clearConfirmPending = false;
      }, 3500);
      return;
    }

    clearConfirmPending = false;
    clearTimeout(clearConfirmTimer);
    state.items = [];
    state.activeStoreFilter = 'ALL';
    resetFormMode();
    saveItemsToStorage();
    renderAll();
    showToast('🗑️ Toda la lista ha sido vaciada');
  }

  // --- 11. GENERACIÓN Y EXPORTACIÓN DE PDF ---
  async function exportToPDF() {
    if (!state.items.length) {
      showToast('Agrega productos antes de exportar');
      return;
    }

    showToast('Generando PDF...');

    try {
      const jspdfModule = window.jspdf ? window.jspdf.jsPDF : (window.jsPDF || null);
      if (!jspdfModule) {
        showToast('Error: Librería jsPDF no disponible');
        return;
      }

      const doc = new jspdfModule({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      const now = new Date();
      const formattedDate = now.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = now.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const { totalCop, totalUsd } = calculateTotals(state.items);

      // Cabecera superior
      doc.setFillColor(29, 59, 88);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 85, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Guacamaya Shop — Resumen de Mercado', 40, 40);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(220, 235, 245);
      doc.text(`Generado el: ${formattedDate} a las ${formattedTime}`, 40, 60);
      doc.text(`Tasa TRM Aplicada: 1 USD = ${formatCOP(state.trm)} COP`, 40, 74);

      // Filas para la tabla
      const tableRows = state.items.map((item) => [
        item.store,
        `${item.product}${item.bought ? ' (Comprado)' : ''}`,
        formatCOP(item.price),
        String(item.qty),
        formatCOP(item.price * item.qty)
      ]);

      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: 105,
          head: [['Lugar', 'Producto', 'Precio Unit.', 'Cant.', 'Subtotal (COP)']],
          body: tableRows,
          theme: 'striped',
          headStyles: {
            fillColor: [29, 59, 88],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'left'
          },
          columnStyles: {
            2: { halign: 'right' },
            3: { halign: 'center' },
            4: { halign: 'right', fontStyle: 'bold' }
          },
          styles: {
            fontSize: 9.5,
            cellPadding: 7
          },
          margin: { left: 40, right: 40 }
        });
      }

      const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 20 : 200;
      const pageWidth = doc.internal.pageSize.getWidth();

      // Recuadro final con el total general
      doc.setFillColor(29, 59, 88);
      doc.roundedRect(pageWidth - 260, finalY, 220, 62, 8, 8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 183, 3);
      doc.text('TOTAL COP:', pageWidth - 245, finalY + 24);
      doc.text(formatCOP(totalCop), pageWidth - 55, finalY + 24, { align: 'right' });

      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('TOTAL USD:', pageWidth - 245, finalY + 46);
      doc.text(formatUSD(totalUsd), pageWidth - 55, finalY + 46, { align: 'right' });

      const fileName = `guacamaya-mercado-${now.toISOString().slice(0, 10)}.pdf`;
      const pdfBlob = doc.output('blob');

      // Web Share API nativo de Android
      let sharedSuccessfully = false;
      if (navigator.share && window.File) {
        try {
          const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
          if (!navigator.canShare || navigator.canShare({ files: [pdfFile] })) {
            await navigator.share({
              files: [pdfFile],
              title: 'Guacamaya Shop',
              text: `Lista de mercado (${formattedDate})`
            });
            sharedSuccessfully = true;
            showToast('📄 Reporte compartido');
          }
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') return;
        }
      }

      // Descarga por enlace DataURI si no se activó Share
      if (!sharedSuccessfully) {
        const pdfDataUri = doc.output('datauristring');
        const downloadLink = document.createElement('a');
        downloadLink.href = pdfDataUri;
        downloadLink.download = fileName;
        downloadLink.target = '_blank';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        showToast('📄 PDF guardado');
      }
    } catch (err) {
      console.error('Error al generar PDF:', err);
      showToast('Error al crear el archivo PDF');
    }
  }

  // --- 12. EVENT LISTENERS GENERALES ---
  function initListeners() {
    if (formItem) {
      formItem.addEventListener('submit', (e) => {
        e.preventDefault();

        const store = inputStore ? inputStore.value.trim() : 'General';
        const product = inputProduct ? inputProduct.value.trim() : '';
        const price = inputPrice ? (parseFloat(inputPrice.value) || 0) : 0;
        const qty = inputQty ? (parseInt(inputQty.value, 10) || 1) : 1;

        if (!product || price <= 0 || qty <= 0) {
          showToast('Ingresa datos válidos');
          return;
        }

        if (state.editingItemId) {
          const item = state.items.find(i => i.id === state.editingItemId);
          if (item) {
            item.store = store;
            item.product = product;
            item.price = price;
            item.qty = qty;
            showToast('Producto actualizado');
          }
          resetFormMode();
        } else {
          const newItem = {
            id: Date.now().toString(),
            store: store || 'General',
            product,
            price,
            qty,
            bought: false
          };
          state.items.unshift(newItem);
          resetFormMode();
          showToast('Producto agregado');
        }

        saveItemsToStorage();
        renderAll();
      });
    }

    if (btnCancelEdit) {
      btnCancelEdit.addEventListener('click', resetFormMode);
    }

    if (storeFilterButtons) {
      storeFilterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          storeFilterButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.activeStoreFilter = btn.getAttribute('data-filter') || 'ALL';
          renderAll();
        });
      });
    }

    if (btnBottomExportPdf) {
      btnBottomExportPdf.addEventListener('click', exportToPDF);
    }

    if (btnBottomClearAll) {
      btnBottomClearAll.addEventListener('click', clearAllItems);
    }
  }

  // --- 13. INICIALIZACIÓN PROTEGIDA ---
  document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
    initListeners();
    renderAll();
    fetchTRM(); // Se consulta sin bloquear el renderizado
  });
})();
