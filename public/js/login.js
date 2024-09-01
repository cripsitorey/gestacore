async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            window.location.href = 'calendar';  // Redirigir al calendario
        } else {
            errorMessage.textContent = 'Credenciales incorrectas. Inténtalo de nuevo.';
        }
    } catch (error) {
        errorMessage.textContent = 'Error al intentar conectarse al servidor.';
    }
}