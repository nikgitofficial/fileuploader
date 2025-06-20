import bcrypt from 'bcryptjs';

const hash = await bcrypt.hash('123', 10);
console.log(hash);