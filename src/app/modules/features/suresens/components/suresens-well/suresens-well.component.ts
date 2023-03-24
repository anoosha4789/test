import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';

import { GatewayPanelBase, IWellBase } from '@comp/GatewayPanelBase.component';
import { SuresensWellUIModel } from '@core/models/UIModels/suresens.well.model';
import { UtilityService } from '@core/services/utility.service';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { ValidationService } from '@core/services/validation.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { SurefloFacade } from '@core/facade/surefloFacade.service';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { WellErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { suresensWellSchema } from '@core/models/schemaModels/SureSENSWellDataUIModel.schema';
import { deleteUIModal, UICommon } from '@core/data/UICommon';
import { SureFLOFlowMeterUIModel } from '@core/models/UIModels/sureflo.model';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { WellTypeEnum } from '@core/models/webModels/WellDataUIModel.model';
import { DataLoggerFacade } from '@core/facade/dataLoggerFacade.service';

@Component({
  selector: 'app-suresens-well',
  templateUrl: './suresens-well.component.html',
  styleUrls: ['./suresens-well.component.scss']
})
export class SuresensWellComponent extends GatewayPanelBase implements OnInit, OnDestroy, IWellBase {
  
  wellForm: FormGroup;
  isFlowMeterFormValid = true;
  hasWellChanged = false;
  isLeavingWorkflow: boolean = true;
  backBtnVisibility = true;
  bShowDeleteButton: boolean = true;
  activeTabIndex = 0;
  lastWellIndex = 0;
  actionBtnTxt = 'Create Well';
  sideNavBtnTxt = 'Add Well';
  wellName = 'New Well';
  well: SuresensWellUIModel;
  wellId: number;
  private nextWellId: number;
  private prevWellId: number;
  private currentWellIdx: number;
  invalidWellNameErorMsg: string;
  isConfigSaved = false;
  flowMeterTabActive = false;
  isNewFlowMeter = false;
  enableFlowMeterDelBtn: boolean = false;
  tabAddFlowmeterLabel: string = "+ Add Flowmeter";
  flowMeterActionBtnText: string = "Create FlowMeter";
  private currentFlowMeterIdx: number = -1;
  stepperIndex: number = null;
  newFlowMeter: SureFLOFlowMeterUIModel;
  flowMeterToUpdateList: SureFLOFlowMeterUIModel[] = [];
  surefloFlowMeterList: SureFLOFlowMeterUIModel[] = [];
  totalTabCount = 0;

  private arrSubscriptions: Subscription[] = [];

  constructor(protected store: Store,
              private router: Router,
              protected route: ActivatedRoute,
              private fb: FormBuilder,
              private panelConfigFacade: PanelConfigurationFacade,
              private wellDataFacade: WellFacade,
              private surefloDataFacade: SurefloFacade,
              private dataSourceFacade: DataSourceFacade,
              private gwModalService: GatewayModalService,
              private validationService: ValidationService,
              dataLoggerFacade: DataLoggerFacade,
              private utilityService: UtilityService) {
    super(store, panelConfigFacade, wellDataFacade, dataSourceFacade, null, null, null, surefloDataFacade,dataLoggerFacade);
  }

  onTabChanged(event) {
    if (event.tab.textLabel === this.tabAddFlowmeterLabel) {
      this.createNewFlowMeter();
    } else {
      if (this.currentFlowMeterIdx != -1 && this.isFlowMeterFormValid) {
        if(this.flowMeterToUpdateList.length > 0) { 
          this.flowMeterToUpdateList.forEach( (flowMeter) =>  this.surefloDataFacade.saveFlowMeter(flowMeter));
          this.flowMeterToUpdateList = [];
        }
      }
      this.newFlowMeter = null;
    }
    this.setUpActionButtons(event.tab.textLabel);
    this.stepperIndex = 0; 
  }

  isFormValidEvent(isFormValid: boolean) {
    this.isFlowMeterFormValid = isFormValid;
  }

  // Update Existing Flowmeter Status
  flowMeterDataChangedEvent(flowMeterData: SureFLOFlowMeterUIModel) {
    if(flowMeterData) { 
      flowMeterData.IsDirty = true;
      flowMeterData.IsValid = this.surefloDataFacade.validateFlowMeterData(flowMeterData);
      this.updateFlowMeterList(flowMeterData);
    }
  }

