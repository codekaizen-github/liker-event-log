import { sql } from 'kysely';
import { db } from './database';

async function reset() {
    console.log('Resetting database');
    await sql`TRUNCATE TABLE streamOut`.execute(db);
    console.log('Truncated streamOut');
    await db.destroy();
}

reset();
