import { AppDataSource } from './data-source';

async function main(): Promise<void> {
  try {
    await AppDataSource.initialize();
    const migrations = await AppDataSource.runMigrations({
      transaction: 'each',
    });
    if (migrations.length === 0) {
      console.log('No pending migrations.');
    } else {
      console.log(
        `Applied ${migrations.length} migration(s): ${migrations.map((m) => m.name).join(', ')}`,
      );
    }
    await AppDataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error('Migration run failed:', err);
    process.exit(1);
  }
}

void main();
