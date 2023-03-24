import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gwValvePositionName'
})
export class GwValvePositionNamePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return this.getValveType(value, args[0]);
  }
  
  getValveType(valvePositionId, valvePositionsList) {    
    return valvePositionsList.find( (valvePosition) => valvePosition.ToPosition === valvePositionId).Description;
  }
}
