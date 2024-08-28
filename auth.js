const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('./db');

const secret = 'your_jwt_secret';

async function login(req, res) {
  const { email, password } = req.body;
  const user = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

  if (user.rowCount === 0) return res.status(404).send('User not found');

  const validPassword = await bcrypt.compare(password, user.rows[0].password);
  if (!validPassword) return res.status(401).send('Invalid password');

  const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, secret);
  res.send({ token });
}

async function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token.split(' ')[1], secret, async (err, user) => {
    if (err) return res.status(403).send('Token no válido');
    
    req.user = user;

    // Recuperar el rol del usuario desde la base de datos
    const { rows } = await pool.query('SELECT role FROM usuarios WHERE id = $1', [user.id]);
    
    if (rows.length > 0) {
        req.user.role = rows[0].role;
        console.log('Rol del usuario autenticado:', req.user.role);  // Mostrar el rol en la consola para depuración
        next();
    } else {
        return res.status(403).send('Usuario no encontrado');
    }
});
}

module.exports = { login, authenticateToken };
