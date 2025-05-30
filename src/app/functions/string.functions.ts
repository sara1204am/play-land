/*   _______    _        _
 ** |__   __|  | |      | |
 **    | |_   _| |_ __ _| |_ ___  _ __
 **    | | | | | __/ _` | __/ _ \| '__|
 **    | | |_| | || (_| | || (_) | |
 **    |_|\__,_|\__\__,_|\__\___/|_|
 **-----All copyrights-----------------
 */

import { isString, template } from 'lodash-es';
export default class StringFunctions {
  /**
   * Uses the "Lodash" library to returns a pure compiled string template with the data.
   * {@link https://lodash.com/docs/4.17.15#template}
   * @example
   * // Returns 'hello fred!'
   * const base = 'hello <%= user %>!';
   * const data = { 'user': 'fred' };
   * return StringFunctions.compileLodashTemplate(base, data);
   *
   * @static
   * @param {string} base Base string template.
   * @param {object} data Data to be used in the template.
   * @return {*}  {string}  Compiled string template.
   * @memberof StringFunctions
   */
  static compileLodashTemplate(base: string, data: object): string {
    const tmpl = template(base);
    try {
      return tmpl(data);
    } catch (e) {
      return '';
    }
  }

  /**
   * Strips and removes the HTML tags for the content of the data.
   *
   * @export
   * @param {string} data Data to be parsed.
   * @returns {string}
   */
  static stripHtmlTags(data: string): string {
    if (isString(data)) {
      return data.replace(
        /(<\?[a-z]*(\s[^>]*)?\?(>|$)|<!\[[a-z]*\[|\]\]>|<!DOCTYPE[^>]*?(>|$)|<!--[\s\S]*?(-->|$)|<[a-z?!\/]([a-z0-9_:.])*(\s[^>]*)?(>|$))/gi,
        '',
      );
    }
    return data;
  }

  /**
   * Returns a trimmed string value without the new line characters at the beginning and at the end.
   *
   * @static
   * @param {string} str  String value to be trimmed.
   * @return {*}  {string}  Trimmed string value.
   * @memberof StringFunctions
   */
  static trimString(str: string): string {
    if (str?.length) {
      return str.trim().replace(/^\n+|\n+$/g, '');
    }
    return str;
  }

