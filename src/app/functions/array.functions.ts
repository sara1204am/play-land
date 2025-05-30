/*   _______    _        _
 ** |__   __|  | |      | |
 **    | |_   _| |_ __ _| |_ ___  _ __
 **    | | | | | __/ _` | __/ _ \| '__|
 **    | | |_| | || (_| | || (_) | |
 **    |_|\__,_|\__\__,_|\__\___/|_|
 **-----All copyrights-----------------
 */

import { ArrayComparisonResult } from '../interfaces';

export default class ArrayFunctions {
  /**
   * Compares two arrays to get the differences between the first array against the second array based on a key or multiple keys to check for differences.
   * @example
   * // Returns
   * // {
   * //  newItems: [{ a: 3, b: 3 }],
   * //  updateItems: [{ id: 2, a: 3, b: 2 }],
   * //  removeItems: [1]
   * // }
   * const modifiedArray = [{ id: 1, a: 1, b: 1, c: 7 }, { id: 2, a: 2, b: 2, c: 8 }];
   * const initialArray = [{ id: 2, a: 3, b: 2, c: 6 }, { a: 3, b: 3, c: 7 }];
   * compareArrays(initialArray, modifiedArray, ['a', 'b'], 'id');
   *
   * @param {any[]} modifiedArray Modified array that contains all the modifications.
   * @param {any[]} initialArray Initial array without modifications.
   * @param {any[]} keysToCheck Keys to use to compare the first and second array: ['name'] || ['id', 'name', 'label'].
   * @param {(string | number)} [mainId='id'] Primary key per record for each array items.
   * @returns {ArrayComparisonResult}
   * @memberof ArrayFunctionsService
   */
  static compareArrays(
    modifiedArray: any[],
    initialArray: any[],
    keysToCheck: any[],
    mainId: string | number = 'id'
  ): ArrayComparisonResult {
    if (!Array.isArray(modifiedArray) || !Array.isArray(initialArray)) {
      return {};
    }

    const initialArrayMap = new Map(
      initialArray.map((item) => [item[mainId], item])
    );
    const modifiedArrayMap = new Map(
      modifiedArray.map((item) => [item[mainId], item])
    );

    const newItems = [];
    const updatedItems = [];

    for (const [id, item] of modifiedArrayMap) {
      if (!initialArrayMap.has(id)) {
        newItems.push(item);
      } else {
        const initialItem = initialArrayMap.get(id);
        for (const key of keysToCheck) {
          if (item[key] !== initialItem[key]) {
            updatedItems.push(item);
            break;
          }
        }
      }
    }

    const removedItems = [];
    for (const id of initialArrayMap.keys()) {
      if (!modifiedArrayMap.has(id)) {
        removedItems.push(id);
      }
    }

    return {
      newItems,
      updatedItems,
      removedItems,
    };
  }
}
