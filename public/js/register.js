function validateEmail(email) {
    // Validar que el correo termine con el dominio institucional
    const emailRegex = /^[^\s@]+@saintdominicschool\.edu\.ec$/;
    return emailRegex.test(email);
}

function validateName(name) {
    // Validar que el nombre solo contenga letras y espacios
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
}

function validateCedula(cedula) {
    // Validar que la cédula tenga exactamente 10 dígitos
    const cedulaRegex = /^\d{10}$/;
    return cedulaRegex.test(cedula);
}

async function register() {
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = ''; // Limpiar mensaje de error

    // Validaciones del formulario
    if (!validateName(nombre)) {
        errorMessage.textContent = 'El nombre solo debe contener letras y espacios.';
        return;
    }

    if (!validateEmail(email)) {
        errorMessage.textContent = 'Usa el correo institucional (@saintdominicschool.edu.ec).';
        return;
    }

    if (!validateCedula(password)) {
        errorMessage.textContent = 'La cédula debe tener exactamente 10 dígitos y no contener letras.';
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });

        if (response.ok) {
            alert('Registro exitoso. Ahora puedes iniciar sesión.');
            window.location.href = '/login'; // Redirigir a la página de inicio de sesión
        } else {
            const error = await response.text();
            errorMessage.textContent = error;
        }
    } catch (error) {
        errorMessage.textContent = 'Error al intentar conectarse al servidor.';
    }
}