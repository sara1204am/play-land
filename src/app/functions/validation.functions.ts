/*   _______    _        _
 ** |__   __|  | |      | |
 **    | |_   _| |_ __ _| |_ ___  _ __
 **    | | | | | __/ _` | __/ _ \| '__|
 **    | | |_| | || (_| | || (_) | |
 **    |_|\__,_|\__\__,_|\__\___/|_|
 **-----All copyrights-----------------
 */

export default class ValidationFunctions {
  /**
   * Checks of the value is Null or Undefined.
   *
   * @static
   * @param {*} value value to evaluate
   * @returns {boolean} true if the value is Null or Undefined
   * @memberof tp41Utils
   */
  static isNullOrUndefined(value: any): boolean {
    return value === null || value === undefined;
  }
}
