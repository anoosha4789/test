import { Pipe, PipeTransform } from '@angular/core';

/*
 * Truncate the string & show ellipse ...
 * Takes an limit argument that defaults to 250.
 * Usage:
 *   value | gwTruncate:limit
 * Example:
 *   {{ DummyText | gwTruncate:5 }}
 *   formats to: Dummy...
*/
@Pipe({
  name: 'gwTruncate'
})
export class GwTruncatePipe implements PipeTransform {

  transform(value: string, limit = 250, ellipsis = '...', completeWords = false): string {
    if (completeWords) {
      limit = value.substr(0, limit).lastIndexOf(' ');
    }
    return value && value.length > limit ? `${value.substr(0, limit)}${ellipsis}` : value;
  }

}
