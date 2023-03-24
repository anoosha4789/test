import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gwGaugeLabelFormatter'
})
export class GwGaugeLabelFormatterPipe implements PipeTransform {

  transform(value: number, unit: string): unknown {
    if (value) {
      const result = parseFloat(value.toString().replace(/,/g, ""));
      return unit.toLowerCase() === 'pa' && result > 0 && result.toString().length > 7 ? this.setDisplayFormat(result) : value.toFixed(0);
    } else {
      return value;
    }
  }

  setDisplayFormat(value: number) {
    return value.toString().split('.')[0]?.length > 7 ? `${(value/10000000).toFixed(2)}e+7` : value.toFixed(0); 
  }

}
