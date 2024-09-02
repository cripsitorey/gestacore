const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');

const app = express();

// Servir archivos estáticos desde el directorio "public"
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use('/api', routes);

// Ruta para servir "calendar.html"
app.get('/calendar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'calendar.html'));
});

// Ruta para servir "login.html"
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// Ruta para servir "index.html" (registro) como pagina por defecto
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const serverPort = 3000;

app.listen(serverPort, () => {
  console.log('servidor corriendo en el puerto ' + serverPort);
});








/* const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
app.use(bodyParser.json());
app.use('/api', routes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
/*  });
 */


/* const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
app.use(bodyParser.json());
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Bienvenido al sistema de gestión de prácticas de laboratorio de física');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
 */