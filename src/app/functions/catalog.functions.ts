/*   _______    _        _
 ** |__   __|  | |      | |
 **    | |_   _| |_ __ _| |_ ___  _ __
 **    | | | | | __/ _` | __/ _ \| '__|
 **    | | |_| | || (_| | || (_) | |
 **    |_|\__,_|\__\__,_|\__\___/|_|
 **-----All copyrights-----------------
 */

import { CatalogItemInterface } from '@tp41-core/tp41-assets/interfaces';

import ValidationFunctions from './validation.functions';
import StringFunctions from './string.functions';

export default class CatalogFunctions {
  /**
   * From a catalogs collection returns the label.
   * @example
   * const catalogs = [
   *   {
   *     'value': '1',
   *     'label': 'Abbie Bush',
   *   },
   *   {
   *     'value': '2',
   *     'label': 'Teresa Adams',
   *   },
   * ];
   * const resp = getLabel(catalogs, '2', 'value', 'label', true);
   * // Returns 'Teresa Adams';
   *
   * @param {Catalogs} catalogs Initial catalogs collection.
   * @param {(string | number | any)} value Value to use for the search.
   * @param {string} [valueName='value']  Value "catalogs" data key name to use to search.
   * @param {string} [labelName='label']  Label "catalogs" data key name to use as response.
   * @param {boolean} valueToString If is true converts the "value" param to string.
   * @returns {string}
   * @memberof CatalogFunctions
   */
  static getLabel(
    catalogs: CatalogItemInterface[],
    value: string | number | any,
    valueName: string = 'value',
    labelName: string = 'label',
  ): string {
    if (!catalogs?.length || ValidationFunctions.isNullOrUndefined(value)) {
      return '';
    }

    const t1: any = catalogs.find((v: any) => v[valueName] == value);
    return t1 ? t1[labelName] : '';
  }

  /**
   * From a catalogs collection returns the joined collection of labels.
   * @example
   * const catalogs = [
   *   {
   *     'value': '1',
   *     'label': 'Abbie Bush',
   *   },
   *   {
   *     'value': '2',
   *     'label': 'Teresa Adams',
   *   },
   * ];
   * const resp = getMultiSelectLabel(catalogs, ['1', '2'], 'value', ', ', 'label', true);
   * // Returns 'Abbie Bush, Teresa Adams';
   *
   * @param {Catalogs} catalogs Initial catalogs collection.
   * @param {any[]} values Values to use for the search.
   * @param {string} [valueName='value']  Value "catalogs" data key name to use to search.
   * @param {string} [concatString=', ']  Joins the array response with the "concatString" param.
   * @param {string} [catalogLabelName='label'] Label "catalogs" data key name to use as response.
   * @returns {string}
   * @memberof CatalogFunctions
   */
  static getMultiSelectLabel(
    catalogs: CatalogItemInterface[],
    values: any[],
    valueName: string = 'value',
    concatString: string = ', ',
    catalogLabelName: string = 'label',
  ): string {
    if (!values?.length || !catalogs?.length) return '';

    return values
      .map((v1) => {
        const t1: any = catalogs.find((v2: any) => v2[valueName] == v1);
        return t1 ? t1[catalogLabelName] : false;
      })
      .filter(Boolean)
      .join(concatString);
  }

  /**
   * Likes the "getLabel" function but filtering the "catalogs" data depending on the parent value.
   * @example
   * const catalogs = [
   *   {
   *     'value': 1,
   *     'label': 'Bahamas',
   *   },
   *   {
   *     'value': 2,
   *     'label': 'Iran',
   *     'catalogId': 1,
   *   },
   * ];
   * const resp = getDependantLabel(catalogs, '2', 1', false, 'value', 'label', ', ');
   * // Returns 'Iran';
   *
   * @param {Catalogs} catalogs Initial catalogs collection.
   * @param {*} value Value to use for the search.
   * @param {(string | number)} parentValue Parent Value to use as a filter.
   * @param {boolean} multipleValue If is true treats the initial for a multi select label.
   * @param {string} [valueName='value']  Value "catalogs" data key name to use to search.
   * @param {string} [labelName='label']  Label "catalogs" data key name to use as response.
   * @param {string} [concatString=', ']  Joins the array response with the "concatString" param.
   * @returns {string} Returns the builded catalog value.
   * @memberof CatalogFunctions
   */
  static getDependantLabel(
    catalogs: CatalogItemInterface[],
    value: any,
    parentValue: string | number,
    multipleValue?: boolean,
    valueName: string = 'value',
    labelName: string = 'label',
    concatString: string = ', ',
  ): string | null {
    const tempCatalog = catalogs.filter((x) => x.catalogId === parentValue);

    if (!tempCatalog.length) {
      return multipleValue ? null : '';
    }

    if (multipleValue) {
      return CatalogFunctions.getMultiSelectLabel(
        tempCatalog,
        value,
        valueName,
        concatString,
        labelName,
      );
    }

    return CatalogFunctions.getLabel(
      tempCatalog,
      Number(value) ? parseInt(value, 0) : value,
    );
  }

  /**
   * From a catalogs collection sorts the collection by label.
   *
   * @static
   * @param {CatalogItem[]} catalogData Initial catalogs collection.
   * @param {('asc' | 'desc' | 'none')} [order='asc'] Order to use for the sort.
   * @return {*}  {CatalogItem[]} Returns the sorted collection.
   * @memberof CatalogFunctions
   */
  static sortCatalogCollection(
    catalogData: CatalogItemInterface[],
    order: 'asc' | 'desc' | 'none' = 'asc',
  ): CatalogItemInterface[] {
    switch (order) {
      case 'asc':
        catalogData = catalogData.sort((a: any, b) =>
          a.label.localeCompare(b.label),
        );
        break;
      case 'desc':
        catalogData = catalogData.sort((a: any, b: any) =>
          b.label.localeCompare(a.label),
        );
        break;
      default:
        break;
    }
    return catalogData;
  }

  /**
   * Generates a catalog collection with dummy data.
   *
   * @static
   * @param {number} qty  Quantity of items to generate.
   * @return {*}  {CatalogItemInterface[]}  Returns the generated collection.
   * @memberof CatalogFunctions
   */
  static generateDummyCatalogData(qty: number): CatalogItemInterface[] {
    const icons = [
      'mdi-palette',
      'mdi-format-align-left',
      'mdi-sack-percent',
      'mdi-ocarina',
      'mdi-qrcode',
      'mdi-robot',
      'mdi-robot-industrial',
      'mdi-robot-vacuum',
      'mdi-ruler',
      'mdi-ruler-square-compass',
    ];
    const colors = [
      'text-primary',
      'text-secondary',
      'text-accent',
      'text-neutral',
      'text-error',
    ];

    const getRandomElement = (arr: any[]) =>
      arr[Math.floor(Math.random() * arr.length)];

    return [...Array(qty).keys()].map((i) => ({
      value: `${i}`,
      label: `Option #${i}`,
      icon: `mdi ${getRandomElement(icons)}`,
      bold: Math.random() > 0.5,
      italic: Math.random() > 0.5,
      description: StringFunctions.randomString(5, undefined, true),
      css: getRandomElement(colors),
    }));
  }
}
