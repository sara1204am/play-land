/*   _______    _        _
 ** |__   __|  | |      | |
 **    | |_   _| |_ __ _| |_ ___  _ __
 **    | | | | | __/ _` | __/ _ \| '__|
 **    | | |_| | || (_| | || (_) | |
 **    |_|\__,_|\__\__,_|\__\___/|_|
 **-----All copyrights-----------------
 */

import * as CryptoJS from 'crypto-js';

type CsvHeader = {
  key: string;
  title: string;
};

type ImageDimensionsResponse = {
  width: number;
  height: number;
};

export default class FileFunctions {
  /**
   * Calcs the max file size.
   *
   * @param {string} size Physical size of the file in bytes.
   * @returns {number}
   * @memberof FileService
   */
  static getMaxSize(size: string): number {
    if (!size) {
      return 0;
    }

    size = size.toUpperCase();
    const values = ['KB', 'MB', 'GB', 'TB', 'PB'];
    const foundValue = values.find((value, i) => size.includes(value));

    if (foundValue) {
      const i = values.indexOf(foundValue);
      return Math.pow(1024, i + 1) * parseFloat(size.replace(foundValue, ''));
    }

    return 0;
  }

  /**
   * Returns the extension of the file.
   *
   * @param {string} fileName Original file name to evaluate.
   * @param {boolean} [addOutputSeparator=true] If true, the output will be ".EXTENSION" instead of "EXTENSION".
   * @returns {string}  File extension.
   * @memberof FileService
   */
  static getFileExtension(
    fileName: string,
    addOutputSeparator: boolean = true,
  ): string {
    if (!fileName) {
      return '';
    }

    const lastDotIndex = fileName.lastIndexOf('.');
    const ext =
      lastDotIndex >= 0
        ? fileName
            .slice(lastDotIndex + 1)
            .split('?')[0]
            .split('#')[0]
        : '';
    return `${addOutputSeparator && ext ? '.' : ''}${ext}`.toLowerCase();
  }

  /**
   * Get the file name without the extension.
   *
   * @param {string} fileName File name with extension: "example.jpg" or "document.rtf".
   * @returns {string}  File name without extension: "example" or "document".
   * @memberof FileService
   */
  static getFileName(fileName: string): string {
    return fileName ? fileName.replace(/.[^.]+$/, '') : '';
  }

  /**
   * Get the image dimensions of a file (only for images).
   *
   * @static
   * @param {File} file File to get the dimensions.
   * @return {*}  {Promise<ImageDimensionsResponse>}  Dimensions of the image.
   * @memberof FileFunctions
   */
  static async getImageDimensions(
    file: File,
  ): Promise<ImageDimensionsResponse> {
    if (!(file instanceof File)) {
      return { width: 0, height: 0 };
    }

    return new Promise((resolve) => {
      const img = document.createElement('img');
      const blob = URL.createObjectURL(file);
      img.src = blob;
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
    });
  }

  /**
   * Convert a json object into a csv format.
   *
   * @param {string[]} headerList list of hedaers of the document.
   * @param {object} [data=null] get data of the docuement.
   * @returns {string}  CSV string of the document.
   * @memberof FileService
   */
  static convertToCSV(
    headerList: CsvHeader[],
    data?: any[],
    addIdCol?: boolean,
    cellSeparator: string = ',',
    rowSeparator: string = '\r\n',
  ): string {
    let out = '';
    let row = '';

    if (addIdCol) {
      row += '#,';
    }

    headerList.forEach((v) => {
      row += v.title + ',';
    });
    row = row.slice(0, -1);
    out += row + rowSeparator;

    if (data?.length) {
      data.forEach((v, k) => {
        const row = [];
        if (addIdCol) {
          row.push(k + 1);
        }

        headerList.forEach((v1) => {
          row.push(v[v1.key]?.replace(cellSeparator, ''));
        });

        out += row.join(',') + rowSeparator;
      });
    }
    return out;
  }

  /**
   * Download a File in csv format
   *
   * @param {string} [filename='file'] File name of the document.
   * @param {string[]} headers Headers list of the document.
   * @param {object} [data=null] Data of the document.
   * @memberof FileService
   */
  static downloadCsvFile(
    filename: string = 'file',
    headers: CsvHeader[],
    data?: any[],
    addIdCol?: boolean,
    cellSeparator: string = ',',
    rowSeparator: string = '\r\n',
  ): void {
    const csvData = this.convertToCSV(
      headers,
      data,
      addIdCol,
      cellSeparator,
      rowSeparator,
    );
    const blob = new Blob(['\ufeff' + csvData], {
      type: 'text/csv;charset=utf-8;',
    });
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser =
      navigator.userAgent.indexOf('Safari') !== -1 &&
      navigator.userAgent.indexOf('Chrome') === -1;

    if (isSafariBrowser) {
      dwldLink.setAttribute('target', '_blank');
    }

    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', filename + '.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  /**
   * Parse the base64 content and converts it to a Blob output.
   *
   * @static
   * @param {string} base64String Base64 string.
   * @return {*}  {Blob} Blob data.
   * @memberof FileFunctions
   */
  static base64ToFile(base64String: string, fileName?: string): File {
    const temp = Math.round(Date.now() / 1000);
    fileName = fileName ?? `taked_picture_${temp}.jpg`;
    const [header, base64Payload] = base64String.split(',');
    const byteString = atob(base64Payload);
    const mimeString = header.split(':')[1].split(';')[0];
    const ia = new Uint8Array(
      Array.from(byteString, (char) => char.charCodeAt(0)),
    );
    return new File([ia], fileName, { type: mimeString });
  }

  /**
   * Convert a file to base64 string.
   *
   * @static
   * @param {File} file File to convert.
   * @return {*}  {Promise<string>} Promise with the base64 string.
   * @memberof FileFunctions
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent) => {
        let tmp = (e.target as FileReader).result;
        if (typeof tmp === 'string') {
          // tmp = tmp.split(',')[1];
        }
        resolve(tmp as string);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Calculate the md5 hash of a file.
   *
   * @static
   * @param {File} file File to calculate the hash.
   * @return {*}  {Promise<string>} Promise with the hash.
   * @memberof FileFunctions
   */
  static async calculateFileMd5(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const wordArray = CryptoJS.lib.WordArray.create(reader.result as any);
        const hash = CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex);
        resolve(hash);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
}
