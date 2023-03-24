import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gwValveTypeName'
})
export class GwValveTypeNamePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return this.getValveType(value, args[0]);
  }
  
  getValveType(valveTypeId, valveTypeList) {
    return valveTypeList.find( (valveType) => valveType.Id === valveTypeId).ValveName;
  }


}
