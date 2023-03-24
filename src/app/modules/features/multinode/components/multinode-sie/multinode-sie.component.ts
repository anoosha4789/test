import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { UICommon } from '@core/data/UICommon';
import { ValidationService } from '@core/services/validation.service';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SIEConfigCommonSchema } from '@core/models/schemaModels/SIECongfigurationUIModel.schema';
import { ErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { Router } from '@angular/router';
import { MultiNodePanelModel, PanelConfigurationCommonModel } from '@core/models/webModels/PanelConfigurationCommon.model';

import * as PANELTYPE_ACTIONS from '@store/actions/panelType.action';
import * as ACTIONS from '@store/actions/sie.entity.action';
import { IPanelTypeState } from '@store/state/panelType.state';
import { Store } from '@ngrx/store';
import { StateUtilities } from '@store/state/IState';
import { PanelType } from '@core/models/UIModels/PanelType.model';
import { UtilityService } from '@core/services/utility.service';
import { MultiNodePanelConfigurationCommonUIModel } from '@core/models/UIModels/multinode-panel-config-common.model';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { SieFacade } from '@core/facade/sieFacade.service';
import { SieModel } from '@core/models/webModels/Sie.model';
import { SieUIModel } from '@core/models/UIModels/sie.model';
import * as _ from 'lodash';
import { MultiNodeWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { WellFacade } from '@core/facade/wellFacade.service';



@Component({
  selector: 'app-multinode-sie',
  templateUrl: './multinode-sie.component.html',
  styleUrls: ['./multinode-sie.component.scss']
})
export class MultinodeSieComponent extends GatewayPanelBase implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Output()
  sietateEmmiter = new EventEmitter<SieUIModel>();
  @Output() isFormInValidEvent = new EventEmitter();
  @Output() isFormValidEvent = new EventEmitter();
  @Output() hasFormChangedEvent = new EventEmitter<{ dirty: Boolean, valid: Boolean, data: any }>();
  @Input()
  panelSchema: any;
  @Input()
  selectedTab: number;
  @Input()
  sie: SieUIModel;

  panelConfiguration: MultiNodePanelConfigurationCommonUIModel = new MultiNodePanelConfigurationCommonUIModel();
  panelConfigurationCommon: MultiNodePanelConfigurationCommonUIModel = new MultiNodePanelConfigurationCommonUIModel();

  isConfigSaved: boolean;
  sieName: string;
  sieFormGroup: FormGroup;
  panelTypesModels$: Observable<IPanelTypeState>;
  panelTypes: PanelType[] = [];
  private arrSubscriptions: Subscription[] = [];
  @Input() sies: SieUIModel[] = [];

  IpAddressList = ["", "", "", ""];
  ipAddressErrorMessage: string;

  MacAddressList = ["", "", "", "", "", ""];
  macAddressErrorMessage: string;

  portNumberErrorMessage:string;

  // Validation messages
  private mapErrMessages: Map<string, string> = new Map<string, string>();
  isPanelConfigured: boolean = true;
  private inputLabelMap = new Map();
  isDirty: boolean;
  tabLabelAddWell: string = "+ Add Well";
  selectedTabIndex = 0;
  currentSie: SieUIModel;

  constructor(protected store: Store,
    private formBuilder: FormBuilder,
    private validationService: ValidationService,
    private router: Router,
    private panelConfigFacade: PanelConfigurationFacade,
    sieFacade: SieFacade,
    wellFacade: WellFacade,
    private utilityService: UtilityService) {
    super(store, panelConfigFacade, wellFacade, null, null, null, null, null, null, sieFacade);
    this.panelTypesModels$ = this.store.select<any>((state: any) => state.panelState);
    this.sieFormGroup = this.formBuilder.group({ IpAddressList: this.formBuilder.group({}) });
    this.sieFormGroup = this.formBuilder.group({ MacAddressList: this.formBuilder.group({}) });
  }



  private initInputLabelMap(): void {
    this.panelSchema = SIEConfigCommonSchema;
    if (
      this.panelSchema !== undefined &&
      this.panelSchema !== null &&
      this.panelSchema.properties !== undefined &&
      this.panelSchema.properties !== null) {
      for (const property in this.panelSchema.properties) {
        if (this.panelSchema.properties.hasOwnProperty(property)) {
          const prop = this.panelSchema.properties[property];
          if (prop.title !== undefined) {
            this.inputLabelMap.set(property, prop.title);
          }
        }
      }
    }
  }

  setIpAddress(event, index) {
    this.IpAddressList[index] = event.currentTarget.value;
    let ipAddress = this.IpAddressList.join(".");
    this.sieFormGroup.patchValue({
      IpAddress: ipAddress
    });
    this.validateControl(event, "IpAddress");
  }

  setMacAddress(event, index) {
    this.MacAddressList[index] = event.currentTarget.value;
    let macAddress = this.MacAddressList.join(".");
    this.sieFormGroup.patchValue({
      MacAddress: macAddress
    });
    this.validateControl(event, "MacAddress");
  }

  ipAddressGroupValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let ipPartOne = control.get('ipPartOne');
      let ipPartTwo = control.get('ipPartTwo');
      let ipPartThree = control.get('ipPartThree');
      let ipPartFour = control.get('ipPartFour');

      if (ipPartOne && ipPartTwo && ipPartThree && ipPartFour) {
        let ipList = [ipPartOne.value, ipPartTwo.value, ipPartThree.value, ipPartFour.value];
        let emptyIp = ipList.filter(ip => ip === "" || ip === null || ip === undefined);
        let invalidIp = ipList.filter(ip => ip >= 256);

        if (emptyIp.length === ipList.length) {
          this.ipAddressErrorMessage = "Required IP Address";
          return { customError: this.ipAddressErrorMessage };
        }

        if (emptyIp && emptyIp.length > 0) {
          this.ipAddressErrorMessage = "Invalid IP Address.";
          return { customError: this.ipAddressErrorMessage };
        }

        if (invalidIp && invalidIp.length > 0) {
          this.ipAddressErrorMessage = "Invalid IP Address.";
          return { customError: this.ipAddressErrorMessage };
        }
      }
      this.ipAddressErrorMessage = "";
      return null;
    };
  }

  macAddressGroupValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let macPartOne = control.get('macPartOne');
      let macPartTwo = control.get('macPartTwo');
      let macPartThree = control.get('macPartThree');
      let macPartFour = control.get('macPartFour');
      let macPartFive = control.get('macPartFive');
      let macPartSix = control.get('macPartSix');

      if (macPartOne && macPartTwo && macPartThree && macPartFour && macPartFive && macPartSix) {
        let macError = [macPartOne.errors, macPartTwo.errors, macPartThree.errors, macPartFour.errors, macPartFive.errors, macPartSix.errors];
        let macList = [macPartOne.value, macPartTwo.value, macPartThree.value, macPartFour.value, macPartFive.value, macPartSix.value];
        let emptyMac = macList.filter(mac => mac === "" || mac === null || mac === undefined);
        if (emptyMac.length === macList.length) {
          this.macAddressErrorMessage = "Required MAC Address";
          return { customError: this.macAddressErrorMessage };
        }
        if (emptyMac && emptyMac.length > 0) {
          this.macAddressErrorMessage = "Invalid MAC Address.";
          return { customError: this.macAddressErrorMessage };
        }
        let errorMac = macError.filter(mac => mac !== null);
        if (errorMac && errorMac.length > 0) {
          this.macAddressErrorMessage = "Invalid MAC Address";
          return { customError: this.macAddressErrorMessage };
        }


        let MacAddress = macList.join(".");
        
     let bIsValid = this.sies?.findIndex(sie => sie.Id !== this.sie.Id && sie.MacAddress === MacAddress) !== -1 ? false : true;

      
        if (!bIsValid) {
          
          this.macAddressErrorMessage = "Mac Address is in use.";
          
          return { customError: this.macAddressErrorMessage };
         
        }


      }
      this.macAddressErrorMessage = "";
      return null;
    };
  }



  private validateControl(ctrlId, ctrl) {
    if (ctrl) {
      if (ctrl.touched && ctrl.invalid) {
        if(!(ctrlId === "IpAddressList" || ctrlId ==='MacAddressList'))
        this.mapErrMessages.set(ctrlId, this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(ctrlId)));
      }
      else
        this.mapErrMessages.delete(ctrlId);

      if (ctrlId === "IpAddressList") {
        if (this.ipAddressErrorMessage) {
          this.mapErrMessages.set("IpAddress", this.ipAddressErrorMessage);
        } else
          this.mapErrMessages.delete("IpAddress");
      }
      if (ctrlId === "MacAddressList") {
        if (this.macAddressErrorMessage) {
          this.mapErrMessages.set("MacAddress", this.macAddressErrorMessage);
        } else
          this.mapErrMessages.delete("MacAddress");
      }
    }
    this.setErrorNotifierList();
  }


  setErrorNotifierList() {
    const errorList = [...this.mapErrMessages].map(([name, value]) => ({
      name,
      value: this.setErrorDisplayLabel(name, value)
    }));
    if (errorList && errorList.length > 0) {
      const errorDetails: ErrorNotifierModel[] = [{
        path: this.router.url,
        tabName: this.sie.currentSieName +' - SIU',
        tabIndex: 3,
        errors: errorList
      }];
      this.isFormInValidEvent.emit(errorDetails);
    } else {
      this.isFormInValidEvent.emit(null)
     }

  }

  setErrorDisplayLabel(name, value) {
    let displayName = null;
    switch (name) {
      case 'Name':
        displayName = `SIU Name : ${value}`
        break;
      case 'PortNumber':
        displayName = `SIU Port Number : ${value}`
        break;
      case 'IpAddress':
        displayName = `SIU IP Address : ${value}`
        break;
      case 'MacAddress':
        displayName = `MSMP MAC Address : ${value}`
        break;
    }
    return displayName;
  }


  validate(event) {
    let ctrl = this.sieFormGroup.get(event.currentTarget.id);
    ctrl.markAsTouched();
    this.validateControl(event.currentTarget.id, ctrl);
  }
  getInputLabel(id: string) {
    return this.inputLabelMap.get(id);
  }

  getError(fieldName: string) {
    return this.mapErrMessages.get(fieldName);
  }
  clearValidtions() {
    this.validationService.clearError();
  }
  clearErrors(): void {
    this.store.dispatch(PANELTYPE_ACTIONS.PANELTYPES_CLEARERRORS());
  }
  private subscribeToFormValidationEvent() {
    this.sieFormGroup.statusChanges
      .pipe(filter(() => this.sieFormGroup.valid)).subscribe(() => {
        if (this.sieFormGroup && this.selectedTab == 0) {
          const sieData: SieUIModel = {
            Id: this.sie.Id,
            SIEGuid: this.sie.SIEGuid,
            NetworkType: this.sie.NetworkType,
            Name: this.sieFormGroup.get('Name').value,
            IpAddress: this.IpAddressList.join("."),
            PortNumber: this.sieFormGroup.get('PortNumber').value,
            MacAddress: this.MacAddressList.join("."),
            SIEWellLinks: this.sie.SIEWellLinks,
            SIEDeviceId : this.sie.SIEDeviceId? this.sie.SIEDeviceId > 0 ? this.sie.SIEDeviceId : UICommon.IsImportConfig ? UICommon.getImportNextDeviceId() : -1 : -1,// this.sie.SIEDeviceId,
            IsDirty: this.sieFormGroup.dirty,
            IsValid: true,
            currentSieName:this.sie.currentSieName
          }
          this.sietateEmmiter.emit(sieData);
          this.isFormValidEvent.emit(this.sieFormGroup.valid);
        }
      });

    this.sieFormGroup.statusChanges
      .pipe(filter(() => this.sieFormGroup.invalid)).subscribe(() => {
        if (this.sieFormGroup && this.selectedTab == 0) {
          this.isFormValidEvent.emit(false);
        }
      });
  }

  // private subscribeToValueChangeEvent() {
  //   this.sieFormGroup.valueChanges.subscribe((val) => {
  //     this.hasFormChangedEvent.emit(true);
  //   });
  // }

  ipPortValidator(): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value === undefined || c.value == null) {
        if (this.portNumberErrorMessage === "Port Number is in use.") this.portNumberErrorMessage = "";
        return null;
      }

      let isportNumberInUse = this.sies?.findIndex(sie => sie.Id !== this.sie.Id && sie.PortNumber === this.sie.PortNumber) !== -1 ? false : true;

      if (!isportNumberInUse) {
        this.portNumberErrorMessage = "Port Number is in use";
        return { customError: this.portNumberErrorMessage };
      }
      return null;
    };
  }

  createFormGroup() {
    this.sieFormGroup = new FormGroup({});
    for (const property in SIEConfigCommonSchema.properties) {
      if (SIEConfigCommonSchema.properties[property].title !== 'SIU IP Address' || SIEConfigCommonSchema.properties[property].title !== 'MSMP MAC Address') {
        let formControl = new FormControl('');
        let validationFn: ValidatorFn[] = [];
        if (SIEConfigCommonSchema.required.includes(property))
          validationFn.push(Validators.required);

        if (SIEConfigCommonSchema.properties.hasOwnProperty(property)) {
          let prop = SIEConfigCommonSchema.properties[property];
          if (prop.minLength !== undefined)
            validationFn.push(Validators.minLength(prop.minLength));

          if (prop.maxLength !== undefined)
            validationFn.push(Validators.maxLength(prop.maxLength));

          if (prop.minimum !== undefined && prop.maximum !== undefined) {
            validationFn.push(RangeValidator.range(prop.minimum, prop.maximum));
          }
          else {
            if (prop.minimum !== undefined)
              validationFn.push(Validators.min(prop.minimum));

            if (prop.maximum !== undefined)
              validationFn.push(Validators.max(prop.maximum));
          }

          if (prop.type !== undefined && prop.type === 'integer') {
            validationFn.push(this.validationService.ValidateInteger);
          }

          // Special Cases
          let sieId = this.sie?.Id;
          if (property === 'Name') {
            validationFn.push(this.sieFacade.sieNameValidator(sieId));
          }
          // if (property === 'PortNumber') {
          //   validationFn.push(this.ipPortValidator());
          // }

        }
        formControl.setValidators(validationFn);
        this.sieFormGroup.addControl(property, formControl);
      }

    }


    let ipFormGroup = this.createIpAddressGroup(this.IpAddressList);
    ipFormGroup.setValidators([Validators.required, this.ipAddressGroupValidator()]);
    this.sieFormGroup.addControl("IpAddressList", ipFormGroup);

    let macFormGroup = this.createMacAddressGroup(this.MacAddressList);
    macFormGroup.setValidators([Validators.required, this.macAddressGroupValidator()]);
    this.sieFormGroup.addControl("MacAddressList", macFormGroup);

    this.sieFormGroup.patchValue(
      {
        Id: this.panelConfiguration.Id
      }
    );

    this.setFormData();
  }

  setFormData() {
    this.subscribeToFormDataChanges();
  }
  private subscribeToFormDataChanges() {
    this.sieFormGroup.valueChanges.subscribe((val) => {
      if (this.selectedTab === 0) {
        const sieData: SieUIModel = {
          Id: this.sie.Id,
          SIEGuid: this.sie.SIEGuid,
          NetworkType: this.sie.NetworkType,
          Name: this.sieFormGroup.get('Name').value,
          IpAddress: this.IpAddressList.join("."),
          PortNumber: this.sieFormGroup.get('PortNumber').value,
          MacAddress: this.MacAddressList.join("."),
          SIEWellLinks: this.sie.SIEWellLinks,
          SIEDeviceId : this.sie.SIEDeviceId? this.sie.SIEDeviceId > 0 ? this.sie.SIEDeviceId : UICommon.IsImportConfig ? UICommon.getImportNextDeviceId() : -1 : -1,// this.sie.SIEDeviceId,
          currentSieName:this.sie.currentSieName,
          IsDirty: this.sieFormGroup.dirty
        }
        if (!this.sieFormGroup.pristine && this.sieFormGroup.valid) {
          this.hasFormChangedEvent.emit({ dirty: !this.sieFormGroup.pristine, valid: true, data: sieData });
        }
        ///this.validateFormControls();
        this.sietateEmmiter.emit(sieData);
      }
    });
  }

  createIpAddressGroup(IpAddressList) {
    if (IpAddressList && IpAddressList.length > 0) {
      return this.formBuilder.group({
        ipPartOne: this.formBuilder.control(IpAddressList[0] ?? "", [Validators.required, Validators.min(0), Validators.max(255)]),
        ipPartTwo: this.formBuilder.control(IpAddressList[1] ?? "", [Validators.required, Validators.min(0), Validators.max(255)]),
        ipPartThree: this.formBuilder.control(IpAddressList[2] ?? "", [Validators.required, Validators.min(0), Validators.max(255)]),
        ipPartFour: this.formBuilder.control(IpAddressList[3] ?? "", [Validators.required, Validators.min(0), Validators.max(255)])
      });
    } else { return null; }


  }

  createMacAddressGroup(MacAddressList) {
    let macPattern = "^[A-Za-z0-9]{2}$";
    if (MacAddressList && MacAddressList.length > 0) {
      return this.formBuilder.group({
        macPartOne: this.formBuilder.control(MacAddressList[0] ?? "", [Validators.required, Validators.pattern(macPattern)]),
        macPartTwo: this.formBuilder.control(MacAddressList[1] ?? "", [Validators.required, Validators.pattern(macPattern)]),
        macPartThree: this.formBuilder.control(MacAddressList[2] ?? "", [Validators.required, Validators.pattern(macPattern)]),
        macPartFour: this.formBuilder.control(MacAddressList[3] ?? "", [Validators.required, Validators.pattern(macPattern)]),
        macPartFive: this.formBuilder.control(MacAddressList[4] ?? "", [Validators.required, Validators.pattern(macPattern)]),
        macPartSix: this.formBuilder.control(MacAddressList[5] ?? "", [Validators.required, Validators.pattern(macPattern)])
      });
    } else { return null; }
  }


  private validateOnInit(): void {
    this.isPanelConfigured = (this.panelConfiguration && this.panelConfiguration.PanelTypeId != -1) ? true : false;
    if (this.sieFormGroup) {
      if (this.panelConfiguration.isPageVisited || this.sieFormGroup.touched || GatewayPanelBase.ShowNavigation == true) {// page visited on
        this.sieFormGroup.markAllAsTouched();
        Object.keys(this.sieFormGroup.controls).forEach(key => {
          this.validateControl(key, this.sieFormGroup.controls[key]);
        });
      }
      if (this.sieFormGroup.pristine) {
        this.sieFormGroup.markAsTouched();
      }
    }
  }
  ngOnChanges(): void {
    if (this.sie) {
      this.sieName = this.sie.Name;
      this.IpAddressList = this.sie.IpAddress?.split(".");
      this.MacAddressList = this.sie.MacAddress?.split(".");
      this.sieFormGroup.patchValue({
        Id: this.sie.Id,
        SIEGuid: this.sie.SIEGuid,
        NetworkType: this.sie.NetworkType,
        Name: this.sie.Name,
        IpAddress: this.sie.IpAddress,
        MacAddress: this.sie.MacAddress,
        PortNumber: this.sie.PortNumber,
        SIEWellLinks: this.sie.SIEWellLinks,
        //SIEDeviceId : this.sie.SIEDeviceId? this.sie.SIEDeviceId > 0 ? this.sie.SIEDeviceId : UICommon.IsImportConfig ? UICommon.getImportNextDeviceId() : -1 : -1,// this.sie.SIEDeviceId,
      });
      this.subscribeToFormValidationEvent();
      //this.subscribeToValueChangeEvent();
      this.initInputLabelMap();
      this.validateOnInit();
    }
    // this.validateOnInit();
  }
  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription !== null) {
          subscription.unsubscribe();
        }
      });
    }

    this.arrSubscriptions = [];
    this.clearValidtions();
    super.ngOnDestroy();
  }


  ngAfterViewInit(): void {
    /* if (this.panelSchema !== undefined) {
      this.subscribeToFormValidationEvent();
      this.subscribeToValueChangeEvent();
      this.initInputLabelMap();
      this.validateOnInit();
    } */
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.mapErrMessages.clear();
    this.panelSchema = SIEConfigCommonSchema;
    this.createFormGroup();
 
    this.subscribeToFormValidationEvent();
    /*  if (this.panelSchema !== undefined) {
       this.createFormGroup();
     } */
  }
}
