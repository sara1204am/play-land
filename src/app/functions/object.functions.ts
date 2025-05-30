/*   _______    _        _
 ** |__   __|  | |      | |
 **    | |_   _| |_ __ _| |_ ___  _ __
 **    | | | | | __/ _` | __/ _ \| '__|
 **    | | |_| | || (_| | || (_) | |
 **    |_|\__,_|\__\__,_|\__\___/|_|
 **-----All copyrights-----------------
 */

export default class ObjectFunctions {
  /**
   * Try to parse and convert the input string value to a valid Javascript value.
   *
   * @param {string} str Value to evaluate.
   * @returns {JSON}
   * @memberof GenericService
   */
  static parseJSON(str: string): any {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }
}
