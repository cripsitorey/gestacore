const express = require('express');
const { login, authenticateToken } = require('./auth');
const pool = require('./db');

const router = express.Router();

router.post('/login', login); // Ruta para el login

// Rutas protegidas
router.use(authenticateToken);

// Rutas para los laboratoristas
router.post('/laboratoristas/horarios', async (req, res) => {
  if (req.user.role !== 'laboratorista') return res.status(403).send('Acceso denegado');

  const { available_dates } = req.body;
  try {
    await pool.query('UPDATE laboratoristas SET available_dates = $1 WHERE id = $2', [available_dates, req.user.id]);
    res.send('Horarios actualizados');
  } catch (error) {
    res.status(500).send('Error al actualizar horarios');
  }
});

// Rutas para los estudiantes
router.post('/estudiantes/practicas', async (req, res) => {
  console.log('Usuario autenticado:', req.user);

  if (req.user.role !== 'estudiante') {
      return res.status(403).send('Acceso denegado');
  }

  const { selected_date, selected_practice } = req.body;

  try {
      // Verificar cuántos estudiantes ya están registrados para la fecha seleccionada
      const { rows } = await pool.query('SELECT COUNT(*) FROM estudiantes WHERE selected_date = $1', [selected_date]);

      console.log(`Conteo de estudiantes para la fecha ${selected_date}:`, rows[0].count);

      if (parseInt(rows[0].count) >= 6) {
          return res.status(400).send('No hay cupo disponible para esa fecha');
      }

      // Actualizar la base de datos con la nueva asistencia del estudiante
      const updateResult = await pool.query('UPDATE estudiantes SET selected_date = $1, selected_practice = $2 WHERE id = $3 RETURNING *', 
                                            [selected_date, selected_practice, req.user.id]);

      // Si no se actualizó ninguna fila, significa que este estudiante aún no tiene una práctica registrada
      if (updateResult.rowCount === 0) {
          // Insertar un nuevo registro
          await pool.query('INSERT INTO estudiantes (id, selected_date, selected_practice) VALUES ($1, $2, $3)', 
                           [req.user.id, selected_date, selected_practice]);
      }

      res.send('Práctica seleccionada');
  } catch (error) {
      console.error('Error al seleccionar la práctica:', error);
      res.status(500).send('Error al seleccionar la práctica');
  }
});


// Obtener calendario
router.get('/calendario', async (req, res) => {
  try {
    const calendar = await pool.query('SELECT * FROM horarios');
    res.json(calendar.rows);
  } catch (error) {
    res.status(500).send('Error al obtener el calendario');
  }
});

router.get('/laboratoristas/estudiantes/:date', authenticateToken, async (req, res) => {
  console.log('Usuario autenticado:', req.user);

  if (req.user.role !== 'laboratorista') {
      return res.status(403).send('Acceso denegado');
  }

  const { date } = req.params;

  try {
      // Consultar los correos electrónicos de los estudiantes registrados en la fecha especificada
      const { rows } = await pool.query(`
          SELECT u.email 
          FROM estudiantes e 
          JOIN usuarios u ON e.id = u.id 
          WHERE e.selected_date = $1
      `, [date]);

      res.send(rows.map(row => row.email)); // Enviar solo los correos electrónicos
  } catch (error) {
      console.error('Error al consultar los estudiantes registrados:', error);
      res.status(500).send('Error al consultar los estudiantes registrados');
  }
});


module.exports = router;
