import type { TestProject } from 'vitest/node';
import { startPostgres } from '../support/database';

declare module 'vitest' {
  export interface ProvidedContext {
    postgresUrl: string;
  }
}

export default async function setup(project: TestProject) {
  const server = await startPostgres();
  project.provide('postgresUrl', server.adminUrl);
  return async () => {
    await server.stop();
  };
}
