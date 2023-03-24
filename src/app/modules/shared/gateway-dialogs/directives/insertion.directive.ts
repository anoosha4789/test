import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appInsertion]',
})
export class GatewayInsertionDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
