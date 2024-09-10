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

            // Ojala funcione ptm
            const numeronico = document.createElement('div');
            numeronico.className = 'vivido';
            numeronico.textContent = currentDay;
            dayContainer.appendChild(numeronico);

            // Botón para el turno de la mañana
            const morningButton = document.createElement('button');
            morningButton.className = 'day morning';
            morningButton.onclick = () => showDayDetails(currentDay, 'mañana');
            dayContainer.appendChild(morningButton);

            // Botón para el turno de la tarde
            const afternoonButton = document.createElement('button');
            afternoonButton.className = 'day afternoon';
            afternoonButton.onclick = () => showDayDetails(currentDay, 'tarde');
            dayContainer.appendChild(afternoonButton);

            calendarEl.appendChild(dayContainer); // Agregar el contenedor del día al calendario
        }
    }

    updateCalendarHeader();
}

async function showDayDetails(day, turno) {
    selectedDate = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    turneto = turno;

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debe iniciar sesión para ver los detalles.');
        return;
    }

    try {
        const response = await fetch(`/api/laboratoristas/estudiantes/${selectedDate}/${turneto}`, { // Añadir turno
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const estudiantes = await response.json();

            // Crear el selector de prácticas
            let selectPractica = '<select id="practicaSelect" required><option value="lol" selected disabled>Selecciona una practica</option>';
            for (let i = 1; i <= 30; i++) {
                selectPractica += `<option value="Práctica ${i}">Práctica ${i}</option>`;
            }
            selectPractica += '</select>';

            modalContent.innerHTML = `
                <p>Estudiantes registrados el ${selectedDate} (${turneto}):</p>
                <ul>${estudiantes.map(nombre => `<li>${nombre}</li>`).join('')}</ul>
                <p>Selecciona la práctica:</p>
                ${selectPractica}
            `;
        } else {
            modalContent.textContent = 'Error al obtener los estudiantes registrados.';
        }
    } catch (error) {
        modalContent.textContent = 'Error al conectar con el servidor.';
    }

    modal.style.display = "block";
    // document.getElementById('practicaSelect').selectedIndex = -1;
}


async function addAssistance() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debe iniciar sesión para agregar asistencia.');
        return;
    }

    // Obtener la práctica seleccionada
    const selectedPractice = document.getElementById('practicaSelect').value;
    if (selectedPractice !== "lol") {
        try {
            const response = await fetch('/api/estudiantes/practicas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ selected_date: selectedDate, selected_practice: selectedPractice, turno: turneto })
            });
    
            if (response.ok) {
                alert('Asistencia agregada correctamente.');
                closeModal();
            } else {
                alert('Error al agregar asistencia. Verifica si ya se alcanzo el límite diario o no has seleccionado una practica.');
            }
        } catch (error) {
            alert('Error al conectar con el servidor.');
        }   
    } else {
        alert("Selecciona una practica primero.")
    }
}

// async function highlightUserDay() {
//     const token = localStorage.getItem('token');
//     if (!token) return; // No hacer nada si no hay token

//     try {
//         const response = await fetch('/api/estudiantes/practicas', { // Ruta para obtener el registro actual del usuario
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });

//         if (response.ok) {
//             const data = await response.json();
//             data.forEach(({ fecha, turno,}) => {
//                 const day = new Date(fecha).getDate();
//                 const turnoClass = turno === 'mañana' ? 'morning' : 'afternoon';

//                 document.querySelectorAll('.day-container').forEach(container => {
//                     const dayNumber = parseInt(container.querySelector('.vivido').textContent);
//                     if (dayNumber === day) {
//                         const button = container.querySelector(`.${turnoClass}`);
//                         if (button) button.style.border = '2px solid yellow'; // Añadir borde amarillo
//                     }
//                 });
//             });
//         }
//     } catch (error) {
//         console.error('Error al obtener el registro del usuario:', error);
//     }
// }

async function updateAvailabilityIndicators() {
    const token = localStorage.getItem('token');
    if (!token) return; // No hacer nada si no hay token

    // Obtener la disponibilidad de cada día y turno
    try {
        const response = await fetch('/api/estudiantes/disponibilidad', { // Nueva ruta para obtener disponibilidad
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            data.forEach(({ fecha, turno, count }) => {
                const day = new Date(fecha).getDate();
                const turnoClass = turno === 'mañana' ? 'morning' : 'afternoon';
                
                document.querySelectorAll('.day-container').forEach(container => {
                    const dayNumber = parseInt(container.querySelector('.vivido').textContent);
                    if (dayNumber === day+1) { /*el +1 esta solo para arreglar el desfase de un dia, en local se vera mal pero en la pagina bien*/
                        const button = container.querySelector(`.${turnoClass}`);
                        if (button) button.style.border = count < 6 ? '0px solid green' : '2px solid red';
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error al obtener la disponibilidad:', error);
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
highlightUserDay();
updateAvailabilityIndicators();