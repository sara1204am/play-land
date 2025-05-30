/*   _______    _        _
 ** |__   __|  | |      | |
 **    | |_   _| |_ __ _| |_ ___  _ __
 **    | | | | | __/ _` | __/ _ \| '__|
 **    | | |_| | || (_| | || (_) | |
 **    |_|\__,_|\__\__,_|\__\___/|_|
 **-----All copyrights-----------------
 */

import { Modifier } from '@popperjs/core';

export default class PlatformFunctions {
  // START ELEMENT CONFIGURATIONS/VARIABLES
  /**
   * Returns the default modifiers for the "popper.js" library.
   *
   * @static
   * @return {*}  {Partial<Modifier<any, any>>[]}
   * @memberof PlatformFunctions
   */
  static popperModifiers(): Partial<Modifier<any, any>>[] {
    return [
      {
        name: 'offset',
        options: {
          offset: [0, 0],
        },
      },
    ];
  }
  // END ELEMENT CONFIGURATIONS/VARIABLES
}
