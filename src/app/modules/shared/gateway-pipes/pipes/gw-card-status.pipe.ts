import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gwCardStatus'
})
export class GwCardStatusPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
