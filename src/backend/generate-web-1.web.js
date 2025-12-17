/**
 * Boilerplate web method from wix app generate
 * 
 * This is the simplest possible web method to test if the backend is working.
 * 
 * Usage from frontend:
 * import { multiply } from '<path>/generate-web-1.web.js';
 * const result = await multiply(3, 4); // returns 12
 */

import { webMethod, Permissions } from '@wix/web-methods';

export const multiply = webMethod(
  Permissions.Anyone,
  (a, b) => {
    return a * b;
  },
);


