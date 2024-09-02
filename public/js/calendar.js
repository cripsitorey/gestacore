const calendarEl = document.getElementById('calendar');
const modal = document.getElementById('detailsModal');
const modalContent = document.getElementById('modalContent');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const currentMonthEl = document.getElementById('currentMonth');

let selectedDate = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]; 

function updateCalendarHeader() {
    currentMonthEl.textContent = `${months[currentMonth]} ${currentYear}`;
}

function generateCalendar() {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    let startDay = firstDayOfMonth.getDay(); // 0 = Domingo, 1 = Lunes, etc.

    calendarEl.innerHTML = ''; // Limpiar el calendario

    // Calcular el número de días en blanco antes del primer lunes del mes
    let blankDays = (startDay === 0) ? 0 : startDay - 1; // Si es domingo (0), poner 6 días en blanco

    // Rellenar los días en blanco hasta el primer lunes del mes
    for (let i = 0; i < blankDays; i++) {
        const blankDay = document.createElement('div');
        blankDay.className = 'day';
        blankDay.style.visibility = 'hidden'; // Ocultar días que no son del mes actual
        calendarEl.appendChild(blankDay);
    }

    // Añadir los días del mes
    for (let currentDay = 1; currentDay <= daysInMonth; currentDay++) {
        const date = new Date(currentYear, currentMonth, currentDay);
        const dayOfWeek = date.getDay();

        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Mostrar solo de Lunes (1) a Viernes (5)
            const dayContainer = document.createElement('div');
            dayContainer.className = 'day-container';

            // Botón para el turno de la mañana
            const morningButton = document.createElement('button');
            morningButton.className = 'day morning';
            morningButton.textContent = `${currentDay} - Mañana`;
            morningButton.onclick = () => showDayDetails(currentDay, 'mañana');
            dayContainer.appendChild(morningButton);

            // Botón para el turno de la tarde
            const afternoonButton = document.createElement('button');
            afternoonButton.className = 'day afternoon';
            afternoonButton.textContent = `${currentDay} - Tarde`;
            afternoonButton.onclick = () => showDayDetails(currentDay, 'tarde');
            dayContainer.appendChild(afternoonButton);

            calendarEl.appendChild(dayContainer); // Agregar el contenedor del día al calendario
        }
    }

    updateCalendarHeader();
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

function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar();
}

prevMonthBtn.addEventListener('click', () => changeMonth(-1));
nextMonthBtn.addEventListener('click', () => changeMonth(1));

function closeModal() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

generateCalendar();