const bcrypt = require('bcrypt');

const password = '1700000000'; // Reemplaza con la contraseña que deseas encriptar

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log(`Contraseña encriptada: ${hash}`);
});
