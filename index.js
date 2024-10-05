const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');

const app = express();

// Servir archivos estáticos desde el directorio "public"
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use('/api', routes);

// Ruta para servir "register.html"
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Ruta para servir "login.html"
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// Ruta para servir "index.html" (calendar) como pagina por defecto
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const serverPort = 3000;

app.listen(serverPort, () => {
  console.log('servidor corriendo en el puerto ' + serverPort);
});