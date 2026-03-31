import { env } from './.env';

export const environment = {
  production: true,
  version: env['npm_package_version'] + '-dev',
  serverUrl: '/api',
  defaultLanguage: 'ko-KR',
  supportedLanguages: ['ko-KR', 'en-US', 'fr-FR'],
};
