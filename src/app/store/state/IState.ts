import { AnyFn } from '@ngrx/store/src/selector';
import { String, StringBuilder } from 'typescript-string-operations';

export interface IState {
  error: any;
  isLoading: boolean;
  isLoaded: boolean;
  isDirty: boolean;
  isValid: boolean;
}

export class StateUtilities {
  public static hasErrors(state: IState): boolean {
    if (state.error !== undefined && !String.IsNullOrWhiteSpace(state.error)) {
      return true;
    }

    return false;
  }

  public static isStateValid(error, data): boolean {
    return data.error === '' && this.hasData(data);
  }

  // If no errors in mandate State check it is empty or not
  public static hasData(data): boolean {
    if (Array.isArray(data) && data.length) {
      return true;
    } else {
      return data && Object.keys(data).length === 0 ? false : true;
    }
  }
}
