import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
  AfterViewInit
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { ValidationService } from '@core/services/validation.service';
import { IErrorHandlingSettingsState } from '@store/state/errorHandlingSettings.state';
import { Observable, Subscription } from 'rxjs';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';
import { errorHandlingSettingsSchema } from '@core/models/schemaModels/ErrorHandlingUIModel.schema';
import { Store } from '@ngrx/store';
import { StateUtilities } from '@store/state/IState';
import * as ERROR_HANDLING_SETTINGS_STATE_ACTIONS from '@store/actions/errorHandlingSettings.action';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { filter } from 'rxjs/operators';
import { OnChanges } from '@angular/core';
import { GeneralSettingsTabOrder } from '@core/data/UICommon';
import { ErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { Router } from '@angular/router';
import { ErrorHandlingModel } from '@core/models/UIModels/error-handling.model';

@Component({
  selector: 'app-error-handling-settings',
  templateUrl: './error-handling-settings.component.html',
  styleUrls: ['./error-handling-settings.component.scss'],
})
export class ErrorHandlingSettingsComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @Input()
  selectedTab: number;
  
  @Output() 
  isFormValidEvent = new EventEmitter();

  @Output() 
  errorHandlingSettingUpdatedEmmiter = new EventEmitter<IErrorHandlingSettingsState>();

  @Output()
  errorHandlingInvalidEvent = new EventEmitter();

  // Validation messages
  private mapErrMessages: Map<string, string> = new Map<string, string>();
  
  constructor(
    private store: Store<{
      errorHandlingSettingsState: IErrorHandlingSettingsState;
    }>,
    private router: Router,
    private validationService: ValidationService
  ) {
    this.IErrorHandlingSettingsState$ = this.store.select<
      IErrorHandlingSettingsState
    >((state: any) => state.errorHandlingSettingsState);
  }

  isDirty: boolean = false;
  formValueHasChanged = false;
  errorHandlingSettingsForm: FormGroup;
  errorHandlingSettingsSchema: any;
  IErrorHandlingSettingsState$: Observable<IErrorHandlingSettingsState>;
  errorHandlingSettings: ErrorHandlingModel = new ErrorHandlingModel();
  private arrSubscriptions: Subscription[] = [];
  private inputLabelMap = new Map();

  getInputLabel(id: string) {
    return this.inputLabelMap.get(id);
  }

  private subscribeToFormValidationEvent() {
    this.errorHandlingSettingsForm.statusChanges
    .pipe( filter(() => this.errorHandlingSettingsForm.valid)).subscribe(() => {
      if (this.selectedTab == GeneralSettingsTabOrder.ERROR_HANDLING)
        this.isFormValidEvent.emit(true);
    });

    this.errorHandlingSettingsForm.statusChanges
    .pipe( filter(() => this.errorHandlingSettingsForm.invalid)).subscribe(() => {
      if (this.selectedTab == GeneralSettingsTabOrder.ERROR_HANDLING)
        this.isFormValidEvent.emit(false);
    });
  }

  private subscribeToValueChangeEvent() {
    const subscription = this.errorHandlingSettingsForm.valueChanges.subscribe(
      (val) => {
          this.formValueHasChanged = true;
          let errorSettings: IErrorHandlingSettingsState = {
            errorHandlingSettings: this.errorHandlingSettings,
            isLoaded: true,
            isLoading: false,
            isDirty: this.errorHandlingSettingsForm.dirty,
            isValid: this.errorHandlingSettingsForm.valid,
            error: '',
          };
          this.errorHandlingSettingUpdatedEmmiter.emit(errorSettings);
        }
    );
    this.arrSubscriptions.push(subscription);
  }

  private subscribeToErrorHandlingSettingState(): void {
    const subscription = this.IErrorHandlingSettingsState$.subscribe(
      (state: IErrorHandlingSettingsState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            // Dispatch Action if not loaded
            this.store.dispatch(
              ERROR_HANDLING_SETTINGS_STATE_ACTIONS.LOAD_ERROR_HANDLING_SETTINGS()
            );
          } else {
            this.errorHandlingSettings = new ErrorHandlingModel();
            Object.assign(
              this.errorHandlingSettings,
              state.errorHandlingSettings
            );
            this.isDirty = state.isDirty;
            //this.validationService.clearError();
          }
        }
      }
    );

    this.arrSubscriptions.push(subscription);
  }

  private validateControl(ctrlId, ctrl) {
    if (ctrl) { 
      if (ctrl.touched && ctrl.invalid) {
        this.mapErrMessages.set(ctrlId, this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(ctrlId)));
      } else {
        this.mapErrMessages.delete(ctrlId);
      }
    }
    // GATE- 1237 General Setting Error Validation
    this.setErrorNotifierList();
  }

  // GATE- 1237 General Setting Error Validation
  setErrorNotifierList() {
    const errors = [...this.mapErrMessages].map(([name, value]) => ({ name, value }));
    if (errors && errors.length > 0) {
      const errorDetails: ErrorNotifierModel = {
        path: this.router.url,
        tabName:'Error Handling',
        tabIndex: 1,
        errors: [...this.mapErrMessages].map(([name, value]) => ({ name, value }))
      };
      errorDetails.errors.map(e => { 
        const fieldName: string = this.inputLabelMap.get(e.name);
        e.value = `${fieldName.includes('(') ? fieldName.split('(')[0] : fieldName} : ${e.value}`;
      });
      this.errorHandlingInvalidEvent.emit(errorDetails);
    } else {
      this.errorHandlingInvalidEvent.emit(null)
    } 

  }

  Validate(event) {
    const ctrl = this.errorHandlingSettingsForm.get(event.currentTarget.id);
    this.validateControl(event.currentTarget.id, ctrl);
  }

  getError(fieldName: string) {
    // console.log('fieldName', fieldName);
    return this.mapErrMessages.get(fieldName);
  }

  ClearValidations() {
    this.validationService.clearError();
  }

  private validateOnInit(): void {
    if (this.isDirty)
      this.errorHandlingSettingsForm.markAllAsTouched();
      Object.keys(this.errorHandlingSettingsForm.controls).forEach(key => {
        this.validateControl(key, this.errorHandlingSettingsForm.controls[key]);
      });
  }

  private createFormGroup(): void {
    this.errorHandlingSettingsForm = new FormGroup({});
    for (const property in this.errorHandlingSettingsSchema.properties) {
      if (
        this.errorHandlingSettingsSchema.properties.hasOwnProperty(property)
      ) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        const prop = this.errorHandlingSettingsSchema.properties[property];
        if (prop.minLength !== undefined) {
          validationFn.push(Validators.minLength(prop.minLength));
        }
        if (prop.maxLength !== undefined) {
          validationFn.push(Validators.maxLength(prop.maxLength));
        }

        if (prop.minimum !== undefined && prop.maximum !== undefined) {
          validationFn.push(RangeValidator.range(prop.minimum, prop.maximum));
        } else {
          if (prop.minimum !== undefined) {
            validationFn.push(Validators.min(prop.minimum));
          }

          if (prop.maximum !== undefined) {
            validationFn.push(Validators.max(prop.maximum));
          }
        }

        if (prop.type !== undefined && prop.type === 'integer') {
          validationFn.push(this.validationService.ValidateInteger);
        }
        
        if (prop.type !== undefined && prop.type === 'number') {
          validationFn.push(this.validationService.ValidateNumber);
        }

        if (this.errorHandlingSettingsSchema.required.includes(property)) {
          validationFn.push(Validators.required);
        }
        formControl.setValidators(validationFn);
        this.errorHandlingSettingsForm.addControl(property, formControl);
      }
    }
  }

  private initInputLabelMap(): void {
    if (
      this.errorHandlingSettingsSchema !== undefined &&
      this.errorHandlingSettingsSchema !== null &&
      this.errorHandlingSettingsSchema.properties !== undefined &&
      this.errorHandlingSettingsSchema.properties !== null) {
        for (const property in this.errorHandlingSettingsSchema.properties) {
          if (
            this.errorHandlingSettingsSchema.properties.hasOwnProperty(property)
          ) {
              // console.log(property);
              const prop = this.errorHandlingSettingsSchema.properties[property];
              if (prop.title !== undefined) {
                // console.log(prop.title);
                this.inputLabelMap.set(property, prop.title);
              }
          }
        }
    }
  }

  ngOnChanges(): void {
    if (this.selectedTab == GeneralSettingsTabOrder.ERROR_HANDLING) {
      if (this.errorHandlingSettingsForm) {
        this.isFormValidEvent.emit(this.errorHandlingSettingsForm.valid);
        this.validateOnInit();
      }
    } 
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription != null) {
          subscription.unsubscribe();
        }
      });
    }

    this.validationService.clearError();
  }

  ngAfterViewInit(): void {
    if (this.errorHandlingSettingsSchema !== undefined) {
      this.subscribeToFormValidationEvent();
      this.subscribeToValueChangeEvent();
      // Create a map between input element Id and its label string for error messages
      this.initInputLabelMap();
      this.validateOnInit();
    }
  }

  ngOnInit(): void {
    this.subscribeToErrorHandlingSettingState();
    this.mapErrMessages.clear();
    this.errorHandlingSettingsSchema = errorHandlingSettingsSchema;
    if (this.errorHandlingSettingsSchema !== undefined) {
      this.createFormGroup();
      this.validateOnInit();
    }
  }
}
