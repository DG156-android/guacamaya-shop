/**
 * ==========================================================================
 * Guacamaya Shop (MercaCuentas) — Lógica Principal de la Aplicación (app.js)
 * Conserva toda la lógica original (D1, Ara, Salsamentaria, catálogo editable,
 * máscara de miles con punto, TRM en tiempo real y PDF) con estética Guacamaya Shop
 * ==========================================================================
 */

(() => {
  'use strict';

  // --- Constantes y Claves de Almacenamiento Local (Idénticas para conservar tus datos) ---
  const STORAGE_KEY_ITEMS = 'mercacuentas_items_v1';
  const STORAGE_KEY_TRM = 'mercacuentas_trm_v1';
  const STORAGE_KEY_CATALOG = 'mercacuentas_catalog_by_store_v2';
  const EXCHANGE_API_URL = 'https://open.er-api.com/v6/latest/USD';
  const DEFAULT_FALLBACK_TRM = 4150;

  const STORES = ['D1', 'Ara', 'Salsamentaria'];

  // --- Catálogo Predeterminado Dividido por Tienda (D1, Ara, Salsamentaria) ---
  const DEFAULT_PRODUCT_CATALOG = [
    // Productos de D1
    { name: 'Café Molido 500g', price: 16500, store: 'D1' },
    { name: 'Arroz Blanco 1kg', price: 4800, store: 'D1' },
    { name: 'Leche Entera 1L (Unidad)', price: 4300, store: 'D1' },
    { name: 'Leche Entera 1L (Sixpack)', price: 24900, store: 'D1' },
    { name: 'Huevos AA x30 unidades', price: 18900, store: 'D1' },
    { name: 'Arepa Blanca x10 unidades', price: 3900, store: 'D1' },
    { name: 'Pan Tajado Integral 450g', price: 5900, store: 'D1' },
    { name: 'Panela Pulverizada 1kg', price: 6200, store: 'D1' },
    { name: 'Pasta Espagueti 500g', price: 3800, store: 'D1' },
    { name: 'Lentejas 500g', price: 4200, store: 'D1' },
    { name: 'Atún en Lomitos en Agua', price: 5400, store: 'D1' },
    { name: 'Papel Higiénico Triple Hoja x12', price: 19900, store: 'D1' },
    { name: 'Detergente Líquido Ropa 2L', price: 15900, store: 'D1' },

    // Productos de Ara
    { name: 'Aceite Vegetal 1L', price: 8900, store: 'Ara' },
    { name: 'Mantequilla con Sal 250g', price: 6800, store: 'Ara' },
    { name: 'Jabón Lavaloza Líquido 750ml', price: 5500, store: 'Ara' },
    { name: 'Azúcar Blanca 1kg', price: 4600, store: 'Ara' },
    { name: 'Chocolate de Mesa 500g', price: 9800, store: 'Ara' },
    { name: 'Frijol Bola Roja 500g', price: 6900, store: 'Ara' },
    { name: 'Avena en Hojuelas 500g', price: 3600, store: 'Ara' },
    { name: 'Galletas Saltín x3 tacos', price: 5200, store: 'Ara' },
    { name: 'Suavizante de Ropa 1L', price: 7900, store: 'Ara' },

    // Productos de Salsamentaria
    { name: 'Pechuga de Pollo 1kg', price: 19500, store: 'Salsamentaria' },
    { name: 'Carne Molida de Res 500g', price: 14500, store: 'Salsamentaria' },
    { name: 'Queso Doble Crema Tajado 500g', price: 14800, store: 'Salsamentaria' },
    { name: 'Queso Costeño 500g', price: 13500, store: 'Salsamentaria' },
    { name: 'Jamón de Cerdo Ahumado 500g', price: 12900, store: 'Salsamentaria' },
    { name: 'Salchicha Llanera 500g', price: 11500, store: 'Salsamentaria' },
    { name: 'Chorizo Santarrosano x5', price: 13000, store: 'Salsamentaria' },
    { name: 'Tocineta Ahumada 250g', price: 12000, store: 'Salsamentaria' }
  ];

  // --- Ilustraciones Temáticas de Mercado para las Tarjetas ---
  const ILLUSTRATIONS = {
    rice: `
      <svg viewBox="0 0 64 64" class="w-12 h-12 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="56" rx="20" ry="4" fill="#E2EBF2"/>
        <path d="M16 26 C12 36, 13 48, 16 54 C22 56, 42 56, 48 54 C51 48, 52 36, 48 26 Z" fill="#D49B54" stroke="#7F4F24" stroke-width="2" stroke-linejoin="round"/>
        <path d="M22 38 Q32 41 42 38" stroke="#A67236" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path d="M20 46 Q32 49 44 46" stroke="#A67236" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path d="M18 25 C20 16, 44 16, 46 25 C40 28, 24 28, 18 25 Z" fill="#FFFFFF" stroke="#7F4F24" stroke-width="1.8"/>
        <path d="M38 19 L49 10 C51 8, 54 11, 52 13 L42 22 Z" fill="#E6B17E" stroke="#7F4F24" stroke-width="1.6"/>
        <ellipse cx="38" cy="20" rx="5" ry="3" transform="rotate(-35 38 20)" fill="#C68B59" stroke="#7F4F24" stroke-width="1.6"/>
        <path d="M15 26 C22 30, 42 30, 49 26" fill="none" stroke="#7F4F24" stroke-width="2.4" stroke-linecap="round"/>
      </svg>
    `,
    dairy: `
      <svg viewBox="0 0 64 64" class="w-12 h-12 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="57" rx="20" ry="3.5" fill="#E2EBF2"/>
        <path d="M17 28 C14 17, 21 13, 25 22 L26 29 Z" fill="#F4A261" stroke="#7F4F24" stroke-width="1.8"/>
        <rect x="25" y="13" width="13" height="18" rx="3" fill="#E0F2FE" stroke="#1D3B58" stroke-width="1.8"/>
        <rect x="27" y="9" width="9" height="4" rx="1.5" fill="#38B6FF" stroke="#1D3B58" stroke-width="1.5"/>
        <rect x="27" y="19" width="9" height="6" fill="#38B6FF"/>
        <path d="M38 28 C39 16, 48 15, 49 23 C49 27, 44 29, 38 28 Z" fill="#588157" stroke="#1D3B58" stroke-width="1.8"/>
        <path d="M15 26 L49 26 L47 55 L17 55 Z" fill="#E0A96D" stroke="#7F4F24" stroke-width="2" stroke-linejoin="round"/>
        <rect x="23" y="35" width="18" height="11" rx="3" fill="#FFFFFF" stroke="#BFD7EA" stroke-width="1.2"/>
      </svg>
    `,
    veggies: `
      <svg viewBox="0 0 64 64" class="w-12 h-12 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="56" rx="20" ry="3.5" fill="#E2EBF2"/>
        <path d="M15 32 C12 20, 20 16, 25 25 L27 33 Z" fill="#F4A261" stroke="#7F4F24" stroke-width="1.8"/>
        <circle cx="33" cy="24" r="8" fill="#588157" stroke="#1D3B58" stroke-width="1.8"/>
        <circle cx="28" cy="26" r="6" fill="#74A12E" stroke="#1D3B58" stroke-width="1.6"/>
        <circle cx="43" cy="28" r="7" fill="#E63946" stroke="#1D3B58" stroke-width="1.8"/>
        <path d="M14 32 L50 32 L47 54 L17 54 Z" fill="#D49B54" stroke="#7F4F24" stroke-width="2" stroke-linejoin="round"/>
        <path d="M21 40 L43 40 M23 47 L41 47" stroke="#A67236" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `
  };

  function getProductIllustration(productName = '', storeName = '') {
    const clean = `${productName} ${storeName}`.toLowerCase();
    if (/(arroz|grano|frijol|lenteja|avena|harina|azucar|azúcar|sal|cafe|café|pasta|panela|aceite)/.test(clean)) {
      return ILLUSTRATIONS.rice;
    }
    if (/(leche|queso|yogur|mantequilla|huevo|pan|arepa|galleta|chocolate)/.test(clean)) {
      return ILLUSTRATIONS.dairy;
    }
    return ILLUSTRATIONS.veggies;
  }

  // --- Estado de la Aplicación ---
  let state = {
    items: [],
    catalog: [...DEFAULT_PRODUCT_CATALOG],
    trm: DEFAULT_FALLBACK_TRM,
    trmLastUpdated: null,
    activeStoreFilter: 'ALL',
    managerActiveStore: 'D1',
    searchQuery: '',
    catalogSearchQuery: '',
    editingId: null,
    isCatalogOpen: false,
    isPriceManagerOpen: false
  };

  // --- Formateadores de Moneda y Miles con Punto "." ---
  const copFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const thousandsFormatter = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const usdFormatter = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function formatInputThousands(value) {
    if (value === null || value === undefined || value === '') return '';
    const digits = String(value).replace(/\D/g, '');
    if (!digits) return '';
    return thousandsFormatter.format(parseInt(digits, 10));
  }

  function parseInputCOP(str) {
    if (typeof str === 'number') return str;
    const digits = String(str || '').replace(/\D/g, '');
    return digits ? parseInt(digits, 10) : NaN;
  }

  function applyLiveThousandsMask(inputEl) {
    const rawDigits = inputEl.value.replace(/\D/g, '');
    if (!rawDigits) {
      inputEl.value = '';
      return;
    }
    inputEl.value = thousandsFormatter.format(parseInt(rawDigits, 10));
  }

  // --- Referencias al DOM ---
  const dom = {
    form: document.getElementById('productForm'),
    formTitle: document.getElementById('formTitle'),
    catalogCountBadge: document.getElementById('catalogCountBadge'),
    btnCancelEdit: document.getElementById('btnCancelEdit'),
    editItemId: document.getElementById('editItemId'),
    inputStore: document.getElementById('inputStore'),
    activeStoreCatalogHint: document.getElementById('activeStoreCatalogHint'),
    dropdownHeaderTitle: document.getElementById('dropdownHeaderTitle'),
    inputProduct: document.getElementById('inputProduct'),
    inputPrice: document.getElementById('inputPrice'),
    inputQty: document.getElementById('inputQty'),
    priceAutoBadge: document.getElementById('priceAutoBadge'),
    productDropdownWrapper: document.getElementById('productDropdownWrapper'),
    btnToggleCatalog: document.getElementById('btnToggleCatalog'),
    catalogChevron: document.getElementById('catalogChevron'),
    productCatalogMenu: document.getElementById('productCatalogMenu'),
    productCatalogList: document.getElementById('productCatalogList'),
    btnOpenManagerFromDropdown: document.getElementById('btnOpenManagerFromDropdown'),
    btnTogglePriceManager: document.getElementById('btnTogglePriceManager'),
    btnTogglePriceManagerText: document.getElementById('btnTogglePriceManagerText'),
    priceManagerSection: document.getElementById('priceManagerSection'),
    managerStoreTabs: document.getElementById('managerStoreTabs'),
    btnClosePriceManager: document.getElementById('btnClosePriceManager'),
    btnResetCatalog: document.getElementById('btnResetCatalog'),
    catalogAddForm: document.getElementById('catalogAddForm'),
    catNewName: document.getElementById('catNewName'),
    catNewPrice: document.getElementById('catNewPrice'),
    btnAddCatalogToStore: document.getElementById('btnAddCatalogToStore'),
    inputCatalogSearch: document.getElementById('inputCatalogSearch'),
    catalogManagerList: document.getElementById('catalogManagerList'),
    btnSubmit: document.getElementById('btnSubmit'),
    btnSubmitText: document.getElementById('btnSubmitText'),
    inputSearch: document.getElementById('inputSearch'),
    storePillsContainer: document.getElementById('storePillsContainer'),
    itemsTableBody: document.getElementById('itemsTableBody'),
    emptyState: document.getElementById('emptyState'),
    totalCopDisplay: document.getElementById('totalCopDisplay'),
    totalUsdDisplay: document.getElementById('totalUsdDisplay'),
    itemsCountDisplay: document.getElementById('itemsCountDisplay'),
    bottomTotalCop: document.getElementById('bottomTotalCop'),
    bottomTotalUsd: document.getElementById('bottomTotalUsd'),
    bottomCountDisplay: document.getElementById('bottomCountDisplay'),
    btnBottomExportPdf: document.getElementById('btnBottomExportPdf'),
    btnBottomClearAll: document.getElementById('btnBottomClearAll'),
    trmDisplay: document.getElementById('trmDisplay'),
    trmUpdatedTime: document.getElementById('trmUpdatedTime'),
    trmStatusDot: document.getElementById('trmStatusDot'),
    btnRefreshTrm: document.getElementById('btnRefreshTrm'),
    iconRefreshTrm: document.getElementById('iconRefreshTrm'),
    btnExportPdf: document.getElementById('btnExportPdf'),
    btnClearAll: document.getElementById('btnClearAll'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
  };

  // --- Utilidades Generales ---
  function formatCOP(value) {
    return `${copFormatter.format(value || 0)} COP`;
  }

  function formatUSD(value) {
    return `$${usdFormatter.format(value || 0)} USD`;
  }

  function showToast(message) {
    dom.toastMessage.textContent = message;
    dom.toast.classList.remove('translate-y-20', 'opacity-0');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      dom.toast.classList.add('translate-y-20', 'opacity-0');
    }, 2600);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // --- Gestión Inteligente del Teclado Virtual en iOS y Android ---
  function setupMobileKeyboardHandling() {
    if (window.visualViewport) {
      const initialHeight = window.visualViewport.height;
      window.visualViewport.addEventListener('resize', () => {
        const isKeyboardVisible = window.visualViewport.height < initialHeight * 0.78;
        document.body.classList.toggle('keyboard-open', isKeyboardVisible);
      });
    }

    document.addEventListener('focusin', (e) => {
      if (e.target.matches('input, select, textarea') && window.innerWidth < 640) {
        document.body.classList.add('keyboard-open');
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 220);
      }
    });

    document.addEventListener('focusout', () => {
      setTimeout(() => {
        if (!document.activeElement || !document.activeElement.matches('input, select, textarea')) {
          document.body.classList.remove('keyboard-open');
        }
      }, 150);
    });
  }

  // --- Persistencia en localStorage ---
  function loadFromStorage() {
    try {
      const savedItems = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (savedItems) {
        state.items = JSON.parse(savedItems);
      }

      const savedCatalog = localStorage.getItem(STORAGE_KEY_CATALOG);
      if (savedCatalog) {
        const parsedCatalog = JSON.parse(savedCatalog);
        if (Array.isArray(parsedCatalog) && parsedCatalog.length > 0) {
          state.catalog = parsedCatalog;
        }
      } else {
        saveCatalogToStorage();
      }

      const savedTrm = localStorage.getItem(STORAGE_KEY_TRM);
      if (savedTrm) {
        const parsedTrm = JSON.parse(savedTrm);
        if (parsedTrm && parsedTrm.rate > 0) {
          state.trm = parsedTrm.rate;
          state.trmLastUpdated = parsedTrm.updatedAt;
        }
      }
    } catch (err) {
      console.error('Error leyendo localStorage:', err);
    }
  }

  function saveItemsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(state.items));
    } catch (err) {
      console.error('Error guardando items:', err);
    }
  }

  function saveCatalogToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(state.catalog));
      updateCatalogBadge();
    } catch (err) {
      console.error('Error guardando catálogo:', err);
    }
  }

  function saveTrmToStorage() {
    try {
      localStorage.setItem(
        STORAGE_KEY_TRM,
        JSON.stringify({
          rate: state.trm,
          updatedAt: state.trmLastUpdated
        })
      );
    } catch (err) {
      console.error('Error guardando TRM:', err);
    }
  }

  function updateCatalogBadge() {
    const selectedStore = dom.inputStore.value;
    const countInStore = state.catalog.filter(
      (c) => c.store.toLowerCase() === selectedStore.toLowerCase()
    ).length;
    dom.catalogCountBadge.textContent = `${countInStore} en ${selectedStore}`;
    dom.activeStoreCatalogHint.textContent = `Menú ${selectedStore}`;
    dom.dropdownHeaderTitle.textContent = `PRODUCTOS DE ${selectedStore.toUpperCase()}`;
  }

  // --- Lógica del Menú Desplegable de Productos (Filtrado por Tienda Seleccionada) ---
  function openCatalogMenu() {
    state.isCatalogOpen = true;
    dom.productCatalogMenu.classList.remove('hidden');
    dom.catalogChevron.classList.add('rotate-180');
    renderCatalogDropdown(dom.inputProduct.value);
  }

  function closeCatalogMenu() {
    state.isCatalogOpen = false;
    dom.productCatalogMenu.classList.add('hidden');
    dom.catalogChevron.classList.remove('rotate-180');
  }

  function renderCatalogDropdown(filterText = '') {
    const currentStore = dom.inputStore.value;
    const query = filterText.trim().toLowerCase();

    const filteredCatalog = state.catalog.filter(
      (item) =>
        item.store.toLowerCase() === currentStore.toLowerCase() &&
        item.name.toLowerCase().includes(query)
    );

    if (filteredCatalog.length === 0) {
      if (query) {
        dom.productCatalogList.innerHTML = `
          <li class="px-4 py-3 text-xs text-slate-500 flex items-center justify-between gap-2">
            <span>Nuevo en <strong>${escapeHtml(currentStore)}</strong>: <strong>"${escapeHtml(filterText.trim())}"</strong></span>
            <span class="text-[10px] bg-[#588157]/15 text-[#2B9348] px-2.5 py-0.5 rounded-full font-bold shrink-0">Se guardará al agregar</span>
          </li>
        `;
      } else {
        dom.productCatalogList.innerHTML = `
          <li class="px-4 py-4 text-xs text-center text-slate-400">
            No hay productos registrados en <strong>${escapeHtml(currentStore)}</strong>. Escribe uno nuevo o usa "Editar precios".
          </li>
        `;
      }
      return;
    }

    dom.productCatalogList.innerHTML = filteredCatalog
      .map((item) => {
        return `
          <li
            data-catalog-name="${escapeHtml(item.name)}"
            data-catalog-price="${item.price}"
            class="px-4 py-3 hover:bg-[#F4F8FA] active:bg-sky-50 cursor-pointer flex items-center justify-between gap-2 transition group"
          >
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-[#1D3B58] group-hover:text-[#38B6FF] truncate">
                ${escapeHtml(item.name)}
              </p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="text-xs font-extrabold text-[#2B9348] bg-[#588157]/10 border border-[#588157]/25 px-2.5 py-1 rounded-full">
                ${copFormatter.format(item.price)}
              </span>
            </div>
          </li>
        `;
      })
      .join('');
  }

  function selectCatalogProduct(name, price) {
    dom.inputProduct.value = name;
    dom.inputPrice.value = formatInputThousands(price);

    dom.priceAutoBadge.classList.remove('hidden');
    closeCatalogMenu();
    dom.inputQty.focus();
    dom.inputQty.select();
  }

  function upsertCatalogItem(name, price, store) {
    const cleanName = name.trim();
    const cleanStore = store.trim();

    const existingIndex = state.catalog.findIndex(
      (c) =>
        c.store.toLowerCase() === cleanStore.toLowerCase() &&
        c.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (existingIndex !== -1) {
      state.catalog[existingIndex].price = price;
    } else {
      state.catalog.unshift({
        name: cleanName,
        price,
        store: cleanStore
      });
    }
    saveCatalogToStorage();
    if (state.isPriceManagerOpen) {
      renderManagerStoreTabs();
      renderCatalogManagerList();
    }
  }

  // --- Apartado Gestor / Editor de Precios Dividido por Tienda ---
  function togglePriceManager(forceState) {
    state.isPriceManagerOpen =
      typeof forceState === 'boolean' ? forceState : !state.isPriceManagerOpen;

    if (state.isPriceManagerOpen) {
      state.managerActiveStore = dom.inputStore.value || 'D1';
      dom.priceManagerSection.classList.remove('hidden');
      dom.btnTogglePriceManagerText.textContent = 'Ocultar Editor';
      renderManagerStoreTabs();
      renderCatalogManagerList();
      dom.priceManagerSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      dom.priceManagerSection.classList.add('hidden');
      dom.btnTogglePriceManagerText.textContent = 'Editar Precios por Tienda';
    }
  }

  function renderManagerStoreTabs() {
    dom.managerStoreTabs.innerHTML = STORES.map((storeName) => {
      const isActive = state.managerActiveStore === storeName;
      const count = state.catalog.filter(
        (c) => c.store.toLowerCase() === storeName.toLowerCase()
      ).length;

      const btnClasses = isActive
        ? 'bg-[#1D3B58] text-white shadow-sm'
        : 'text-slate-600 hover:text-[#1D3B58] hover:bg-white';

      const badgeClasses = isActive
        ? 'bg-[#FFB703] text-[#142433]'
        : 'bg-slate-200 text-slate-700';

      return `
        <button
          type="button"
          data-manager-store="${escapeHtml(storeName)}"
          class="touch-target py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${btnClasses}"
        >
          <span>${escapeHtml(storeName)}</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full font-extrabold ${badgeClasses}">${count}</span>
        </button>
      `;
    }).join('');

    dom.btnAddCatalogToStore.textContent = `+ Agregar a ${state.managerActiveStore}`;
    dom.catNewName.placeholder = `Nuevo producto para ${state.managerActiveStore}...`;
  }

  function renderCatalogManagerList() {
    const activeStore = state.managerActiveStore;
    const q = state.catalogSearchQuery.trim().toLowerCase();

    const filtered = state.catalog
      .map((item, idx) => ({ ...item, originalIndex: idx }))
      .filter(
        (item) =>
          item.store.toLowerCase() === activeStore.toLowerCase() &&
          (!q || item.name.toLowerCase().includes(q))
      );

    if (filtered.length === 0) {
      dom.catalogManagerList.innerHTML = `
        <div class="py-8 px-4 text-center text-xs text-slate-400">
          No hay productos en <strong>${escapeHtml(activeStore)}</strong> que coincidan con la búsqueda.
        </div>
      `;
      return;
    }

    dom.catalogManagerList.innerHTML = filtered
      .map(
        (item) => `
        <div class="p-3 hover:bg-[#F4F8FA] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition" data-row-index="${item.originalIndex}">
          <div class="flex-1 min-w-0 flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#1D3B58]/10 text-[#1D3B58] shrink-0">
              ${escapeHtml(item.store)}
            </span>
            <input
              type="text"
              data-edit-cat-name="${item.originalIndex}"
              value="${escapeHtml(item.name)}"
              class="w-full min-h-[44px] rounded-xl border border-transparent hover:border-slate-200 focus:border-[#38B6FF] bg-transparent focus:bg-white px-2.5 py-1 text-base sm:text-sm font-bold text-slate-800 outline-none transition"
            />
          </div>

          <div class="flex items-center justify-end gap-2">
            <div class="relative flex-1 sm:flex-initial sm:w-36">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
              <input
                type="text"
                inputmode="numeric"
                pattern="[0-9.]*"
                data-edit-cat-price="${item.originalIndex}"
                value="${formatInputThousands(item.price)}"
                class="w-full min-h-[44px] rounded-full border border-slate-300 bg-white pl-7 pr-3 py-1.5 text-base sm:text-sm font-extrabold text-[#1D3B58] focus:border-[#38B6FF] outline-none"
              />
            </div>

            <button
              type="button"
              data-action="save-cat-row"
              data-index="${item.originalIndex}"
              class="touch-target px-4 rounded-full bg-[#588157] hover:bg-[#2B9348] active:scale-95 text-white font-bold text-xs transition"
            >
              Guardar
            </button>

            <button
              type="button"
              data-action="delete-cat-row"
              data-index="${item.originalIndex}"
              title="Eliminar producto de esta tienda"
              class="touch-target rounded-full text-slate-400 hover:text-[#E63946] hover:bg-rose-50 transition"
            >
              <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      `
      )
      .join('');
  }

  // --- Consulta de Tasa de Cambio (API en Tiempo Real) ---
  async function fetchExchangeRate(showFeedback = false) {
    dom.iconRefreshTrm.classList.add('animate-spin');
    dom.btnRefreshTrm.disabled = true;

    try {
      const response = await fetch(EXCHANGE_API_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data && data.rates && data.rates.COP) {
        state.trm = Number(data.rates.COP);
        state.trmLastUpdated = new Date().toISOString();
        saveTrmToStorage();
        dom.trmStatusDot.className = 'w-2 h-2 rounded-full bg-[#2B9348]';
        if (showFeedback) {
          showToast(`TRM actualizada: ${copFormatter.format(state.trm)} COP`);
        }
      }
    } catch (error) {
      console.warn('No se pudo conectar a la API de divisas, usando tasa almacenada:', error);
      dom.trmStatusDot.className = 'w-2 h-2 rounded-full bg-[#FFB703]';
      if (showFeedback) {
        showToast('Sin conexión: usando última TRM guardada');
      }
    } finally {
      dom.iconRefreshTrm.classList.remove('animate-spin');
      dom.btnRefreshTrm.disabled = false;
      renderTotalsAndTrm();
    }
  }

  // --- Cálculos y Renderizado de Totales ---
  function calculateTotals(itemsList = state.items) {
    const totalCop = itemsList.reduce((acc, item) => acc + item.price * item.qty, 0);
    const totalUsd = state.trm > 0 ? totalCop / state.trm : 0;
    return { totalCop, totalUsd };
  }

  function renderTotalsAndTrm() {
    const { totalCop, totalUsd } = calculateTotals(state.items);
    const formattedCop = formatCOP(totalCop);
    const formattedUsd = formatUSD(totalUsd);
    const totalProducts = state.items.length;

    dom.totalCopDisplay.textContent = formattedCop;
    dom.totalUsdDisplay.textContent = formattedUsd;
    dom.itemsCountDisplay.textContent =
      totalProducts === 1 ? '1 producto en la lista' : `${totalProducts} productos en la lista`;

    dom.bottomTotalCop.textContent = formattedCop;
    dom.bottomTotalUsd.textContent = formattedUsd;
    dom.bottomCountDisplay.textContent = String(totalProducts);

    dom.trmDisplay.textContent = `${copFormatter.format(state.trm)} COP`;

    if (state.trmLastUpdated) {
      const dateObj = new Date(state.trmLastUpdated);
      dom.trmUpdatedTime.textContent = `Tasa actualizada: ${dateObj.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } else {
      dom.trmUpdatedTime.textContent = 'Tasa referencial activa';
    }

    const hasItems = totalProducts > 0;
    dom.btnExportPdf.disabled = !hasItems;
    dom.btnClearAll.disabled = !hasItems;
    dom.btnBottomExportPdf.disabled = !hasItems;
    dom.btnBottomClearAll.disabled = !hasItems;
  }

  function renderStorePills() {
    const stores = Array.from(new Set(state.items.map((i) => i.store.trim()))).filter(Boolean);
    if (stores.length === 0) {
      dom.storePillsContainer.innerHTML = '';
      state.activeStoreFilter = 'ALL';
      return;
    }

    const allPills = ['ALL', ...stores];
    dom.storePillsContainer.innerHTML = allPills
      .map((storeKey) => {
        const isActive = state.activeStoreFilter === storeKey;
        const label = storeKey === 'ALL' ? 'Todas' : escapeHtml(storeKey);
        const classes = isActive
          ? 'bg-[#1D3B58] text-white border-[#1D3B58] shadow-sm'
          : 'bg-white text-[#1D3B58] border-[#C6D6E4] hover:bg-sky-50';
        return `
          <button
            type="button"
            data-store="${escapeHtml(storeKey)}"
            class="touch-target px-4 py-1.5 rounded-full text-xs font-extrabold border whitespace-nowrap transition ${classes}"
          >
            ${label}
          </button>
        `;
      })
      .join('');
  }

  function getFilteredItems() {
    return state.items.filter((item) => {
      const matchesStore =
        state.activeStoreFilter === 'ALL' ||
        item.store.toLowerCase() === state.activeStoreFilter.toLowerCase();
      const q = state.searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.product.toLowerCase().includes(q) ||
        item.store.toLowerCase().includes(q);
      return matchesStore && matchesQuery;
    });
  }

  function renderTable() {
    const filtered = getFilteredItems();

    if (filtered.length === 0) {
      dom.itemsTableBody.innerHTML = '';
      dom.emptyState.classList.remove('hidden');
      return;
    }

    dom.emptyState.classList.add('hidden');

    dom.itemsTableBody.innerHTML = filtered
      .map((item) => {
        const subtotal = item.price * item.qty;
        const isBeingEdited = state.editingId === item.id;
        const isBought = Boolean(item.bought);
        const illustrationSvg = getProductIllustration(item.product, item.store);

        return `
          <tr class="item-row hover:bg-sky-50/40 transition ${isBought ? 'is-bought-row' : ''} ${isBeingEdited ? 'ring-2 ring-[#FFB703] bg-amber-50/60' : ''}">
            <!-- Celda 1: Ilustración en móvil + Etiqueta de tienda -->
            <td data-cell="store" class="py-3.5 px-4 whitespace-nowrap">
              <div class="flex items-center gap-2.5">
                <div
                  data-action="toggle-bought"
                  data-id="${item.id}"
                  title="Toca para marcar como comprado"
                  class="w-14 h-14 sm:w-11 sm:h-11 rounded-2xl bg-[#F4F8FA] flex items-center justify-center cursor-pointer active:scale-95 transition"
                >
                  ${illustrationSvg}
                </div>
                <span class="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#1D3B58]/10 text-[#1D3B58]">
                  ${escapeHtml(item.store)}
                </span>
              </div>
            </td>

            <!-- Celda 2: Nombre "Tienda - Producto" + Badge "comprado" -->
            <td data-cell="product" class="py-3.5 px-4">
              <div class="flex items-start justify-between gap-2">
                <button
                  type="button"
                  data-action="toggle-bought"
                  data-id="${item.id}"
                  class="text-left font-extrabold text-base sm:text-sm text-[#142433] hover:text-[#1D3B58] transition leading-snug"
                >
                  <span class="sm:hidden text-[#1D3B58]">${escapeHtml(item.store)} - </span>${escapeHtml(item.product)}
                </button>
                <button
                  type="button"
                  data-action="toggle-bought"
                  data-id="${item.id}"
                  class="badge-bought-pill ${isBought ? '' : 'is-pending'} sm:ml-2 shrink-0"
                >
                  ${isBought ? 'comprado' : 'pendiente'}
                </button>
              </div>
            </td>

            <!-- Celda 3: Precio Unitario (en móvil incluye la cantidad para mayor claridad) -->
            <td data-cell="price" class="py-3.5 px-4 text-right text-slate-600 whitespace-nowrap font-semibold">
              <span class="sm:hidden">Cant: <strong class="text-[#1D3B58]">${item.qty}</strong> &bull; Unit: </span>${copFormatter.format(item.price)}
            </td>

            <!-- Celda 4: Cantidad (visible en tabla Desktop) -->
            <td data-cell="qty" class="py-3.5 px-4 text-center whitespace-nowrap">
              <span class="font-extrabold text-[#1D3B58]">${item.qty}</span>
            </td>

            <!-- Celda 5: Subtotal -->
            <td data-cell="subtotal" class="py-3.5 px-4 text-right font-extrabold text-[#1D3B58] whitespace-nowrap">
              ${formatCOP(subtotal)}
            </td>

            <!-- Celda 6: Botones Redondeados "Editar" y "Eliminar" -->
            <td data-cell="actions" class="py-3.5 px-4 text-center whitespace-nowrap">
              <div class="inline-flex items-center gap-2">
                <button
                  type="button"
                  data-action="edit"
                  data-id="${item.id}"
                  class="btn-card-edit"
                >
                  <svg class="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  data-action="delete"
                  data-id="${item.id}"
                  class="btn-card-delete"
                >
                  <svg class="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                  <span>Eliminar</span>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  function renderAll() {
    updateCatalogBadge();
    renderTotalsAndTrm();
    renderStorePills();
    renderTable();
  }

  // --- Gestión del Formulario Principal (Crear / Editar) ---
  function handleFormSubmit(e) {
    e.preventDefault();

    const store = dom.inputStore.value.trim();
    const product = dom.inputProduct.value.trim();
    const price = parseInputCOP(dom.inputPrice.value);
    const qty = parseFloat(dom.inputQty.value);

    if (!store || !product || isNaN(price) || price < 0 || isNaN(qty) || qty <= 0) {
      showToast('Por favor completa todos los campos con valores válidos');
      return;
    }

    upsertCatalogItem(product, price, store);

    if (state.editingId) {
      const index = state.items.findIndex((i) => i.id === state.editingId);
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          store,
          product,
          price,
          qty
        };
        showToast('✅ Producto y precio actualizados');
      }
      resetFormMode();
    } else {
      const newItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        store,
        product,
        price,
        qty,
        bought: false,
        createdAt: new Date().toISOString()
      };
      state.items.unshift(newItem);
      showToast(`🛒 ¡Agregado a la cesta (${store})!`);

      dom.inputProduct.value = '';
      dom.inputPrice.value = '';
      dom.inputQty.value = '1';
      dom.priceAutoBadge.classList.add('hidden');
      closeCatalogMenu();
    }

    saveItemsToStorage();
    renderAll();
  }

  function toggleItemBought(id) {
    const item = state.items.find((i) => i.id === id);
    if (!item) return;
    item.bought = !item.bought;
    saveItemsToStorage();
    renderTable();
    showToast(item.bought ? '💚 Marcado como comprado' : '🕒 Marcado como pendiente');
  }

  function startEditItem(id) {
    const item = state.items.find((i) => i.id === id);
    if (!item) return;

    state.editingId = item.id;
    dom.inputStore.value = STORES.includes(item.store) ? item.store : 'D1';
    updateCatalogBadge();
    dom.inputProduct.value = item.product;
    dom.inputPrice.value = formatInputThousands(item.price);
    dom.inputQty.value = item.qty;
    dom.priceAutoBadge.classList.add('hidden');

    dom.formTitle.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-[#FFB703]"></span> Editando ítem`;
    dom.btnSubmitText.textContent = 'Guardar cambios';
    dom.btnSubmit.classList.add('is-editing');
    dom.btnCancelEdit.classList.remove('hidden');

    renderTable();
    dom.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    dom.inputPrice.focus();
  }

  function resetFormMode() {
    const currentStore = dom.inputStore.value;
    state.editingId = null;
    dom.form.reset();
    dom.inputStore.value = currentStore;
    dom.inputQty.value = '1';
    dom.priceAutoBadge.classList.add('hidden');
    dom.formTitle.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-[#38B6FF]"></span> Agregar ítem`;
    dom.btnSubmitText.textContent = '¡Agregar a la cesta!';
    dom.btnSubmit.classList.remove('is-editing');
    dom.btnCancelEdit.classList.add('hidden');
    closeCatalogMenu();
    updateCatalogBadge();
    renderTable();
  }

  function deleteItem(id) {
    state.items = state.items.filter((i) => i.id !== id);
    if (state.editingId === id) {
      resetFormMode();
    }
    saveItemsToStorage();
    renderAll();
    showToast('🗑️ Producto eliminado');
  }

  function clearAllItems() {
    if (!state.items.length) return;
    if (confirm('¿Estás seguro de vaciar toda la lista de mercado?')) {
      state.items = [];
      state.activeStoreFilter = 'ALL';
      resetFormMode();
      saveItemsToStorage();
      renderAll();
      showToast('Lista vaciada');
    }
  }

  // --- Exportación a PDF con jsPDF & AutoTable (Identidad Guacamaya Shop) ---
  function exportToPDF() {
    if (!state.items.length) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

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

    // Cabecera Azul Marino Guacamaya Shop (#1D3B58)
    doc.setFillColor(29, 59, 88);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 85, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(19);
    doc.text('Guacamaya Shop — Resumen de Mercado', 40, 40);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(220, 235, 245);
    doc.text(`Generado el: ${formattedDate} a las ${formattedTime}`, 40, 60);
    doc.text(`Tasa TRM Aplicada: 1 USD = ${copFormatter.format(state.trm)} COP`, 40, 74);

    const tableRows = state.items.map((item) => [
      item.store,
      `${item.product}${item.bought ? ' (Comprado)' : ''}`,
      copFormatter.format(item.price),
      String(item.qty),
      copFormatter.format(item.price * item.qty)
    ]);

    doc.autoTable({
      startY: 105,
      head: [['Lugar', 'Producto', 'Precio Unit.', 'Cantidad', 'Subtotal (COP)']],
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

    const finalY = doc.lastAutoTable.finalY + 20;
    const pageWidth = doc.internal.pageSize.getWidth();

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

    const fileName = `guacamaya-shop-mercado-${now.toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
    showToast('📄 PDF generado exitosamente');
  }

  // --- Registro de Eventos ---
  function bindEvents() {
    dom.form.addEventListener('submit', handleFormSubmit);
    dom.btnCancelEdit.addEventListener('click', resetFormMode);

    dom.inputStore.addEventListener('change', () => {
      dom.inputProduct.value = '';
      dom.inputPrice.value = '';
      dom.priceAutoBadge.classList.add('hidden');
      updateCatalogBadge();
      if (state.isCatalogOpen) {
        renderCatalogDropdown('');
      }
    });

    dom.inputProduct.addEventListener('focus', () => {
      openCatalogMenu();
    });

    dom.inputProduct.addEventListener('input', (e) => {
      openCatalogMenu();
      const currentStore = dom.inputStore.value;
      const typed = e.target.value.trim().toLowerCase();
      const exactMatch = state.catalog.find(
        (c) =>
          c.store.toLowerCase() === currentStore.toLowerCase() &&
          c.name.toLowerCase() === typed
      );
      if (exactMatch) {
        dom.inputPrice.value = formatInputThousands(exactMatch.price);
        dom.priceAutoBadge.classList.remove('hidden');
      }
    });

    dom.btnToggleCatalog.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.isCatalogOpen) {
        closeCatalogMenu();
      } else {
        dom.inputProduct.focus();
        openCatalogMenu();
      }
    });

    dom.productCatalogList.addEventListener('click', (e) => {
      const li = e.target.closest('li[data-catalog-name]');
      if (!li) return;
      const name = li.getAttribute('data-catalog-name');
      const price = parseInt(li.getAttribute('data-catalog-price'), 10);
      selectCatalogProduct(name, price);
    });

    dom.inputPrice.addEventListener('input', (e) => {
      dom.priceAutoBadge.classList.add('hidden');
      applyLiveThousandsMask(e.target);
    });

    dom.catNewPrice.addEventListener('input', (e) => {
      applyLiveThousandsMask(e.target);
    });

    dom.catalogManagerList.addEventListener('input', (e) => {
      if (e.target.matches('input[data-edit-cat-price]')) {
        applyLiveThousandsMask(e.target);
      }
    });

    dom.btnTogglePriceManager.addEventListener('click', () => {
      togglePriceManager();
    });

    dom.btnClosePriceManager.addEventListener('click', () => {
      togglePriceManager(false);
    });

    dom.btnOpenManagerFromDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      closeCatalogMenu();
      togglePriceManager(true);
    });

    dom.managerStoreTabs.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('button[data-manager-store]');
      if (!tabBtn) return;
      state.managerActiveStore = tabBtn.getAttribute('data-manager-store');
      renderManagerStoreTabs();
      renderCatalogManagerList();
    });

    dom.catalogAddForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = dom.catNewName.value.trim();
      const store = state.managerActiveStore;
      const price = parseInputCOP(dom.catNewPrice.value);

      if (!name || isNaN(price) || price < 0) {
        showToast('Ingresa un nombre y precio válido');
        return;
      }

      upsertCatalogItem(name, price, store);
      dom.catalogAddForm.reset();
      renderManagerStoreTabs();
      renderCatalogManagerList();
      showToast(`"${name}" agregado a ${store} (${copFormatter.format(price)})`);
    });

    dom.inputCatalogSearch.addEventListener('input', (e) => {
      state.catalogSearchQuery = e.target.value;
      renderCatalogManagerList();
    });

    dom.catalogManagerList.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const index = parseInt(btn.dataset.index, 10);
      if (isNaN(index) || !state.catalog[index]) return;

      if (btn.dataset.action === 'save-cat-row') {
        const nameInput = dom.catalogManagerList.querySelector(
          `input[data-edit-cat-name="${index}"]`
        );
        const priceInput = dom.catalogManagerList.querySelector(
          `input[data-edit-cat-price="${index}"]`
        );

        const newName = nameInput ? nameInput.value.trim() : state.catalog[index].name;
        const newPrice = parseInputCOP(priceInput.value);

        if (!newName || isNaN(newPrice) || newPrice < 0) {
          showToast('Ingresa un nombre y precio válido');
          return;
        }

        state.catalog[index].name = newName;
        state.catalog[index].price = newPrice;
        saveCatalogToStorage();

        priceInput.value = formatInputThousands(newPrice);

        if (
          dom.inputStore.value.toLowerCase() === state.catalog[index].store.toLowerCase() &&
          dom.inputProduct.value.trim().toLowerCase() === newName.toLowerCase()
        ) {
          dom.inputPrice.value = formatInputThousands(newPrice);
        }

        showToast(`Guardado en ${state.catalog[index].store}: "${newName}" (${copFormatter.format(newPrice)})`);
      }

      if (btn.dataset.action === 'delete-cat-row') {
        const removed = state.catalog[index];
        state.catalog.splice(index, 1);
        saveCatalogToStorage();
        renderManagerStoreTabs();
        renderCatalogManagerList();
        showToast(`"${removed.name}" eliminado de ${removed.store}`);
      }
    });

    dom.btnResetCatalog.addEventListener('click', () => {
      if (confirm('¿Restaurar los productos y precios de fábrica para D1, Ara y Salsamentaria?')) {
        state.catalog = [...DEFAULT_PRODUCT_CATALOG];
        saveCatalogToStorage();
        renderManagerStoreTabs();
        renderCatalogManagerList();
        showToast('Catálogo por tiendas restaurado');
      }
    });

    document.addEventListener('click', (e) => {
      if (state.isCatalogOpen && !dom.productDropdownWrapper.contains(e.target)) {
        closeCatalogMenu();
      }
    });

    dom.itemsTableBody.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl) return;
      const { action, id } = actionEl.dataset;
      if (action === 'toggle-bought') toggleItemBought(id);
      if (action === 'edit') startEditItem(id);
      if (action === 'delete') deleteItem(id);
    });

    dom.storePillsContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('button[data-store]');
      if (!pill) return;
      state.activeStoreFilter = pill.dataset.store;
      renderStorePills();
      renderTable();
    });

    dom.inputSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderTable();
    });

    dom.btnRefreshTrm.addEventListener('click', () => fetchExchangeRate(true));
    dom.btnExportPdf.addEventListener('click', exportToPDF);
    dom.btnBottomExportPdf.addEventListener('click', exportToPDF);
    dom.btnClearAll.addEventListener('click', clearAllItems);
    dom.btnBottomClearAll.addEventListener('click', clearAllItems);
  }

  // --- Inicialización ---
  function init() {
    loadFromStorage();
    setupMobileKeyboardHandling();
    bindEvents();
    renderAll();
    fetchExchangeRate(false);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
