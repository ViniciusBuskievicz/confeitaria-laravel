import { defineConfig } from 'cypress';
import { execFileSync } from 'node:child_process';

function resetDatabase() {
  execFileSync(
    'docker',
    ['compose', 'exec', '-T', 'app', 'php', 'artisan', 'migrate:fresh', '--seed', '--force'],
    { stdio: 'inherit' },
  );

  return null;
}

export default defineConfig({
  video: true,
  e2e: {
    baseUrl: 'http://localhost:8000',
    setupNodeEvents(on) {
      on('task', { resetDatabase });

      // This reset is destructive, so enable it only for an explicitly disposable test database.
      on('before:run', () => {
        if (process.env.CYPRESS_RESET_DATABASE === 'true') {
          resetDatabase();
        }
      });
    },
  },
});