  /**
   * From any input value returns a formatted value to show a pretty-printing formatted text.
   *
   * @param {*} object
   * @returns {string}
   * @memberof StringFunctionsService
   */
  static syntaxHighlight(object: any): string {
    if (typeof object !== 'string') {
      object = JSON.stringify(object, undefined, 2);
    }
    object = object
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return object.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match: any) => {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return `<span class="${cls}">${match}</span>`;
      },
    );
  }

  /**
   * Makes a regex replace.
   *
   * @export
   * @param {string} text base text to be modified.
   * @returns {string}
   */
  static regExpEscape(text: string): string {
    return text ? text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') : text;
  }

  /**
   * From a Camel Case string value returns a non Camel Case string value.
   * @example
   * // Returns 'example camel case string'
   * deCamelize('exampleCamelCaseString');
   *
   * @param {string} stringValue Initial Camel Case string value.
   * @param {string} [stringSeparator=' '] output string value separator.
   * @param {boolean} [lowerCase=false] If is true returns the response in lower case type.
   * @returns {string}
   * @memberof GenericService
   */
  static deCamelize(
    stringValue: string,
    stringSeparator: string = ' ',
    lowerCase: boolean = false,
  ): string {
    if (typeof stringValue !== 'string') {
      throw new TypeError('Expected a string');
    }
    const out = stringValue
      .replace(/([a-z\d])([A-Z])/g, `$1${stringSeparator}$2`)
      .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, `$1${stringSeparator}$2`);
    return lowerCase ? out.toLowerCase() : out;
  }

  /**
   * Generate and returns an UUID v4 string value.
   *
   * @returns {string}
   * @memberof GenericService
   */
  static getUuidv4(): string {
    return `${[1e7]}${-1e3}${-4e3}${-8e3}${-1e11}`.replace(/[018]/g, (c: any) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16),
    );
  }

  /**
   * Returns a random UUID string value with the mask specified.
   * The mask can contain the following characters:
   * - A: Random letter.
   * - #: Random number.
   * @example
   * // Returns 'A1A1A1-1A1'
   * getUUID('AAAAAA-##');
   * // Returns 'A1A1A1-1A1'
   * getUUID();
   *
   * @static
   * @param {string} [mask='AAAAAA-##']
   * @return {*}  {string}
   * @memberof StringFunctions
   */
  static getUUID(mask: string = 'AAAAAA-##'): string {
    return mask
      .replace(/A/g, () =>
        Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, '')
          .substr(0, 1),
      )
      .replace(/#/g, () => Math.floor(Math.random() * 10).toString());
  }

  /**
   * Returns a random full name.
   *
   * @static
   * @param {string} [separator=' ']  Separator between first and last name.
   * @param {boolean} [firstNameOnly=false]  If is true returns only the first name.
   * @return {*}  {string}  Random full name or first name.
   * @memberof StringFunctions
   */
  static randomName(
    separator: string = ' ',
    firstNameOnly: boolean = false,
  ): string {
    const firstNames = [
      'Emma',
      'Liam',
      'Olivia',
      'Noah',
      'Ava',
      'Isabella',
      'Sophia',
      'Mia',
      'Charlotte',
      'Amelia',
      'Harper',
      'Evelyn',
      'Abigail',
      'Emily',
      'Elizabeth',
      'Mila',
      'Ella',
      'Avery',
      'Sofia',
      'Camila',
    ];

    const lastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Jones',
      'Brown',
      'Davis',
      'Miller',
      'Wilson',
      'Moore',
      'Taylor',
      'Anderson',
      'Thomas',
      'Jackson',
      'White',
      'Harris',
      'Martin',
      'Thompson',
      'Garcia',
      'Martinez',
      'Robinson',
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];

    if (firstNameOnly) {
      return firstName;
    }

    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName}${separator}${lastName}`;
  }

  /**
   * Returns a random string with the length specified.
   *
   * @static
   * @param {number} stringLength Length of the string.
   * @param {string} [separator=' ']  Separator between words.
   * @param {boolean} [firstUpper=false]  If true, the first letter of each word will be in upper case.
   * @return {*}  {string}  Random string.
   * @memberof StringFunctions
   */
  static randomString(
    stringLength: number,
    separator: string = ' ',
    firstUpper: boolean = false,
  ): string {
    const words = [
      'airplane',
      'apple',
      'ball',
      'banana',
      'carrot',
      'cat',
      'dog',
      'elephant',
      'flower',
      'guitar',
      'house',
      'island',
      'jungle',
      'kangaroo',
      'lemon',
      'mountain',
      'nest',
      'ocean',
      'piano',
      'queen',
      'river',
      'sun',
      'tiger',
      'umbrella',
      'violet',
      'water',
      'xylophone',
      'yacht',
      'zebra',
    ];

    if (firstUpper) {
      words.forEach((word: string, index: number) => {
        words[index] = word.charAt(0).toUpperCase() + word.slice(1);
      });
    }

    return [...Array(stringLength).keys()]
      .map(() => words[Math.floor(Math.random() * words.length)])

      .join(separator);
  }

  /**
   * Returns a random color or an object with all the colors.
   * NOTE: This function is used to generate random colors for the charts.
   *
   * @static
   * @template T
   * @param {boolean} [onlyOneColor=false] If true returns only one color.
   * @return {*}  {({ [key: string]: T } | T)}
   * @memberof StringFunctions
   */
  /**
   * Returns a random color or an array with all the colors.
   * NOTE: This function is used to generate random colors for the charts.
   *
   * @static
   * @param {boolean} [onlyOneColor=false]  If true returns only one color.
   * @param {boolean} [shuffleColors=false]  If true returns the array with the colors shuffled.
   * @return {*}  {(string | string[])} Random color or array with all the colors.
   * @memberof StringFunctions
   */
  static getRandomColors(
    onlyOneColor: boolean = false,
    shuffleColors: boolean = false,
  ): string | string[] {
    const tmpColors = [
      '#FF7F50',
      '#008B8B',
      '#FF1493',
      '#FFD700',
      '#FF69B4',
      '#4B0082',
      '#F0E68C',
      '#E6E6FA',
      '#00FF00',
      '#FF00FF',
      '#000080',
      '#808000',
      '#DDA0DD',
      '#FF0000',
      '#FA8072',
      '#008080',
      '#EE82EE',
      '#F5DEB3',
      '#FFFF00',
      '#7FFFD4',
      '#5F9EA0',
      '#6495ED',
      '#FF8C00',
      '#228B22',
      '#9370DB',
      '#3CB371',
      '#6B8E23',
      '#FF6347',
    ];

    if (onlyOneColor) {
      const randomIndex = Math.floor(Math.random() * tmpColors.length);

      return tmpColors[randomIndex];
    }

    return shuffleColors
      ? tmpColors.sort(() => 0.5 - Math.random())
      : tmpColors;
  }

  /**
   * Encrypts a string value using the Caesar cipher algorithm.
   *
   * @static
   * @param {string} value  String value to be encrypted.
   * @param {number} [shift=3]  Number of positions to shift the characters.
   * @return {*}  {string}  Encrypted string value.
   * @memberof StringFunctions
   */
  static encryptValue(value: string, shift: number = 3): string {
    return Array.from(value)
      .map((char) => {
        const charCode = char.charCodeAt(0);
        if (charCode >= 65 && charCode <= 90) {
          return String.fromCharCode(((charCode - 65 + shift) % 26) + 65);
        } else if (charCode >= 97 && charCode <= 122) {
          return String.fromCharCode(((charCode - 97 + shift) % 26) + 97);
        }
        return char;
      })
      .join('');
  }

  static decryptValue(encryptedValue: string, shift: number = 3): string {
    return StringFunctions.encryptValue(encryptedValue, 26 - shift);
  }
}
