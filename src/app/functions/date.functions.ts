/*   _______    _        _
 ** |__   __|  | |      | |
 **    | |_   _| |_ __ _| |_ ___  _ __
 **    | | | | | __/ _` | __/ _ \| '__|
 **    | | |_| | || (_| | || (_) | |
 **    |_|\__,_|\__\__,_|\__\___/|_|
 **-----All copyrights-----------------
 */

import { DatePeriod } from '..';

import { isNumber, isString } from 'lodash-es';

import { Tp41DpDate } from '@tp41-core/tp41-autofields-form/widgets/date/date-input/interfaces';
import MathFunctions from './math.functions';

import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import * as toObject from 'dayjs/plugin/toObject';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(isoWeek);
dayjs.extend(toObject);
dayjs.extend(customParseFormat);

export default class DateFunctions {
  /**
   * Converts an Javascript "Date" value to an object
   *
   * @static
   * @param {Date} jsDate
   * @returns {Tp41DpDate}
   * @memberof DateService
   */
  static fromJSDate(jsDate: Date): Tp41DpDate {
    return {
      year: jsDate.getFullYear(),
      month: jsDate.getMonth() + 1,
      day: jsDate.getDate(),
    };
  }

  /**
   * Returns a Tp41DpDate object from a date string.
   *
   * @static
   * @param {string} date Date string to be parsed.
   * @param {string} [format] Date format to be used.
   * @return {*}  {Tp41DpDate}  Returns a Tp41DpDate object.
   * @memberof DateFunctions
   */
  static fromString(date: string, format?: string): Tp41DpDate {
    const dateObj = dayjs.utc(date, format?.toUpperCase());

    return {
      year: dateObj.year(),
      month: dateObj.month() + 1,
      day: dateObj.date(),
    };
  }

  /**
   * Returns the difference between two dates.
   *
   * @static
   * @param {string} dateA  Initial date.
   * @param {string} dateB  Final date.
   * @param {string} [format] Date format to be used.
   * @return {*}  {number}  Returns the difference between two dates.
   * @memberof DateFunctions
   */
  static calculateDifference(
    dateA: string,
    dateB: string,
    format?: string,
  ): number {
    const dateObjA = dayjs.utc(dateA, format?.toUpperCase());
    const dateObjB = dayjs.utc(dateB, format?.toUpperCase());

    return dateObjA.diff(dateObjB, 'days');
  }

  /**
   * Converts a object to a Javascript "Date" value.
   *
   * @static
   * @param {Tp41DpDate} date
   * @returns {Date}
   * @memberof DateService
   */
  static toJSDate(date: any): Date {
    const jsDate = new Date(date.year, date.month - 1, date.day, 12);
    if (!isNaN(jsDate.getTime())) {
      jsDate.setFullYear(date.year);
    }
    return jsDate;
  }

  /**
   * Returns a formatted date string based on the "any" interface ({year, month, day}).
   *
   * @param {any} date Date to be parsed.
   * @returns {string}
   * @memberof DateService
   */
  static dateFormat(date: Tp41DpDate): string {
    const pad = (val: number) => MathFunctions.padNumber(val);
    if (date && date.year >= 0 && date.month >= 0 && date.day >= 0) {
      return `${date.year}-${isNumber(date.month) ? pad(date.month) : ''}-${
        isNumber(date.day) ? pad(date.day) : ''
      }`;
    }
    return '';
  }

  /**
   * Converts string(s) of valid well formed date strings to a "Date" object value(s).
   *
   * @param {(Array<string> | string)} value
   * @returns {(Array<any> | any | any)}
   * @memberof DateService
   */
  static dateParse(value: Array<string> | string): Array<any> | any | any {
    const tempValue: any = value;
    const getValue = (val: string) => {
      if (DateFunctions.validateDateString(val)) {
        const tmp = dayjs.utc(val);
        return {
          year: tmp.year(),
          month: tmp.month() + 1,
          day: tmp.date(),
        };
      }
      return null;
    };

    if (tempValue) {
      if (Array.isArray(tempValue)) {
        return tempValue.map((val: string) => getValue(val));
      } else if (isString(tempValue)) {
        return getValue(tempValue);
      }
    }

    return {};
  }

