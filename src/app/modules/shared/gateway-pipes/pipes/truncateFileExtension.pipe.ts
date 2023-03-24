import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncateFileExtension' })

export class TruncateFileNameExtension implements PipeTransform {
  transform(item) {
      if (item) {
        if (item.indexOf('.') > 0)
          return item.substring(0, item.indexOf('.'))
        else
          return item;
      }
  }
}