  onNewFlowMeterDataChangeEvent(flowMeterData: SureFLOFlowMeterUIModel) {
    if(flowMeterData) { 
      flowMeterData.IsDirty = true;
      flowMeterData.IsValid = this.surefloDataFacade.validateFlowMeterData(flowMeterData);
      this.newFlowMeter = flowMeterData;
    }
  }

  // Flowmeters to update list
  updateFlowMeterList(flowMeterData: SureFLOFlowMeterUIModel) {
    if(this.flowMeterToUpdateList.length === 0) {
      this.flowMeterToUpdateList.push(flowMeterData);
    } else {
      const flowmeterIdx = this.flowMeterToUpdateList.findIndex(fm => fm.DeviceId === flowMeterData.DeviceId);
      if(flowmeterIdx === -1 ) {
        this.flowMeterToUpdateList.push(flowMeterData);
      } else {
        this.flowMeterToUpdateList[flowmeterIdx] = flowMeterData;
      }
    }
  }
 
  stepperSelChangeEvent(stepperIdx : number) {
    this.stepperIndex = stepperIdx;
  }

  createNewFlowMeter() {
    const deviceId = this.surefloEnity.length > 0 ? this.surefloEnity.length + 1 : 1;
    this.newFlowMeter = this.surefloDataFacade.getNewFlowMeter(deviceId, this.wellId);
    this.stepperIndex = 0;
  }

  private SaveFlowMeter() {
    this.newFlowMeter.IsValid = this.surefloDataFacade.validateFlowMeterData(this.newFlowMeter);
    this.surefloDataFacade.saveFlowMeter(this.newFlowMeter);
    this.flowMeterToUpdateList.forEach(flowmeter => {
        this.surefloDataFacade.saveFlowMeter(flowmeter);
    });
  }

  onCreateFlowMeterBtnClick(): void {
    if (this.newFlowMeter && this.stepperIndex === 1) {
      this.SaveFlowMeter(); 
      this.stepperIndex = 0;
      const tabIndex = _.cloneDeep(this.activeTabIndex);
      this.activeTabIndex = 0;
      setTimeout(() => {
        this.activeTabIndex = tabIndex;
      }, 0);
      return;
    }
    this.stepperIndex++;
  }


  onBackBtnClick() {
    this.flowMeterTabActive = this.activeTabIndex > 0 ? true : false;
    this.setPreTabNavigation();
  }

  onSaveBtnClick() {

    this.isLeavingWorkflow = false;
    if (this.well) {

      this.updateLocalWellState();

      if (this.well.WellId < 0)  // New Well
        this.router.navigated = false;

      if (!GatewayPanelBase.ShowNavigation) {
        this.utilityService.setForwardStepper(1);
        this.router.navigate(['suresens/datasource']);
      } else {
        this.setTabNavigation();
      }
    }

  }

  
  onFlowMeterNextBtnClick() {
    if (this.isNewFlowMeter || this.flowMeterTabActive) {
      if (this.stepperIndex !== 1) {
        this.stepperIndex = 1;
      } else {
        if(this.flowMeterToUpdateList.length > 0) { 
          this.flowMeterToUpdateList.forEach( (flowMeter) =>  this.surefloDataFacade.saveFlowMeter(flowMeter));
          this.flowMeterToUpdateList = [];
        }
        this.setTabNavigation();
      }
    }
  }

  setTabNavigation() {
    this.totalTabCount = this.surefloFlowMeterList.length;
    if (this.totalTabCount > this.activeTabIndex) {
      this.activeTabIndex += 1;
      return;
    }
    if (isNaN(this.nextWellId)) {
      this.router.navigate(['suresens/dashboard']);
    } else {
      this.router.navigate(['suresens/well',this.nextWellId]);//, { queryParams: { selectedId: this.nextWellId } });
    }
  }