  /**
   * From a "any" value adds N period values.
   *
   * @static
   * @param {any} [date=this.getToday()] Date to be added.
   * @param {DatePeriod} [period="d"] Period to be added.
   * @param {number} [qty=1]  Quantity of periods to be added.
   * @return {*}  {any}
   * @memberof DateFunctions
   */
  static getNextDate(
    date: any = this.getToday(),
    period: DatePeriod = 'd',
    qty: number = 1,
  ): any {
    let tempDate: dayjs.Dayjs = dayjs(this.dateFormat(date));

    if (tempDate.isValid()) {
      tempDate = tempDate.add(qty, period);
      return this.dateParse(tempDate.format());
    }
    return date;
  }

  /**
   * From a "any" subtract N period values.
   *
   * @static
   * @param {any} [date=this.getToday()] Date to be subtracted.
   * @param {DatePeriod} [period="d"] Period to be subtracted.
   * @param {number} [qty=1]  Quantity of periods to be subtracted.
   * @return {*}  {any}
   * @memberof DateFunctions
   */
  static getPrevDate(
    date: any = this.getToday(),
    period: DatePeriod = 'd',
    qty: number = 1,
  ): any {
    let tempDate: dayjs.Dayjs = dayjs(this.dateFormat(date));
    if (tempDate.isValid()) {
      tempDate = tempDate.subtract(qty, period);
      return this.dateParse(tempDate.format());
    }
    return date;
  }

  /**
   * Check if the firstDate is greater than the secondDate.
   *
   * @param {any} firstDate  First date to be compared.
   * @param {any} secondDate Second date to be compared.
   * @returns {boolean}
   * @memberof DateService
   */
  static dateIsAfter(firstDate: any, secondDate: any): boolean {
    if (firstDate && secondDate) {
      const date1 = this.toJSDate(firstDate);
      const date2 = this.toJSDate(secondDate);
      return dayjs(date1).isAfter(dayjs(date2));
    }
    return false;
  }

  /**
   * Check if the firstDate is lower than the secondDate.
   *
   * @param {any} firstDate  First date to be compared.
   * @param {(any | string)} secondDate  Second date to be compared.
   * @returns {boolean}
   * @memberof DateService
   */
  static dateIsBefore(firstDate: any, secondDate: any): boolean {
    if (firstDate && secondDate) {
      const date1 = this.toJSDate(firstDate);
      const date2 = this.toJSDate(secondDate);
      return dayjs(date1).isBefore(dayjs(date2));
    }
    return false;
  }

  /**
   * From a given "any" return the ISO 8601 week day number.
   *
   * @param {any} date Date to be converted.
   * @returns {number}
   * @memberof DateService
   */
  static getWeekday(date: any): number | null {
    if (date) {
      const jsDate = this.toJSDate(date);
      const day = jsDate.getDay();
      return day === 0 ? 7 : day;
    }
    return null;
  }

  /**
   * Returns the current date on "any" format.
   *
   * @returns {any}
   * @memberof DateService
   */
  static getToday(): any {
    return this.fromJSDate(new Date());
  }

  /**
   * Validates an "any" date object.
   *
   * @param {any} date Date to be validated.
   * @returns {boolean}
   * @memberof DateService
   */
  static isValidObjectDate(date: any): boolean {
    if (
      !date ||
      !Number.isInteger(date.year) ||
      !Number.isInteger(date.month) ||
      !Number.isInteger(date.day)
    ) {
      return false;
    }

    const jsDate = this.toJSDate(date);

    return (
      !isNaN(jsDate.getTime()) &&
      jsDate.getFullYear() === date.year &&
      jsDate.getMonth() + 1 === date.month &&
      jsDate.getDate() === date.day
    );
  }

