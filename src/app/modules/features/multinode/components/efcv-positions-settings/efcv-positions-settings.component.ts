import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { DEFAULT_eFCV_POSITIONS, DEFAULT_eFCV_POSITIONS_STAGES, MultinodeGeneralSettingsTabOrder } from '@core/data/UICommon';
import { multinodeEfcvPositionSchema } from '@core/models/schemaModels/MultinodeEfcvPosition.schema';
import { ErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { MultiNodePositionDefaultsDataUIModel } from '@core/models/UIModels/MultiNodePositionDefaultsDataUI.model';
import { ValidationService } from '@core/services/validation.service';
import { IeFCVPositionSettingsState } from '@store/state/efcvPositionSettings.state';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-efcv-positions-settings',
  templateUrl: './efcv-positions-settings.component.html',
  styleUrls: ['./efcv-positions-settings.component.scss']
})
export class EfcvPositionsSettingsComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input()
  selectedTab: number = MultinodeGeneralSettingsTabOrder.EFCV_POSITIONS;
  @Input()
  eFCVPositions: MultiNodePositionDefaultsDataUIModel;
  @Output()
  eFCVPositionStateEmmiter = new EventEmitter();
  @Output() isFormValidEvent = new EventEmitter();
  @Output() efcvPositionFormInValidEvent = new EventEmitter();
  @Output() isFormDirtyEvent = new EventEmitter();

  efcvPositionsForm: FormGroup;
  formCtrlErrorMessage: any;
  NOTSET = DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET;
  // multinodeEfcvPositionSchema: any;
  eFCVPositionSettings = new MultiNodePositionDefaultsDataUIModel();
  private inputLabelMap = new Map();

  private mapErrMessages: Map<string, string> = new Map<string, string>();
  private arrSubscriptions: Subscription[] = [];
  constructor(protected router: Router, private validationService: ValidationService,private fb: FormBuilder) { }


  getInputLabel(id: string) {
    return this.inputLabelMap.get(id);
  }

  private subscribeToFormValidationEvent() {
    this.efcvPositionsForm.statusChanges
      .pipe(filter(() => this.efcvPositionsForm.valid)).subscribe(() => {
        // if (this.selectedTab == MultinodeGeneralSettingsTabOrder.EFCV_POSITIONS)  
        this.isFormValidEvent.emit(true);
      });

    this.efcvPositionsForm.statusChanges
      .pipe(filter(() => this.efcvPositionsForm.invalid)).subscribe(() => {
        // if (this.selectedTab == MultinodeGeneralSettingsTabOrder.EFCV_POSITIONS)       
        this.isFormValidEvent.emit(false);
      });
      this.efcvPositionsForm.statusChanges
      .pipe(filter(() => this.efcvPositionsForm.dirty)).subscribe(() => {
        // if (this.selectedTab == MultinodeGeneralSettingsTabOrder.EFCV_POSITIONS)  
        this.isFormDirtyEvent.emit(true);
      });
  }

  onInputChange(event) {
    const ctrl = this.efcvPositionsForm.get(event.currentTarget.id);
    let PositionStage = this.eFCVPositionSettings.PositionStagesData.find(stageData => stageData.PositionStageDesc === event.currentTarget.id)?.PositionStage;
    let PositionDescriptionData = this.eFCVPositionSettings.PositionDescriptionData.find(descriptionData => descriptionData.PositionStage === PositionStage);
   
    if (PositionDescriptionData) {
      PositionDescriptionData.Description = ctrl.value;
     this.eFCVPositionSettings.PositionDescriptionData.find(descriptionData => descriptionData.PositionStage === PositionStage).Description= ctrl.value;

      let efcvPositionSettings: IeFCVPositionSettingsState = {
        eFCVPositionSettings: this.eFCVPositionSettings,
        isLoaded: true,
        isLoading: false,
        isDirty: this.efcvPositionsForm.dirty,
        isValid: this.efcvPositionsForm.valid,
        error: '',
      };
      
      this.eFCVPositionStateEmmiter.emit(efcvPositionSettings);
    }
    this.Validate(event);
  }


  private validateControl(ctrlId, ctrl) {
    if (ctrl) {
      if  (ctrl.touched && ctrl.invalid) {
        this.mapErrMessages.set(ctrlId, this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(ctrlId)));
      } else {
        this.mapErrMessages.delete(ctrlId);
      }
    }
    this.setErrorNotifierList();
  }

  setErrorNotifierList() {
    const errors = [...this.mapErrMessages].map(([name, value]) => ({ name, value }));
    if (errors && errors.length > 0) {
      const errorDetails: ErrorNotifierModel = {
        path: this.router.url,
        tabName: 'eFCV Positions',
        tabIndex: 3,
        errors: [...this.mapErrMessages].map(([name, value]) => ({ name, value }))
      };
      errorDetails.errors.map(e => {
        const fieldName: string = this.inputLabelMap.get(e.name);
        e.value = `${fieldName.includes('(') ? fieldName.split('(')[0] : fieldName} : ${e.value}`;
      });
      this.efcvPositionFormInValidEvent.emit(errorDetails);
    } else {
      this.efcvPositionFormInValidEvent.emit(null)
    }

  }

  Validate(event) {
    const ctrl = this.efcvPositionsForm.get(event.currentTarget.id);
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
    // if (this.isDirty)
    if (this.efcvPositionsForm && this.selectedTab == MultinodeGeneralSettingsTabOrder.EFCV_POSITIONS) {
      this.isFormValidEvent.emit(this.efcvPositionsForm.valid);
      if (this.efcvPositionsForm.touched || GatewayPanelBase.ShowNavigation == true)
        this.efcvPositionsForm.markAllAsTouched();
      Object.keys(this.efcvPositionsForm.controls).forEach(key => {
        this.validateControl(key, this.efcvPositionsForm.controls[key]);
      });

      if (this.efcvPositionsForm.pristine) {
        this.efcvPositionsForm.markAllAsTouched();
      }
    }
  }
  uniquePositionDescriptionValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value === undefined || control.value == null || control.value == '')
      return null;

      let checkingString = Object.entries(control.parent?.controls ?? []).find(([_, value]) => value === control)?.[0] ?? null;

      for (const field in this.efcvPositionsForm?.controls) { 
        if(field !== checkingString ){
          if(control.value.toString().trim().toUpperCase() === this.efcvPositionsForm?.get(field).value.toString().trim().toUpperCase()){
            return { customError: 'Position already exists.' };
          }
          
        }  
    }
     
      return null;
    };
  }
  private createFormGroup(): void {
   
    if (this.eFCVPositions && this.eFCVPositions.PositionStagesData && !this.efcvPositionsForm) {
      let form = {};
      this.eFCVPositions?.PositionStagesData?.forEach((efCvPosition, index) => {
        if (efCvPosition.PositionStage !== this.NOTSET) {
          form[efCvPosition.PositionStageDesc] = new FormControl(this.eFCVPositions?.PositionDescriptionData[index]?.Description,[Validators.required,this.uniquePositionDescriptionValidator()]);
          this.inputLabelMap.set(efCvPosition.PositionStageDesc, efCvPosition.PositionStageDesc);
        }
      });

      this.efcvPositionsForm = this.fb.group(form);
      this.subscribeToFormValidationEvent();
    }
  }


  ngOnChanges(): void {
    // if (this.selectedTab == MultinodeGeneralSettingsTabOrder.EFCV_POSITIONS) {
    if (this.eFCVPositions) {
      this.eFCVPositionSettings = _.cloneDeep(this.eFCVPositions);
    }
    if (this.selectedTab == MultinodeGeneralSettingsTabOrder.EFCV_POSITIONS) {
      this.createFormGroup();
    }
    if (this.efcvPositionsForm) {
      this.validateOnInit();
    }
  }


  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }
    this.validationService.clearError();
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.mapErrMessages.clear();
  }
}