  onDeleteBtnClick() {
    let toolConnections = this.toolConnectionEntity.filter(t => t.WellId === this.well.WellId)??[];
    if (toolConnections.length > 0) {
      this.gwModalService.openDialog(
        `${this.well.WellName} is associated with a tool(s).<br>Delete the associated tool(s) before deleting the well.</br>`,
        () => this.gwModalService.closeModal(),
        null,
        'Warning',
        null,
        false,
        "Ok"
      );
      return;
    }
    let dataLoggers = this.dataLoggerEntity.filter(t => t.WellId === this.well.WellId && t.IsDeleted == 0) ?? [];
    if(dataLoggers.length > 0){
      this.gwModalService.openDialog(
        `${this.well.WellName} is associated with a Data Logger(s).<br>Delete the associated Data Logger(s) before deleting the well.</br>`,
        () => this.gwModalService.closeModal(),
        null,
        'Warning',
        null,
        false,
        "Ok"
      );
      return;
    }

    this.gwModalService.openDialog(
     `Do you want to delete well '${this.well.WellName}'?`,
      () => {
        this.gwModalService.closeModal();
        this.deleteWell();
      },
      () => this.gwModalService.closeModal(),
      deleteUIModal.title,
      null,
      true,
      deleteUIModal.primaryBtnText,
      deleteUIModal.secondaryBtnText
    );
  }

  onDeleteFlowMeterBtnClick() {
    const flowMeter = this.surefloFlowMeterList[this.currentFlowMeterIdx];
    this.gwModalService.openDialog(
      `Do you want to delete flowmeter '${flowMeter.DeviceName}'?`,
       () => {
         this.gwModalService.closeModal();
         this.deleteFlowMeter(flowMeter.DeviceId);
       },
       () => this.gwModalService.closeModal(),
       deleteUIModal.title,
       null,
       true,
       deleteUIModal.primaryBtnText,
       deleteUIModal.secondaryBtnText
     );
  }

  private updateLocalWellState() {
    this.well.IsValid = true;
    let errMssg = this.wellDataFacade.validateWell(this.well);
    if (errMssg) {
      this.well.IsValid = false;
    }
    this.wellId = this.well.WellId;
    this.wellDataFacade.saveWell(this.well);
  }

  private updateFlowMeterState() {
    // if (this.currentFlowMeter) {
    //   const flowmeterIdx = this.surefloFlowMeterList.findIndex(fm => fm.DeviceId === this.currentFlowMeter.DeviceId);
    //   if (flowmeterIdx !== -1) {
    //     this.surefloFlowMeterList[flowmeterIdx] = this.currentFlowMeter;
    //   }
    // }
    this.surefloFlowMeterList.forEach(flowmeter => {
        this.surefloDataFacade.saveFlowMeter(flowmeter);
    });
    if(this.flowMeterToUpdateList.length > 0) { 
      this.flowMeterToUpdateList.forEach( (flowMeter) =>  this.surefloDataFacade.saveFlowMeter(flowMeter));
      this.flowMeterToUpdateList = [];
    }
  }

  private deleteFlowMeter(deviceId: number): void {
    this.surefloDataFacade.deleteFlowMeter(deviceId);
    this.setPreTabNavigation(true);
  }

  private deleteWell(): void {
    this.wellDataFacade.deleteWell(this.well.WellId);

    if (isNaN(this.nextWellId) && isNaN(this.prevWellId)) {
      this.setNavigation();
    }
    else if (!isNaN(this.nextWellId)) {
      this.router.navigate(['suresens/well', this.nextWellId]);
    }
    else {
      this.router.navigate(['suresens/well', this.prevWellId]);
    }
  }

  postCallGetWells(): void {
  
    this.currentWellIdx = -1;
    if (isNaN(this.wellId)) {
      const newWellId = this.wellEnity.length + 1;
      // const newWellName = this.wellEnity.findIndex(w => w.WellName === `Well ${newWellId}`) === -1 ? `Well ${newWellId}` : `Well ${newWellId + 1}`;
      if(!GatewayPanelBase.ShowNavigation && this.wellEnity.length == 1) {
        this.wellId = this.wellEnity[0].WellId;
        this.setCurrentWellData();
      } else { 
        this.well = this.wellDataFacade.getNewWell(newWellId, WellTypeEnum.SureSENS);
      }
      this.backBtnVisibility = !GatewayPanelBase.ShowNavigation;
      // this.wellName = this.well.WellName ? this.well.WellName : this.wellName;
      this.setUpActionButtons();
    }
    else if (this.wellEnity && this.wellEnity.length > 0) {
        this.setCurrentWellData();
    }

    this.createFormGroup();
  }

