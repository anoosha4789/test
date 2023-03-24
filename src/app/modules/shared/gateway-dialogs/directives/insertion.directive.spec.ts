import { GatewayInsertionDirective } from './insertion.directive';
import { ViewContainerRef } from '@angular/core';

fdescribe('InsertionDirective', () => {
  it('should create an instance', () => {
    const viewContainerRef: ViewContainerRef = null;
    const directive = new GatewayInsertionDirective(viewContainerRef);
    expect(directive).toBeTruthy();
  });
});
