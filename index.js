const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');

const app = express();

// Servir archivos estáticos desde el directorio "public"
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use('/api', routes);

// Ruta para servir "login.html"
app.get('/calendar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'calendar.html'));
});

// Ruta para servir "register.html"
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// Ruta para servir "index.html" (calendario) como página por defecto después del login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
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