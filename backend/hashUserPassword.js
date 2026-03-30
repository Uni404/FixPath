const bcrypt = require('bcrypt');

async function main() {
  const password = 'user123';
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}

main();
