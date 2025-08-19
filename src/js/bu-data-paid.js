function toggleModal(modalId, show = null) {
      const modal = document.getElementById(modalId);
      const overlay = document.getElementById('overlayModal');

      const shouldShow = show !== null ? show : modal.classList.contains('hidden');

      overlay.classList.toggle('hidden', !shouldShow);
      modal.classList.toggle('hidden', !shouldShow);

      // Close other modals
      document.querySelectorAll('.modal').forEach((m) => {
        if (m.id !== modalId) m.classList.add('hidden');
      });

      // Body scroll control
      document.body.style.overflow = shouldShow ? 'hidden' : 'auto';

      if (shouldShow) {
        lucide.createIcons();
      }
    }

  let currentPage = 1;
    let nextPageUrl = null;
    let prevPageUrl = null;
    let filterState = {
      contract_start_date: '',
      contract_end_date: '',
      department__dep_name: '',
      iin_bin: '',
      customer_name: '',
      payer: '',
      object_name: '',
      object_address: '',
      contract_number: '',
      bank_name: '',
      executor__full_name: '',
      title_number: '',
      company: '',
      page: 1
    };

    function buildQueryParams() {
      const params = new URLSearchParams();
      if (filterState.contract_start_date) params.append('contract_start_date', filterState.contract_start_date);
      if (filterState.contract_end_date) params.append('contract_end_date', filterState.contract_end_date);
      if (filterState.department__dep_name) params.append('department__dep_name', filterState.department__dep_name);
      if (filterState.iin_bin) params.append('iin_bin', filterState.iin_bin);
      if (filterState.customer_name) params.append('customer_name', filterState.customer_name);
      if (filterState.payer) params.append('payer', filterState.payer);
      if (filterState.object_name) params.append('object_name', filterState.object_name);
      if (filterState.object_address) params.append('object_address', filterState.object_address);
      if (filterState.contract_number) params.append('contract_number', filterState.contract_number);
      if (filterState.bank_name) params.append('bank_name', filterState.bank_name);
      if (filterState.executor__full_name) params.append('executor__full_name', filterState.executor__full_name);
      if (filterState.title_number) params.append('title_number', filterState.title_number);
      if (filterState.company) params.append('company', filterState.company);
      params.append('page', filterState.page);
      return params.toString();
    }

    async function loadTableData(url = `https://globalcapital.kz/api/reestr/?${buildQueryParams()}`) {
      try {
        const response = await authorizedFetch(url);
        const data = await response.json();

        const table = $('#myTable').DataTable();
        table.clear();

        if (data.results && Array.isArray(data.results)) {
          // ✅ фильтруем только оплаченные записи
          const paidResults = data.results.filter(item => item.is_paid === false);
          paidCount = paidResults.length;

          paidResults.forEach(item => {
            const row = [];

            $('#myTable thead th').each(function () {
              const field = $(this).data('field');
              if (!field) return row.push('');

              const value = field.split('.').reduce((acc, key) => acc?.[key], item);

              if (field === 'is_paid') {
                  const unpaidHtml = `
                    <span class="card hard">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                           stroke-width="1.5" stroke="currentColor" class="size-5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Не оплачено
                    </span>`;
                row.push(value ? paidHtml : unpaidHtml);
              } else {
                row.push(value ?? '');
              }
            });

            // Добавляем строку и сразу встраиваем data-id
            const addedRow = table.row.add(row).node();
            $(addedRow).attr('data-id', item.id);
          });

          table.draw(false);
        }

        nextPageUrl = data.next;
        prevPageUrl = data.previous;

        const pageMatch = url.match(/page=(\d+)/);
        currentPage = pageMatch ? parseInt(pageMatch[1]) : 1;

        $('#page-info').text(`Страница ${currentPage}`);

        $('#prev-page').off('click').on('click', () => {
          if (prevPageUrl) {
            filterState.page = currentPage - 1;
            loadTableData();
          }
        });

        $('#next-page').off('click').on('click', () => {
          if (nextPageUrl) {
            filterState.page = currentPage + 1;
            loadTableData();
          }
        });

        $('#prev-page').prop('disabled', !prevPageUrl);
        $('#next-page').prop('disabled', !nextPageUrl);

      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    }

    // Фильтрация по дате
    document.getElementById('date-filter').addEventListener('click', () => {
      const startDate = document.getElementById('start-date').value;
      const endDate = document.getElementById('end-date').value;

      if (!startDate || !endDate) {
        alert('Пожалуйста, выберите дату начала и дату окончания!');
        return;
      }

      filterState.contract_start_date = startDate;
      filterState.contract_end_date = endDate;
      filterState.page = 1;
      loadTableData();
    });

    // Поиск по филиалу с debounce
    let debounceTimerdepartment = null;
    document.getElementById('department__dep_name').addEventListener('input', (e) => {
      clearTimeout(debounceTimerdepartment);
      debounceTimerdepartment = setTimeout(() => {
        filterState.department__dep_name = e.target.value.trim();
        filterState.page = 1;
        loadTableData();
      }, 400);
    });

    // Поиск по ИИН-БИН с debounce
    let debounceTimeriinbin = null;
    document.getElementById('iin_bin').addEventListener('input', (e) => {
      clearTimeout(debounceTimeriinbin);
      debounceTimeriinbin = setTimeout(() => {
        filterState.iin_bin = e.target.value.trim();
        filterState.page = 1;
        loadTableData();
      }, 400);
    });

    // Поиск по Заказчику с debounce
    let debounceTimercustomer = null;
    document.getElementById('customer_name').addEventListener('input', (e) => {
      clearTimeout(debounceTimercustomer);
      debounceTimercustomer = setTimeout(() => {
        filterState.customer_name = e.target.value.trim();
        filterState.page = 1;
        loadTableData();
      }, 400);
    });

    // Поиск по плательщику с debounce
    let debounceTimerpayer = null;
    document.getElementById('payer_filter').addEventListener('input', (e) => {
      clearTimeout(debounceTimerpayer);
      debounceTimerpayer = setTimeout(() => {
        filterState.payer = e.target.value.trim();
        filterState.page = 1;
        loadTableData();
      }, 400);
    });

    // Поиск по объекту с debounce
    let debounceTimerobject = null;
    document.getElementById('object_name').addEventListener('input', (e) => {
      clearTimeout(debounceTimerobject);
      debounceTimerobject = setTimeout(() => {
        filterState.object_name = e.target.value.trim();
        filterState.page = 1;
        loadTableData();
      }, 400);
    });

    // Поиск по адресу с debounce
    let debounceTimerobject_address = null;
    document.getElementById('object_address').addEventListener('input', (e) => {
      clearTimeout(debounceTimerobject_address);
      debounceTimerobject_address = setTimeout(() => {
        filterState.object_address = e.target.value.trim();
        filterState.page = 1;
        loadTableData();
      }, 400);
    });

    // Поиск по номер-договора с debounce
    let debounceTimercontract_number  = null;
    document.getElementById('contract_number').addEventListener('input', (e) => {
      clearTimeout(debounceTimercontract_number);
      debounceTimercontract_number = setTimeout(() => {
        filterState.contract_number = e.target.value.trim();
        filterState.page = 1;
        loadTableData();
      }, 400);
    });

    // Поиск по наименование банка с debounce
    let debounceTimerbank_name  = null;
    document.getElementById('bank_name').addEventListener('input', (e) => {
      clearTimeout(debounceTimerbank_name);
      debounceTimerbank_name = setTimeout(() => {
        filterState.bank_name = e.target.value.trim();
        filterState.page = 1;
        loadTableData();
      }, 400);
    });

    // Поиск по исполнитель с debounce
    let debounceTimerexecutor  = null;
    document.getElementById('executor__full_name').addEventListener('input', (e) => {
      clearTimeout(debounceTimerexecutor);
      debounceTimerexecutor = setTimeout(() => {
        filterState.executor__full_name = e.target.value.trim();
        filterState.page = 1;
        loadTableData();
      }, 400);
    });

    // Поиск по Номер титулки с debounce
    let debounceTimertitle  = null;
    document.getElementById('title_number').addEventListener('input', (e) => {
      clearTimeout(debounceTimertitle);
      debounceTimertitle = setTimeout(() => {
        filterState.title_number = e.target.value.trim();
        filterState.page = 1;
        loadTableData();
      }, 400);
    });

   // Поиск по Компании с debounce
    let debounceTimercompany = null;
    document.getElementById('filter_company').addEventListener('input', (e) => {
      clearTimeout(debounceTimercompany);
      debounceTimercompany = setTimeout(() => {
        const value = e.target.value.trim();
        const table = $('#myTable').DataTable();
        table.column(20).search(value, true, false).draw(); // ✅ RegExp в действии
      }, 400);
    });

// ✅ Единая инициализация DataTable
  $(document).ready(function () {
      const table = $('#myTable').DataTable({
          orderCellsTop: true,
          fixedHeader: true,
          searching: true,
          info: false,
          paging: false,
          lengthChange: false,
          scrollY: true,
          scrollX: true,
          dom: 'rtip',
          columnDefs: [
            {
              targets: [9, 10, 14, 16],
              render: function (data, type, row) {
                if (type === 'display' || type === 'filter') {
                  return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                }
                return data;
              }
            },
            {
              targets: [10],
              orderable: false,
              searchable: false,
              render: function (data, type, row) {
                return type === 'display' ? data : $(data).text();
              }
            }
          ]
      });

      // Обработчики кнопок
      $('#next-page').on('click', () => {
        if (nextPageUrl) loadTableData(nextPageUrl);
      });

      $('#prev-page').on('click', () => {
        if (prevPageUrl) loadTableData(prevPageUrl);
      });

      $('#myTable thead tr:eq(1) th').each(function (i) {
          $('input', this).on('keyup change', function () {
            if ($('#myTable').DataTable().column(i).search() !== this.value) {
              $('#myTable').DataTable().column(i).search(this.value).draw();
            }
          });
      });


    let currentRecordId = null;

    $('#myTable tbody').on('dblclick', 'tr', function () {
      const rowData = table.row(this).data();
      // Получаем ID из data-атрибута строки
      const recordId = $(this).data('id');

      // Сохраняем ID в глобальную переменную
      currentRecordId = recordId;

      // Также можно сохранить в модальное окно, если нужно
      const modal = document.getElementById('modalPaid');
      modal.dataset.id = recordId;

      console.log('Текущий ID:', currentRecordId);

      toggleModal('modalPaid');
    });

   async function markAsPaidOnly(currentRecordId) {
      const payload = { is_paid: true };

      try {
        const response = await authorizedFetch(`https://globalcapital.kz/api/reestr/${currentRecordId}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ошибка: ${errorText}`);
        }

        const data = await response.json();
        await loadTableData();

      } catch (error) {
        alert('Произошла ошибка: ' + error.message);
      }
    }

    document.getElementById('payed').addEventListener('click', async function () {
      event.preventDefault();

      if (!currentRecordId) {
        alert('ID записи не найден!');
        return;
      }
        markAsPaidOnly(currentRecordId);
        toggleModal('modalPaid', false); // закрыть модалку
    });

    loadTableData();
  });

  document.getElementById('exit').addEventListener('click', function () {
    window.location.href = '/index.html';
  });