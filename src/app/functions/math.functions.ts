/*   _______    _        _
 ** |__   __|  | |      | |
 **    | |_   _| |_ __ _| |_ ___  _ __
 **    | | | | | __/ _` | __/ _ \| '__|
 **    | | |_| | || (_| | || (_) | |
 **    |_|\__,_|\__\__,_|\__\___/|_|
 **-----All copyrights-----------------
 */

import { isNumber } from 'lodash-es';

export default class MathFunctions {
  /**
   * Pads a number with a zero if it is less than 10.
   *
   * @static
   * @param {number} value  Number to pad.
   * @return {*}  {string}  Padded number.
   * @memberof MathFunctions
   */
  static padNumber(value: number): string {
    return isNumber(value) ? `0${value}`.slice(-2) : '';
  }
}
