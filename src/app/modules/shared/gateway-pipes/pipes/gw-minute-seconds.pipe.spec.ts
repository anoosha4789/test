import { GwMinuteSecondsPipe } from './gw-minute-seconds.pipe';

fdescribe('GwMinuteSecondsPipe', () => {
  it('create an instance', () => {
    const pipe = new GwMinuteSecondsPipe();
    expect(pipe).toBeTruthy();
  });
});
