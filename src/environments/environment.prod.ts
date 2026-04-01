import { env } from './.env';

export const environment = {
  production: true,
  version: env['npm_package_version'] + '-dev',
  serverUrl: '/api',
  defaultLanguage: 'ko-KR',
  supportedLanguages: ['ko-KR', 'en-US', 'fr-FR'],
  contractAddresses: {
    evm: '0xAB5cc4E4bA6DaB8A6985F53C23280e2ffCD5863D',
    tron: 'TUXXUxtb1SKjQXcbPPEwowTZAZXR3hsRxW',
    solana: '5W3ujVoC2VsvhUerEo7Ezo9phbsKeVCuAUXKdnZuUCXo',
    solanaState: 'F7NjVkTsHmSYoB8KoVQHxtayrx6PdqJRSHcEmjSBdXvL',
    aptos: '0x0572c4964fabd21001c07ad50c20f960d4f2a8a49383914a692492c64ce39a80'
  }
};
