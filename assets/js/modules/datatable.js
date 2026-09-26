/**
 * Data Table Module (Vanilla JS, R-JS-06, PRD §6.4 P-02, §B6)
 * High-performance search, sort, pagination, and multi-row selection.
 */

export class DataTable {
  constructor(tableEl, options = {}) {
    this.table = tableEl;
    this.tbody = tableEl.querySelector('tbody');
    this.thead = tableEl.querySelector('thead');
    this.pageSize = parseInt(tableEl.getAttribute('data-xa-page-size') || options.pageSize || 10, 10);
    this.currentPage = 1;
    this.sortColumn = null;
    this.sortDirection = 'asc';
    this.searchQuery = '';

    // Extract all rows once into an in-memory dataset
    this.originalRows = Array.from(this.tbody.querySelectorAll('tr')).map(tr => {
      const cells = Array.from(tr.children).map(td => ({
        html: td.innerHTML,
        text: td.textContent.trim().toLowerCase(),
        rawText: td.textContent.trim()
      }));
      return { el: tr.cloneNode(true), cells };
    });

    this.filteredRows = [...this.originalRows];

    this.initControls();
    this.bindEvents();
    this.render();
  }

  initControls() {
    // Find search input
    const tableId = this.table.id;
    this.searchInput = document.querySelector(`[data-xa-datatable-search="${tableId}"]`) ||
      document.querySelector('[data-xa-datatable-search]');

    // Find pagination container
    this.paginationContainer = document.querySelector(`[data-xa-datatable-pagination="${tableId}"]`) ||
      this.table.closest('.card')?.querySelector('[data-xa-datatable-pagination]');

    // Find info label (Showing X to Y of Z entries)
    this.infoContainer = document.querySelector(`[data-xa-datatable-info="${tableId}"]`) ||
      this.table.closest('.card')?.querySelector('[data-xa-datatable-info]');

    // Setup sortable headers
    this.thead.querySelectorAll('th[data-xa-sort]').forEach((th, idx) => {
      th.style.cursor = 'pointer';
      th.setAttribute('aria-sort', 'none');
      th.setAttribute('role', 'columnheader');
      if (!th.querySelector('.xa-sort-icon')) {
        th.innerHTML += ` <span class="xa-sort-icon opacity-50 ms-1" aria-hidden="true">↕</span>`;
      }
    });
  }