  /**
   * Validates an "any" date string.
   *
   * @param {string} stringDate Date to be validated.
   * @returns {boolean} True if the date is valid.
   * @memberof DateService
   */
  static validateDateString(stringDate: string): boolean {
    const regex = new RegExp(
      /(((20[012]\d|19\d\d)|(1\d|2[0123]))-((0[0-9])|(1[012]))-((0[1-9])|([12][0-9])|(3[01])))|(((0[1-9])|([12][0-9])|(3[01]))-((0[0-9])|(1[012]))-((20[012]\d|19\d\d)|(1\d|2[0123])))|(((20[012]\d|19\d\d)|(1\d|2[0123]))\/((0[0-9])|(1[012]))\/((0[1-9])|([12][0-9])|(3[01])))|(((0[0-9])|(1[012]))\/((0[1-9])|([12][0-9])|(3[01]))\/((20[012]\d|19\d\d)|(1\d|2[0123])))|(((0[1-9])|([12][0-9])|(3[01]))\/((0[0-9])|(1[012]))\/((20[012]\d|19\d\d)|(1\d|2[0123])))|(((0[1-9])|([12][0-9])|(3[01]))\.((0[0-9])|(1[012]))\.((20[012]\d|19\d\d)|(1\d|2[0123])))|(((20[012]\d|19\d\d)|(1\d|2[0123]))\.((0[0-9])|(1[012]))\.((0[1-9])|([12][0-9])|(3[01])))/,
    );

    return regex.test(stringDate);
  }

  /**
   * Validates an "any" time string.
   *
   * @static
   * @param {string} stringTime Time to be validated.
   * @return {*}  {boolean} True if the string is a valid time.
   * @memberof DateFunctions
   */
  static validateTimeString(stringTime: string): boolean {
    const regex = new RegExp(/^([01]\d|2[0-3])(:[0-5]\d)?$/);

    return regex.test(stringTime);
  }

  /**
   * From a string gets a well formed date string ISO 8601 on a UTC timezone.
   * {@link https://en.wikipedia.org/wiki/ISO_8601}
   *
   * @param {string} dateString well formed string date.
   * @returns {Date}
   * @memberof DateService
   */
  static getUTCDate(dateString: string): Date | null {
    const tmp = dayjs.utc(dateString);

    if (tmp.isValid()) {
      return tmp.toDate();
    }
    return null;
  }

  /**
   * From a string gets a well formed date string ISO 8601
   * {@link https://en.wikipedia.org/wiki/ISO_8601}
   *
   * @param {string} dateString
   * @returns {Date}
   * @memberof DateService
   */
  static getStandardDate(dateString: string): Date | null {
    const tmp = dayjs(dateString);

    if (tmp.isValid()) {
      return tmp.toDate();
    }
    return null;
  }

  /**
   * From a array collection that contains a date field, sort the array by date field (ASC or DESC order).
   *
   * @static
   * @param {Array<any>} arr  Array to be sorted.
   * @param {string} dateField  Date field to be used.
   * @param {boolean} [asc=true]  Sort order.
   * @return {*}  {Array<any>}  Returns the sorted array.
   * @memberof DateFunctions
   */
  static sortArrayByDate(
    arr: Array<any>,
    dateField: string,
    asc: boolean = true,
  ): Array<any> {
    if (arr && dateField) {
      return arr
        .map((x) => {
          if (!x[dateField]) {
            return x;
          }

          if (typeof x[dateField] === 'string') {
            x[dateField] = new Date(x[dateField]);
          }

          return x;
        })
        .sort((a, b) => {
          if (asc) {
            return a[dateField] - b[dateField];
          }
          return b[dateField] - a[dateField];
        });
    }
    return arr;
  }
}
