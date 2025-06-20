import bcrypt from 'bcryptjs';

const hash = await bcrypt.hash('airsupply123', 10);
console.log(hash);