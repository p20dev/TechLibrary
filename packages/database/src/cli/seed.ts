import { openDatabase, seedDatabase } from '../index.js';
const { sqlite } = openDatabase();
const inserted = seedDatabase(sqlite);
console.log(`Seed complete: ${inserted} topic(s) inserted.`);
sqlite.close();
