import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = 'postgres://postgres:2Ss8050@localhost:5432/postgres?sslmode=disable';

async function createDatabase() {
    const client = new pg.Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to PostgreSQL');
        
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname='image'");
        if (res.rowCount === 0) {
            await client.query('CREATE DATABASE image');
            console.log('Database "image" created successfully.');
        } else {
            console.log('Database "image" already exists.');
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
}

createDatabase();
