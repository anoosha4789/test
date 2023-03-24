import { Pipe, PipeTransform } from '@angular/core';

// convert seconds to mm:ss format
@Pipe({
  name: 'gwMinuteSeconds'
})
export class GwMinuteSecondsPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    let temp = value;
    //const hours = Math.floor((temp / 3600));
    const minutes = this.pad(Math.floor(temp / 60),2);
    const seconds = this.pad(Math.floor(temp % 3600 % 60),2);
    return minutes + ':' + seconds;
  }

  pad(num: number, size: number): string {
      var s = num + "";
      while (s.length < size) s = "0" + s;
      return s;
  }

}
