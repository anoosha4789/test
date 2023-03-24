import { GwNumberFormatterPipe } from './gw-number-formatter.pipe';
import { DecimalPipe } from '@angular/common';

fdescribe('GwNumberFormatterPipe', () => {
 
  it('create an instance', () => {
    let decimalPipe = new DecimalPipe("");
    const pipe = new GwNumberFormatterPipe(decimalPipe);
    expect(pipe).toBeTruthy();
  });
});