  setCurrentWellData() {
    this.well = new SuresensWellUIModel();
    this.currentWellIdx = this.wellEnity.findIndex(w => w.WellId == this.wellId);
    if (this.currentWellIdx !== -1) {
      this.well = this.wellEnity[this.currentWellIdx];
      this.wellName = this.well.Error && this.well.Error.length > 0 ? this.well.currentWellName : (this.well?.WellName ? this.well.WellName : this.wellName);
      this.well.currentWellName = this.well.Error && this.well.Error.length > 0 ? this.well.currentWellName : this.wellName;
      this.nextWellId = this.currentWellIdx + 1 < this.wellEnity.length ? this.wellEnity[this.currentWellIdx + 1].WellId : NaN;
      this.prevWellId = this.currentWellIdx > 0 ? this.wellEnity[this.currentWellIdx - 1].WellId : NaN;
      this.backBtnVisibility = !isNaN(this.prevWellId) || !GatewayPanelBase.ShowNavigation;
      this.setFlowMeterTabStatus();
    }
  }

  setFlowMeterTabStatus() {
    this.isConfigSaved = this.wellId > 0 && this.panelConfigurationCommonState.panelConfigurationCommon.Id > 0 && UICommon.IsConfigSaved ? true : false;
    if (this.wellId > 0 && this.panelConfigurationCommonState.panelConfigurationCommon.Id > 0) {
      this.initFlowMeters();
    }
  }

  
  postCallGetFlowMeters(): void {
    if(this.surefloEnity.length > 0 ) {
      this.surefloFlowMeterList = this.surefloEnity.filter(flowmeter => flowmeter.WellId === this.wellId);
    } else {
      this.surefloFlowMeterList  = [];
    }
    this.setUpActionButtons();
  }

