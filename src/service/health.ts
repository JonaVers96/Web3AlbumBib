import config from 'config';
import packageJson from '../../package.json';

/**
 * Check if the server is healthy. Can be extended
 * with database connection check, etc.
 */
export const ping = () => ({ pong: true });

/**
 * Get the running server's information.
 */
export const getVersion = () => {
  const env = config.get<string>('env');
  const normalized = env === 'test' ? 'testing' : env;  // test → testing (verwachting van de spec)
  return { env: normalized, version: packageJson.version, name: packageJson.name };
};
