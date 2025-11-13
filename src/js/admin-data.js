   // Отображение модального окна
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

    const formContainer = document.getElementById("form-container");

    const focusableElements = formContainer.querySelectorAll(
    'input:not([type="hidden"]), select, textarea, button'
    );

    const payInput = document.getElementById('pay');
    const costInput = document.getElementById('cost');
    const binInput = document.getElementById('iin-bin');
    const sumInput = document.getElementById('sum-deal');

    costInput.addEventListener('input', function (e) {
      let value = e.target.value.replace(/\D/g, ''); // Удалить всё, кроме цифр
      value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Добавить пробелы каждые 3 цифры
      e.target.value = value;
    });

    sumInput.addEventListener('input', function (e) {
      let value = e.target.value.replace(/\D/g, ''); // Удалить всё, кроме цифр
      value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Добавить пробелы каждые 3 цифры
      e.target.value = value;
    });

    binInput.addEventListener('input', function (e) {
      let value = e.target.value.replace(/\D/g, ''); // Удалить всё, кроме цифр
      e.target.value = value;
    });

    document.addEventListener('DOMContentLoaded', function () {
      const formContainer = document.getElementById("form-container");
      const focusableElements = Array.from(
        formContainer.querySelectorAll('input:not([type="hidden"]), select, textarea, button')
      );

      // Навигация по Enter
      focusableElements.forEach((el, index) => {
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const next = focusableElements[index + 1];
            if (next) next.focus();
          }
        });
      });

      // Навигация по стрелкам
      document.addEventListener("keydown", (e) => {
        const active = document.activeElement;
        const currentIndex = focusableElements.indexOf(active);
        if (currentIndex === -1) return;

        const getPosition = (el) => {
          const rect = el.getBoundingClientRect();
          return { top: rect.top + window.scrollY, left: rect.left + window.scrollX };
        };

        const currentPos = getPosition(active);

        const candidates = focusableElements
          .filter(el => el !== active)
          .map(el => {
            const pos = getPosition(el);
            return { el, top: pos.top, left: pos.left };
          });

        let next;

        switch (e.key) {
          case "ArrowDown":
            next = candidates
              .filter(c => c.top > currentPos.top)
              .sort((a, b) => a.top - b.top || Math.abs(a.left - currentPos.left) - Math.abs(b.left - currentPos.left))[0];
            break;
          case "ArrowUp":
            next = candidates
              .filter(c => c.top < currentPos.top)
              .sort((a, b) => b.top - a.top || Math.abs(a.left - currentPos.left) - Math.abs(b.left - currentPos.left))[0];
            break;
          case "ArrowRight":
            next = candidates
              .filter(c => c.left > currentPos.left && Math.abs(c.top - currentPos.top) < 10)
              .sort((a, b) => a.left - b.left)[0];
            break;
          case "ArrowLeft":
            next = candidates
              .filter(c => c.left < currentPos.left && Math.abs(c.top - currentPos.top) < 10)
              .sort((a, b) => b.left - a.left)[0];
            break;
        }

        if (next) {
          e.preventDefault();
          next.el.focus();
        }
      });

      // Форматирование и расчёт
      const costInput = document.getElementById('cost');
      const areaInput = document.getElementById('area');
      const resultDisplay = document.getElementById('result');

      costInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        e.target.value = value;
        calculate();
      });

      areaInput.addEventListener('input', calculate);
    });

    function calculate() {
        const costInput = document.getElementById('cost');
        const areaInput = document.getElementById('area');
        const resultDisplay = document.getElementById('result');

        const costRaw = costInput.value.replace(/\s/g, '');
        const areaRaw = areaInput.value;

        const cost = parseFloat(costRaw);
        const area = parseFloat(areaRaw);

        const result = (cost > 0 && area > 0) ? cost / area : 0;

        const formatted = new Intl.NumberFormat('ru-RU', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(result);

        resultDisplay.textContent = formatted;
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
          data.results.forEach(item => {
            const row = [];

            $('#myTable thead th').each(function () {
              const field = $(this).data('field');
              if (!field) return row.push('');

              const value = field.split('.').reduce((acc, key) => acc?.[key], item);

              if (field === 'is_paid') {
                  const paidHtml = `
                    <span class="card paid">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                           stroke-width="1.5" stroke="currentColor" class="size-5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      Оплачено
                    </span>`;

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

        document.getElementById('total-count').textContent = data.count;
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
              targets: [9, 14, 16],
              render: function (data, type, row) {
                if (type === 'display' || type === 'filter') {
                  return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                }
                return data;
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
      const modal = document.getElementById('modalEdit');
      modal.dataset.id = recordId;

      console.log('Текущий ID:', currentRecordId);

      // Пример: вставка данных в модальное окно
      const select = document.getElementById('city-select');
      const options = Array.from(select.options);
      const match = options.find(opt => opt.textContent.trim() === rowData[1].trim());
        if (match) {
          select.value = match.value;
        }
      document.getElementById('iin-bin').value = rowData[2];
      document.getElementById('client').value = rowData[3];
      document.getElementById('payer').value = rowData[4];
      document.getElementById('object').value = rowData[5];
      document.getElementById('address').value = rowData[6];
      document.getElementById('number-deal').value = rowData[7];
      document.getElementById('date-deal').value = rowData[8];
         const sumValue = Math.trunc(parseFloat(rowData[9])); // убираем дробную часть
         document.getElementById('sum-deal').value = sumValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
         document.getElementById('pay_date').value = rowData[10];
      document.getElementById('count-grade').value = rowData[12];
      document.getElementById('bank').value = rowData[13];
         const costValue = Math.trunc(parseFloat(rowData[14])); // убираем дробную часть
         document.getElementById('cost').value = costValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
      document.getElementById('area').value = rowData[15];

      const cost = parseFloat(rowData[14]);
      const area = parseFloat(rowData[15]);
      const result = (cost > 0 && area > 0) ? cost / area : 0;

      const formatted = new Intl.NumberFormat('ru-RU', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
      }).format(result);

      document.getElementById('result').textContent = formatted;

      document.getElementById('number-titul').value = rowData[18];
      document.getElementById('trip').value = rowData[19];
      document.getElementById('company').value = rowData[20];

      toggleModal('modalEdit');

      calculate();

    });

      async function submitForm(currentRecordId) {
          const department = document.getElementById('city-select').value;
          const actual_payment = 0;
          const payment_date = document.getElementById('pay_date').value;
          const iin_bin = document.getElementById('iin-bin').value;
          const evaluation_count = document.getElementById('count-grade').value;
          const customer_name = document.getElementById('client').value;
          const bank_name = document.getElementById('bank').value;
          const payer = document.getElementById('payer').value;
          const cost = parseFloat(document.getElementById('cost').value.replace(/\s/g, ''));
          const object_name = document.getElementById('object').value;
          const area = parseFloat(document.getElementById('area').value.replace(/\s/g, ''));
          const object_address = document.getElementById('address').value;
          const cost_per_sqm = parseFloat(document.getElementById('result').textContent.replace(/\s/g, '').replace(',', '.'));
          const contract_number = document.getElementById('number-deal').value;
          const title_number = document.getElementById('number-titul').value;
          const contract_date = document.getElementById('date-deal').value;
          const is_offsite = document.getElementById('trip').value;
          const contract_amount = parseFloat(document.getElementById('sum-deal').value.replace(/\s/g, ''));
          const company = document.getElementById('company').value;

          const requiredFields = [
            'city-select', 'pay_date', 'iin-bin', 'count-grade', 'client', 'bank',
            'payer', 'cost', 'object', 'area', 'address', 'number-deal',
            'number-titul', 'date-deal', 'trip', 'sum-deal', 'company'
          ];

          for (let id of requiredFields) {
            const element = document.getElementById(id);
            if (!element.value.trim()) {
              alert('⚠️ Пожалуйста, заполните все поля!');
              element.focus();
              return;
            }
          }

          const payload = {
            department,
            actual_payment,
            payment_date,
            iin_bin,
            evaluation_count,
            customer_name,
            bank_name,
            payer,
            cost,
            object_name,
            area,
            object_address,
            cost_per_sqm,
            contract_number,
            title_number,
            contract_date,
            is_offsite,
            contract_amount,
            company
          };

          try {
            const response = await authorizedFetch(`https://globalcapital.kz/api/reestr/${currentRecordId}/`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error('Ошибка:', errorData);
              alert('❌ Ошибка при сохранении данных. Проверьте заполненные поля или повторите попытку позже.');
              return;
            }

            const data = await response.json();
            alert('✅ Данные успешно изменены');

          } catch (error) {
            console.error('Ошибка при отправке:', error);
            alert('❌ Произошла непредвиденная ошибка при сохранении.');
          }
      }

           // Кнопка Сохранить в модальном окне
           document.getElementById('save-button').addEventListener('click', async function (event) {
              event.preventDefault();

              if (!currentRecordId) {
                alert('ID записи не найден!');
                return;
              }

              await submitForm(currentRecordId);
              await loadTableData();
              toggleModal('modalEdit', false); // закрыть модалку
            });

            // Кнопка Удалить в модальном окне
            document.getElementById('delete-data').addEventListener('click', async function () {
              event.preventDefault();

              if (!currentRecordId) {
                alert('ID записи не найден!');
                return;
              }

              try {
                const response = await authorizedFetch(`https://globalcapital.kz/api/reestr/${currentRecordId}/`, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json'
                  }
                });

                if (!response.ok) {
                  throw new Error('Ошибка при удалении записи');
                }

                await loadTableData();
                toggleModal('modalEdit', false); // закрыть модалку
              } catch (error) {
                alert('Произошла ошибка при удалении: ' + error.message);
              }
            });

    loadTableData();
  });

  // Кнопка Выйти
  document.getElementById('exit').addEventListener('click', function () {
      window.location.href = '/index.html';
  });

 // Кнопка Скачать данные
 document.getElementById('download-excel').addEventListener('click', function (event) {
    event.preventDefault();

    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const button = document.getElementById('download-excel');

    if (!startDate || !endDate) {
      alert('Пожалуйста, выберите дату начала и дату окончания');
      return;
    }

    // Изменяем текст и отключаем кнопку
    button.textContent = 'Загрузка...';
    button.disabled = true;

    const url = `https://globalcapital.kz/api/reestr/download-excel/?start_date=${startDate}&end_date=${endDate}`;

    authorizedFetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка при загрузке файла');
      }
      return response.blob();
    })
    .then(blob => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'reestr.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    })
    .catch(error => {
      console.error('Ошибка:', error);
      alert('Не удалось загрузить файл.');
    })
    .finally(() => {
      // Возвращаем исходное состояние кнопки
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
          stroke="currentColor" class="size-5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Скачать данные
      `;
      button.disabled = false;
    });
 });