  setNavigation() {
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['suresens/well']);
    this.isLeavingWorkflow = GatewayPanelBase.ShowNavigation ? true : false;
    if(this.wellEnity.length === 0 && !this.isLeavingWorkflow) { 
      this.utilityService.setForwardStepper(0);
    }
  }

  private setPreTabNavigation(isDelFlowmeter?: boolean) {
    // Sureflo Stepper
    if (this.flowMeterTabActive) {
      if(isDelFlowmeter || this.stepperIndex == 0) {
        this.activeTabIndex = this.activeTabIndex > 0 ? this.activeTabIndex-1 : this.activeTabIndex;
      } else { 
        this.stepperIndex = this.stepperIndex > 0 ? this.stepperIndex-1 : this.stepperIndex;
      }
    } else {
      if (this.activeTabIndex > 0) {
        this.activeTabIndex -= 1;
      } else {
        if (this.prevWellId) {
          this.router.navigate(['suresens/well',this.prevWellId]);//, { queryParams: { selectedId: this.prevWellId } });
        } else {
          this.isLeavingWorkflow = false;
          this.router.navigate(['suresens/general']);
        }
      }
    }
  }

  private setUpActionButtons(tabName?) {
    if (this.activeTabIndex > 0) {
      this.bShowDeleteButton = false;
      this.setFlowMeterBtn(tabName);
    } else {
      const flowMeterCount = this.surefloFlowMeterList.length;
      this.enableFlowMeterDelBtn = false;
      this.bShowDeleteButton = isNaN(this.wellId) ? false : true;
      this.actionBtnTxt = isNaN(this.wellId) ? "Create Well" : (isNaN(this.nextWellId) && flowMeterCount === 0 ? "Done" : "Next");
      
    }
  }
  
  // Set FlowMeter Button Text
  setFlowMeterBtn(tabName: string) {
    this.flowMeterTabActive = this.activeTabIndex > 0 ? true : false;
    this.isNewFlowMeter = tabName === this.tabAddFlowmeterLabel ? true : false;
    this.enableFlowMeterDelBtn = this.isNewFlowMeter ? false : true;
    const subscription = this.utilityService.getSurefloStepperData().subscribe(data => {
      if (data) {
        const flowMeterCount = this.surefloFlowMeterList.length - 1;
        const flowMeterIdx = this.surefloFlowMeterList.findIndex(fm => fm.DeviceId === data.deviceId);
        this.currentFlowMeterIdx = flowMeterIdx;
        this.flowMeterActionBtnText = data.activeIdx === 0 ? "Next" : (this.isNewFlowMeter ? "Create FlowMeter" : 
                                      (flowMeterIdx < flowMeterCount || (flowMeterIdx === flowMeterCount && !isNaN(this.nextWellId)) ? "Next" :  "Done"));
      }
    });
    this.arrSubscriptions.push(subscription);
  }

  loadWells() {

    this.route.queryParams.subscribe(params => {
      if (params && params.selectedId) {
        this.wellId = parseInt(params.selectedId, 10);
        this.activeTabIndex = params.selectedChild ? parseInt(params.selectedChild, 10) : 0;
        this.initWells();
      } else {
        this.getParameter();
      }
    });
  }

  getParameter(): void {
    this.route.params.subscribe(params => {
      this.wellId = parseInt(params.Id, 10);
      this.activeTabIndex = 0;
      this.initWells();
    });
  }

  private validateControl(fieldInfo, ctrl) {
   
    this.wellForm.markAllAsTouched();
    this.invalidWellNameErorMsg = null;
    if(ctrl && ctrl.touched && ctrl.invalid) { 
      this.invalidWellNameErorMsg = this.validationService.getValidationErrorMessage(ctrl.errors, fieldInfo);
      const error: WellErrorNotifierModel[] = [{
        tabName: this.well.currentWellName,
        path: this.router.url,
        errors: [
          {
            name: this.well.WellName,
            value:  `Well Name : ${this.invalidWellNameErorMsg}`
          }
        ],
        wellId: this.well.WellId,
        wellName: this.well.currentWellName
      }];
      this.well.Error = error;
      return;
    } else {
      this.well.Error = null;
    } 
  }

   // Validate Well Name
   validateWellName(event) {
    
    this.well.WellName = this.wellForm.value.WellName;
    let ctrl = this.wellForm.get(event.currentTarget.id);
    this.validateControl('Well Name', ctrl);
  }

  private subscribeToFormChanges() {
    this.wellForm.valueChanges.subscribe((val) => {
      if (!this.wellForm.pristine) {
        this.well.IsDirty = true;
      }
    });
  }

  createFormGroup() {
    
    this.wellForm = this.fb.group({});

    for (const property in suresensWellSchema.properties) {
      
      if (suresensWellSchema.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        if (suresensWellSchema.required.includes(property)) {

          validationFn.push(Validators.required);
          let prop = suresensWellSchema.properties[property];
          // Minimum Length
          if (prop.minLength) {
            validationFn.push(Validators.minLength(prop.minLength));
          }
          // Max Length
          if (prop.maxLength) {
            validationFn.push(Validators.maxLength(prop.maxLength));
          }
          // Alphanumeric characters only
          if (prop.pattern) {
            validationFn.push(Validators.pattern(prop.pattern));
          }
          // Special Cases
          if (property === 'WellName') {
              validationFn.push(this.wellDataFacade.wellNameValidator(this.well?.WellId));
          }
          formControl.setValidators(validationFn);
          this.wellForm.addControl(property, formControl);
        }
      }
    }
   
    this.wellForm.patchValue({ 
      WellId:  this.well?.WellId,
      WellType: this.well?.WellType,
      WellName: this.well?.WellName,
    });
    setTimeout(() => {
      this.validateOnInit();
    }, 0)
    this.subscribeToFormChanges();
  }

  private validateOnInit(): void {
      let ctrl = this.wellForm.get('WellName');
      this.validateControl('Well Name', ctrl);
  }


  ngOnInit(): void {
    super.ngOnInit();
    this.initPanelConfigurationCommon();
    this.loadWells();
    this.initToolConnections();
    this.initDataLoggers();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnDestroy(): void {

    if (this.isLeavingWorkflow) { 
      GatewayPanelBase.ShowNavigation = true;
    }

    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }
    this.arrSubscriptions = [];

    this.validationService.clearError();
    if (this.currentWellIdx != -1) {
      this.updateLocalWellState();  
    }
    // If flowmeter associated 
    if(this.surefloFlowMeterList.length > 0) {
      this.updateFlowMeterState();
    }
    super.ngOnDestroy();
  }
}
