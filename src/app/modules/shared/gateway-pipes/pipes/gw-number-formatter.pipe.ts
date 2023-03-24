import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gwNumberFormatter'
})

export class GwNumberFormatterPipe implements PipeTransform {

  constructor(private decimalPipe: DecimalPipe) {}

  transform(value: unknown, ...args: unknown[]): unknown {
    if (value !== undefined && value !== null && value !== '' && value !== 0) {
      return Number(this.decimalPipe.transform(value).replace(/,/g, ""));
    } else {
      return value;
    }
  }

}
