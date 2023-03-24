import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ValvePositionsAndReturnsModel } from '@core/models/webModels/ValvePositionsAndReturns.model';
import { String } from 'typescript-string-operations';

@Injectable()
export class ValidationService {
  private validationErrorMessage: string;
  private float_max_val = 3.4028234663852886E+38; // float max positive number
  private number_max_val = 1.7976931348623157e+308;
  // raiseError(errorMsg: string) {
  //   this.validationErrorMessage = errorMsg;
  // }

  getValidationErrorMessage(errors: ValidationErrors, fieldInfo: string): string {
    let validationMessage: string = null;

    if (errors !== undefined && errors != null) {

      if (errors.notInteger) {
        if (fieldInfo !== undefined && fieldInfo != null) {
          validationMessage = 'Integer value required.';
        }
      }

      if (errors.notNumber) {
        if (fieldInfo !== undefined && fieldInfo != null) {
          validationMessage = 'Decimal value required.';
        }
      }

      if (errors.minlength) {
        if (fieldInfo !== undefined && fieldInfo != null) {
          validationMessage = String.Format(
              'Min. of {0} characters required.',
              errors.minlength.requiredLength,
              fieldInfo
            );
        }
      }

      if (errors.maxlength) {
        if (fieldInfo !== undefined && fieldInfo != null) {
          validationMessage = String.Format(
              'Max. of {0} characters allowed.',
              errors.maxlength.requiredLength,
              fieldInfo
            );
        }
      }

      if (errors.min) {
        if (fieldInfo !== undefined && fieldInfo != null) {
          validationMessage = String.Format(
            'Value must be greater than or equals to {0}.',
            errors.min.min
          );
        }
      }

      if (errors.max) {
        if (fieldInfo !== undefined && fieldInfo != null) {
          validationMessage = String.Format(
              'Value must be less than {0}.',
              errors.max.max
            );
        }
      }
      if (errors.range) {
        // GATE-1337 - SW - Validation messages
        if (fieldInfo !== undefined && fieldInfo != null) {
          if (fieldInfo !== 'Decimal Value' && fieldInfo !== 'Integer Value') {
            if(errors.range.rangeMax === this.float_max_val || errors.range.rangeMax === this.number_max_val) {
              validationMessage = "Invalid entry.";
            } else {
              validationMessage = `Valid range is ${errors.range.rangeMin} to ${errors.range.rangeMax}.`;
            }
          } else {
            validationMessage = "Value out of range.";
          }
        }

      }
      if (errors.pattern) {
        validationMessage = String.Format('Alphanumeric characters only.', fieldInfo);
      }
      if(errors.notUnique) {
        validationMessage = fieldInfo !== 'Serial' ? `${fieldInfo} already exists.` 
                            : `${fieldInfo} Number should be unique.`;
      }
      if (errors.customError) {
        validationMessage = errors.customError;
      }

      if (errors.invalidPercentage) {
        validationMessage = 'Valid range 0 to 100.';
      }

      if (errors.invalidMaxShiftTime) {
        validationMessage = 'Value < Max Shift Time.';
      }

      if (errors.invalidInput) {
        validationMessage = "Invalid entry.";
      }

      
      if (errors.required) {
        if (fieldInfo !== undefined && fieldInfo != null) {
          // validationMessage = String.Format('\'{0}\' is required.', fieldInfo);
          validationMessage = String.Format('Required field.');
        }
      }
      
    }

    return validationMessage;
  }

  // setValidationErrorMessage(errors: ValidationErrors, fieldInfo: string) {
  //   let validationMessage = this.getValidationErrorMessage(errors, fieldInfo);
  //   this.raiseError(validationMessage);
  // }

  /*raiseAbstractError(
    pageName: ErrorMessages.PageName,
    id: string,
    errors: ValidationErrors
  ) {
    if (errors !== undefined && errors != null) {
      if (errors.notInteger) {
        const errMssg = ErrorMessages.Errors.GetError(pageName, id, 'minmax');
        if (errMssg !== undefined && errMssg != null) {
          this.raiseError(
            String.Format('{0} Must be an integer.', errMssg.Message)
          );
        }
      }

      if (errors.required) {
        const errMssg = ErrorMessages.Errors.GetError(pageName, id, 'required');
        this.raiseError(errMssg.Message);
      }

      if (errors.minlength) {
        const errMssg = ErrorMessages.Errors.GetError(
          pageName,
          id,
          'minlength'
        );
        if (errMssg !== undefined && errMssg != null) {
          this.raiseError(
            String.Format(errMssg.Message, errors.minlength.requiredLength)
          );
        } else {
          this.raiseError(
            String.Format(
              'Please enter at least {0} characters',
              errors.minlength.requiredLength
            )
          );
        }
      }

      if (errors.maxlength) {
        const errMssg = ErrorMessages.Errors.GetError(
          pageName,
          id,
          'maxlength'
        );
        if (errMssg !== undefined && errMssg != null) {
          this.raiseError(
            String.Format(errMssg.Message, errors.maxlength.requiredLength)
          );
        } else {
          this.raiseError(
            String.Format(
              'Maximum {0} characters allowed.',
              errors.maxlength.requiredLength
            )
          );
        }
      }

      if (errors.min) {
        const errMssg = ErrorMessages.Errors.GetError(pageName, id, 'minmax');
        if (errMssg !== undefined && errMssg != null) {
          this.raiseError(
            String.Format(
              '{0} must be greater than {1}.',
              errMssg.Message,
              errors.min.min
            )
          );
        }
      }
      if (errors.max) {
        const errMssg = ErrorMessages.Errors.GetError(pageName, id, 'minmax');
        if (errMssg !== undefined && errMssg != null) {
          this.raiseError(
            String.Format(
              '{0} must be less than {1}.',
              errMssg.Message,
              errors.max.max
            )
          );
        }
      }
      if (errors.range) {
        const errMssg = ErrorMessages.Errors.GetError(pageName, id, 'minmax');
        if (errMssg !== undefined && errMssg != null) {
          this.raiseError(
            String.Format(
              errMssg.Message,
              errors.range.rangeMin,
              errors.range.rangeMax
            )
          );
        }
      }
      if (errors.pattern) {
        const errMssg = ErrorMessages.Errors.GetError(pageName, id, 'pattern');
        if (errMssg !== undefined && errMssg != null) {
          this.raiseError(errMssg.Message);
        }
      }
    }
  }*/

  // getCustomErrorMessage(
  //   pageName: ErrorMessages.PageName,
  //   id: string,
  //   errorType: string
  // ): string {
  //   const errMssg = ErrorMessages.Errors.GetError(pageName, id, errorType);
  //   if (errMssg !== undefined && errMssg != null) {
  //     return errMssg.Message;
  //   }

  //   return null;
  // }

  clearError() {
    this.validationErrorMessage = null;
  }

  // returns either null or the actual error message
  // avoid undefined or blank
  get errorMessage() {
    if (
      this.validationErrorMessage === undefined ||
      this.validationErrorMessage === ''
    ) {
      return null;
    }

    return this.validationErrorMessage;
  }
  public ValidateInteger = (control: FormControl) => {
    return parseFloat(control.value) === parseInt(control.value, 10) &&
      !isNaN(control.value)
      ? null
      : { notInteger: true };
  };
  public ValidateNumber = (control: FormControl) => {
    let retValue = null;
    if (control.value == null || isNaN(control.value))
      retValue = { notNumber: true };
    return retValue;
  };

}
