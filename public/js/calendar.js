const calendarEl = document.getElementById('calendar');
const modal = document.getElementById('detailsModal');
const modalContent = document.getElementById('modalContent');
const monthSelector = document.getElementById('monthSelector');
const yearSelector = document.getElementById('yearSelector');

let selectedDate = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function populateSelectors() {
    // Poblar selector de meses
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        if (index === currentMonth) option.selected = true;
        monthSelector.appendChild(option);
    });

    // Poblar selector de años
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i === currentYear) option.selected = true;
        yearSelector.appendChild(option);
    }
}

function generateCalendar() {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startDay = firstDayOfMonth.getDay();

    calendarEl.innerHTML = '';

    // Agregar días en blanco hasta el primer día del mes
    for (let i = 0; i < startDay; i++) {
        const blankDay = document.createElement('div');
        blankDay.className = 'day';
        blankDay.style.visibility = 'hidden';
        calendarEl.appendChild(blankDay);
    }

    // Agregar los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'day';
        dayEl.textContent = day;
        dayEl.onclick = () => showDayDetails(day);
        calendarEl.appendChild(dayEl);
    }
}

async function showDayDetails(day) {
    selectedDate = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debe iniciar sesión para ver los detalles.');
        return;
    }

    try {
        const response = await fetch(`/api/laboratoristas/estudiantes/${selectedDate}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const estudiantes = await response.json();
            modalContent.innerHTML = `<p>Estudiantes registrados el ${selectedDate}:</p><ul>${estudiantes.map(email => `<li>${email}</li>`).join('')}</ul>`;
        } else {
            modalContent.textContent = 'Error al obtener los estudiantes registrados.';
        }
    } catch (error) {
        modalContent.textContent = 'Error al conectar con el servidor.';
    }

    modal.style.display = "block";
}

async function addAssistance() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debe iniciar sesión para agregar asistencia.');
        return;
    }

    try {
        const response = await fetch('/api/estudiantes/practicas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ selected_date: selectedDate, selected_practice: 'Práctica 1' })
        });

        if (response.ok) {
            alert('Asistencia agregada correctamente.');
            closeModal();
        } else {
            alert('Error al agregar asistencia. Verifique si ya ha alcanzado el límite diario.');
        }
    } catch (error) {
        alert('Error al conectar con el servidor.');
    }
}

function closeModal() {
    modal.style.display = "none";
}

function updateCalendar() {
    currentMonth = parseInt(monthSelector.value);
    currentYear = parseInt(yearSelector.value);
    generateCalendar();
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

populateSelectors();
generateCalendar();

monthSelector.addEventListener('change', updateCalendar);
yearSelector.addEventListener('change', updateCalendar);