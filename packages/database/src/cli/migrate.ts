import { openDatabase } from '../index.js';
const { sqlite } = openDatabase();
console.log('Database migrations applied.');
sqlite.close();
