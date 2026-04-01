/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

import 'zone.js';  // Included with Angular CLI.
import { Buffer } from 'buffer';

/***************************************************************************************************
 * APPLICATION IMPORTS
 */

// Blockchain SDKs (ethers, solana, aptos) require these globals
(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
  version: '',
  nextTick: (fn: any) => setTimeout(fn, 0)
};
(window as any).Buffer = Buffer;
