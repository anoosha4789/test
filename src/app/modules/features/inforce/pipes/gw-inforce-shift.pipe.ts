import { Pipe, PipeTransform } from '@angular/core';
import { ShiftControlReciepe } from '@features/inforce/common/InforceUICommon';

@Pipe({
  name: 'gwInforceShift'
})
export class GwInforceShiftPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    let status = "";
    switch (value) {
      case ShiftControlReciepe.Lock:
        status = "Locking"
        break;

      case ShiftControlReciepe.Vent:
        status = "Venting"
        break;

        case ShiftControlReciepe.Shift:
        status = "Shifting"
        break;

        case ShiftControlReciepe.Pressurize:
        status = "Pressurizing"
        break;

        case ShiftControlReciepe.Reset:
        status = "Resetting"
        break;
    }
    return status;
  }



}
