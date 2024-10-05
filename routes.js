const express = require('express');
const { login, authenticateToken } = require('./auth');
const bcrypt = require('bcrypt');
const pool = require('./db');
const router = express.Router();

router.post('/login', login); // Ruta para el login

router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
      // Verificar si el usuario ya existe
      const existingUser = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
      if (existingUser.rowCount > 0) {
          return res.status(400).send('El nombre ya está registrado.');
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar el nuevo usuario con rol de estudiante
      await pool.query(
          'INSERT INTO usuarios (id, email, password, nombre, role) VALUES ($1, $2, $3, $4, $5)',
          [password, email, hashedPassword, nombre, 'estudiante']
      );

      res.status(201).send('Nombre registrado exitosamente');
  } catch (error) {
      console.error('Error al registrar el nombre:', error);
      res.status(500).send('Error interno del servidor');
  }
});


// Rutas protegidas
router.use(authenticateToken);

// Rutas para los estudiantes
router.post('/estudiantes/practicas', async (req, res) => {
    console.log('Usuario autenticado:', req.user);

    if (req.user.role !== 'estudiante') {
        return res.status(403).send('Acceso denegado');
    }

    const { selected_date, selected_practice, turno } = req.body;

    // Verificar que el registro esté dentro del horario permitido (4pm a 10pm)
    const currentDay = new Date().getDay(); //Obetener el dia actual
    const currentHour = new Date().getHours(); // Obtener la hora actual
    if (currentDay <= 5) { // Si es antes de 4pm o después de 10pm
        if (currentHour < 16 || currentHour >= 22) {
            return res.status(400).send('El registro solo está permitido entre las 4pm y las 10pm');
        }  
    }

    try {
        // Verificar si ya existe un registro con la misma práctica, fecha y turno
        const { rows: practiceExists } = await pool.query(
            'SELECT * FROM estudiantes WHERE selected_date = $1 AND selected_practice = $2 AND turno = $3',
            [selected_date, selected_practice, turno]
        );

        if (practiceExists.length > 0) {
            return res.status(400).send('La práctica ya está registrada por otro estudiante en esa fecha y turno');
        }

        // Verificar cuántos estudiantes ya están registrados para la fecha y turno seleccionados
        const { rows } = await pool.query(
            'SELECT COUNT(*) FROM estudiantes WHERE selected_date = $1 AND turno = $2',
            [selected_date, turno]
        );

        console.log(`Conteo de estudiantes para la fecha ${selected_date} y turno ${turno}:`, rows[0].count);

        if (parseInt(rows[0].count) >= 6) {
            return res.status(400).send('No hay cupo disponible para esa fecha y turno');
        }

        // Actualizar la base de datos con la nueva asistencia del estudiante
        const updateResult = await pool.query(
            'UPDATE estudiantes SET selected_date = $1, selected_practice = $2, turno = $3 WHERE id = $4 RETURNING *',
            [selected_date, selected_practice, turno, req.user.id]
        );

        // Si no se actualizó ninguna fila, significa que este estudiante aún no tiene una práctica registrada
        if (updateResult.rowCount === 0) {
            // Insertar un nuevo registro
            await pool.query(
                'INSERT INTO estudiantes (id, selected_date, selected_practice, turno) VALUES ($1, $2, $3, $4)',
                [req.user.id, selected_date, selected_practice, turno]
            );
        }

        res.send('Práctica y turno seleccionados');
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

router.get('/laboratoristas/estudiantes/:date/:turno', authenticateToken, async (req, res) => {
  console.log('Usuario autenticado:', req.user);

  if (req.user.role == 'laboratorista') {
      return res.status(403).send('Acceso denegado');
  }

  const { date, turno } = req.params;

  try {
      // Consultar los nombres de los estudiantes registrados en la fecha y turno especificados
      const { rows } = await pool.query(`
          SELECT u.nombre, e.selected_practice
          FROM estudiantes e 
          JOIN usuarios u ON e.id = u.id 
          WHERE e.selected_date = $1 AND e.turno = $2
      `, [date, turno]);

      res.send(rows.map(row => row.nombre + "  ->  " + row.selected_practice));
  } catch (error) {
      console.error('Error al consultar los estudiantes registrados:', error);
      res.status(500).send('Error al consultar los estudiantes registrados');
  }
});

router.get('/estudiantes/disponibilidad', authenticateToken, async (req, res) => {
  try {
      const { rows } = await pool.query(`
          SELECT selected_date AS fecha, turno, COUNT(*) AS count
          FROM estudiantes
          GROUP BY selected_date, turno
      `);
      res.json(rows);
  } catch (error) {
      console.error('Error al obtener la disponibilidad:', error);
      res.status(500).send('Error al obtener la disponibilidad');
  }
});


module.exports = router;