  bindEvents() {
    // Search input with debounce
    if (this.searchInput) {
      let timeout;
      this.searchHandler = (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.search(e.target.value);
        }, 150);
      };
      this.searchInput.addEventListener('input', this.searchHandler);
    }

    // Sort click on headers
    this.headerClickHandler = (e) => {
      const th = e.target.closest('th[data-xa-sort]');
      if (!th) return;
      const thIndex = Array.from(th.parentNode.children).indexOf(th);
      const type = th.getAttribute('data-xa-sort') || 'text';
      this.sort(thIndex, type);
    };
    this.thead.addEventListener('click', this.headerClickHandler);

    // Master checkbox select-all
    this.masterCheckbox = this.thead.querySelector('input[type="checkbox"]');
    if (this.masterCheckbox) {
      this.masterCheckHandler = () => {
        const isChecked = this.masterCheckbox.checked;
        this.tbody.querySelectorAll('input[type="checkbox"]').forEach(cb => {
          cb.checked = isChecked;
        });
      };
      this.masterCheckbox.addEventListener('change', this.masterCheckHandler);
    }
  }

  search(query) {
    this.searchQuery = query.trim().toLowerCase();
    this.currentPage = 1;

    if (!this.searchQuery) {
      this.filteredRows = [...this.originalRows];
    } else {
      this.filteredRows = this.originalRows.filter(row => {
        return row.cells.some(cell => cell.text.includes(this.searchQuery));
      });
    }

    if (this.sortColumn !== null) {
      this.applySort();
    }

    this.render();
  }

  sort(columnIndex, type = 'text') {
    if (this.sortColumn === columnIndex) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnIndex;
      this.sortDirection = 'asc';
    }

    // Update aria-sort on headers
    this.thead.querySelectorAll('th[data-xa-sort]').forEach((th, idx) => {
      if (idx === columnIndex) {
        th.setAttribute('aria-sort', this.sortDirection === 'asc' ? 'ascending' : 'descending');
        const icon = th.querySelector('.xa-sort-icon');
        if (icon) icon.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
      } else {
        th.setAttribute('aria-sort', 'none');
        const icon = th.querySelector('.xa-sort-icon');
        if (icon) icon.textContent = '↕';
      }
    });

    this.applySort(type);
    this.render();
  }

  applySort(type = 'text') {
    const col = this.sortColumn;
    const dir = this.sortDirection === 'asc' ? 1 : -1;

    this.filteredRows.sort((a, b) => {
      const valA = a.cells[col].rawText;
      const valB = b.cells[col].rawText;

      if (type === 'number') {
        const numA = parseFloat(valA.replace(/[^0-9.-]/g, '')) || 0;
        const numB = parseFloat(valB.replace(/[^0-9.-]/g, '')) || 0;
        return (numA - numB) * dir;
      }

      if (type === 'date') {
        const dateA = new Date(valA).getTime() || 0;
        const dateB = new Date(valB).getTime() || 0;
        return (dateA - dateB) * dir;
      }

      return valA.localeCompare(valB) * dir;
    });
  }

  render() {
    const total = this.filteredRows.length;
    const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIdx = (this.currentPage - 1) * this.pageSize;
    const endIdx = Math.min(startIdx + this.pageSize, total);
    const visibleRows = this.filteredRows.slice(startIdx, endIdx);

    // Render table body using DocumentFragment for maximum performance
    const fragment = document.createDocumentFragment();
    if (visibleRows.length === 0) {
      const colSpan = this.thead.querySelectorAll('th').length || 5;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="${colSpan}" class="text-center py-5 text-muted">Tidak ada data ditemukan</td>`;
      fragment.appendChild(tr);
    } else {
      visibleRows.forEach(row => {
        fragment.appendChild(row.el.cloneNode(true));
      });
    }

    this.tbody.innerHTML = '';
    this.tbody.appendChild(fragment);

    // Update info
    if (this.infoContainer) {
      if (total === 0) {
        this.infoContainer.textContent = 'Menampilkan 0 data';
      } else {
        this.infoContainer.textContent = `Menampilkan ${startIdx + 1}–${endIdx} dari ${total} data`;
      }
    }

    // Update pagination
    this.renderPagination(totalPages);

    document.dispatchEvent(new CustomEvent('xa:datatable-render', {
      detail: { table: this.table, total, currentPage: this.currentPage }
    }));
  }

  renderPagination(totalPages) {
    if (!this.paginationContainer) return;

    let html = '<ul class="pagination pagination-sm mb-0">';

    // Previous
    html += `<li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
      <button class="page-link" type="button" data-xa-page="${this.currentPage - 1}" aria-label="Sebelumnya">«</button>
    </li>`;

    // Pages numbers with ellipsis
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= this.currentPage - 1 && p <= this.currentPage + 1)) {
        html += `<li class="page-item ${p === this.currentPage ? 'active' : ''}">
          <button class="page-link" type="button" data-xa-page="${p}">${p}</button>
        </li>`;
      } else if (p === this.currentPage - 2 || p === this.currentPage + 2) {
        html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
      }
    }

    // Next
    html += `<li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
      <button class="page-link" type="button" data-xa-page="${this.currentPage + 1}" aria-label="Berikutnya">»</button>
    </li>`;

    html += '</ul>';
    this.paginationContainer.innerHTML = html;

    // Attach click listeners to pagination buttons
    this.paginationContainer.querySelectorAll('button[data-xa-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.getAttribute('data-xa-page'), 10);
        if (page >= 1 && page <= totalPages && page !== this.currentPage) {
          this.currentPage = page;
          this.render();
        }
      });
    });
  }

  destroy() {
    if (this.searchInput && this.searchHandler) {
      this.searchInput.removeEventListener('input', this.searchHandler);
    }
    if (this.thead && this.headerClickHandler) {
      this.thead.removeEventListener('click', this.headerClickHandler);
    }
    if (this.masterCheckbox && this.masterCheckHandler) {
      this.masterCheckbox.removeEventListener('change', this.masterCheckHandler);
    }
  }
}

const instances = new Map();

export function init(root = document) {
  root.querySelectorAll('table[data-xa-datatable]').forEach(el => {
    if (!instances.has(el)) {
      instances.set(el, new DataTable(el));
    }
  });
}

export function destroy(root = document) {
  root.querySelectorAll('table[data-xa-datatable]').forEach(el => {
    if (instances.has(el)) {
      instances.get(el).destroy();
      instances.delete(el);
    }
  });
}
