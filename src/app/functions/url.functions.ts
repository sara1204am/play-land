/*   _______    _        _
 ** |__   __|  | |      | |
 **    | |_   _| |_ __ _| |_ ___  _ __
 **    | | | | | __/ _` | __/ _ \| '__|
 **    | | |_| | || (_| | || (_) | |
 **    |_|\__,_|\__\__,_|\__\___/|_|
 **-----All copyrights-----------------
 */

export default class UrlFunctions {
  /**
   * From the HTML document returns the <base> tag value.
   *
   * @export
   * @returns {string}
   */
  static getBaseHref(): string | null {
    const baseHref: any = document.getElementsByTagName('base');
    if (baseHref) {
      return baseHref[0].getAttribute('href');
    }
    return null;
  }

  /**
   * Checks if the current url is in the list of ignored paths.
   *
   * @static
   * @param {Array<any>} [ignoredPaths=[]]  Array of paths to ignore.
   * @param {string} [urlToCheck] Url to check. If not provided, the current url is used.
   * @return {*}  {boolean} True if the url is in the list of ignored paths.
   * @memberof UrlFunctions
   */
  static checkIgnoredPaths(
    ignoredPaths: any[] = [],
    urlToCheck?: string,
  ): boolean {
    const regexPaths = ignoredPaths.map((item) => item.replace('/*', '/.*'));
    let location = urlToCheck || window.location.pathname;
    const baseHref: string | null = this.getBaseHref();

    if (baseHref) {
      location = location.replace(baseHref, '/');
    }

    return regexPaths.some((item) => {
      const regex = new RegExp(`^${item}$`, 'i');
      return regex.test(location);
    });
  }

  /**
   * With the HTML head "base" tag returns the value of the base url of the app.
   * {@link https://stackoverflow.com/a/30411939}
   * @example
   * // Returns http://localhost:4200 or http://localhost:4200/my-app
   * getBaseURL();
   *
   * @returns {string}
   * @memberof UrlFunctions
   */
  static getBaseURL(): string {
    const baseHref = document.querySelector('base')?.href || '';
    return baseHref.endsWith('/') ? baseHref.slice(0, -1) : baseHref;
  }
}
