// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { env } from './.env';

export const environment = {
  production: false,
  version: env['npm_package_version'] + '-dev',
  serverUrl: '/api',
  defaultLanguage: 'ko-KR',
  supportedLanguages: ['ko-KR', 'en-US', 'fr-FR'],
  contractAddresses: {
    evm: env['SEPOLIA_CONTRACT_ADDRESS'] || '',
    tron: env['TRON_CONTRACT_ADDRESS'] || '',
    solana: env['SOLANA_PROGRAM_ID'] || '',
    solanaState: env['SOLANA_STATE_ACCOUNT'] || '',
    aptos: env['APTOS_CONTRACT_ADDRESS'] || ''
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
