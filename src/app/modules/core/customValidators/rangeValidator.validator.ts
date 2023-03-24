import { AbstractControl, ValidatorFn } from '@angular/forms';

export class RangeValidator {

    static range(min: number, max: number): ValidatorFn {
        return (c: AbstractControl): { [key: string]: any } | null => {
            if (c.value === undefined || c.value == null)
                return null;
                
            if ((isNaN(c.value) || c.value < min || c.value > max)) {
                return { range: { 'rangeMin': min, 'rangeMax': max } };
            }
            return null;
        };
    }
}
