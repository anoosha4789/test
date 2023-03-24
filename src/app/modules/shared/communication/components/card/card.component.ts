import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { IgxColumnComponent, IgxGridComponent } from 'igniteui-angular';

import { GaugeTypeUIModel } from '@core/models/UIModels/models.model';
import { interfaceCardSchema } from '@core/models/schemaModels/InterfaceCardDataUIModel.schema';
import { SureSENSGaugeDataUIModel } from '@core/models/webModels/SureSENSGaugeDataUIModel.model';
import * as _ from 'lodash';
import { ValidationService } from '@core/services/validation.service';
// import { CommunicationChannelFacadeService } from '@core/facade/communicationChannelFacade.service';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { GaugeDetailsComponent, GaugeDetailsComponentData } from '../gauge-details/gauge-details.component';
import { Store } from '@ngrx/store';
import { GatewayPanelBase, ICommunicationBase } from '@comp/GatewayPanelBase.component';
import { String } from 'typescript-string-operations';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { InCHARGEGaugeDataUIModel } from '@core/models/webModels/InCHARGEGaugeDataUIModel.model';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { InchargeWellUIModel } from '@core/models/UIModels/Incharge.well.model';
import { InchargeZoneUIModel } from '@core/models/UIModels/incharge.zone.model';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';

import { ToolConnectionService } from '@core/services/tool-connection.service';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { WellFacade } from '@core/facade/wellFacade.service';
import { CardErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { CommunicationChannelType, deleteUIModal, PanelTypeList, UICommon } from '@core/data/UICommon';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { SurefloFacade } from '@core/facade/surefloFacade.service';
import { FlowMeterTypes } from '@core/models/webModels/SureFLODataModel.model';
import { SureFLO298UIFlowMeterUIModel } from '@core/models/UIModels/sureflo-flowmeter-model';
import { SureFLO298ExUIFlowMeterUIModel } from '@core/models/UIModels/sureflo-ex-flowmeter-model';

@Component({
  selector: 'gw-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent extends GatewayPanelBase implements OnInit, AfterViewInit, OnChanges, OnDestroy, ICommunicationBase {

  @Input()
  card: any;

  @Input()
  channel: any;

  @Input()
  isDirty: boolean;

  @Output()
  isFormValidEvent = new EventEmitter();

  @Output()
  hasCardsChangedEvent = new EventEmitter();

  @Output()
  cardFormInvalidEvent = new EventEmitter();

  @ViewChild('gridGauges', { static: true })
  public gridGauges: IgxGridComponent;
  portingList: any[];
  addToolBtnVisibility: boolean = true;
  isCardTypeInUse: boolean = false;
  isInchargeInUse: boolean;
  sureSensToolCount: number;
  cardForm: FormGroup;
  private inputLabelMap = new Map();
  dataSource: DataSourceUIModel;
  gaugeDetails: GaugeDetailsComponentData;
  gauges: SureSENSGaugeDataUIModel[] = [];
  toolTypes: GaugeTypeUIModel[] = [];
  toolConnectionList: ToolConnectionUIModel[];
  currentWellId: number = -1;
  isGaugeValid: boolean = true;
  wells: InchargeWellUIModel[];
  zones: InchargeZoneUIModel[];

  public CardAppTypeFormControl = new FormControl('', Validators.required);
  public selectedCardAppType: string = 'InCHARGE'
  public disableCardAppType: boolean = false;
  public CardAppTypes: string[] = UICommon.CardAppTypes;

  private maxSlaveId: number = 255;
  private arrSubscriptions: Subscription[] = [];

  // Validation messages
  validateCardNameMssg: string = null;
  validateCardAddressMssg: string = null;
  cardName: string;
  cardErrorsList: CardErrorNotifierModel[] = [];
  isSerialChannel: boolean = false;

  constructor(protected store: Store,
    private router: Router,
    private toolConnectionService: ToolConnectionService,
    private panelConfigFacade: PanelConfigurationFacade,
    private wellDataFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private surefloDataFacade: SurefloFacade,
    private gwModalService: GatewayModalService,
    private validationService: ValidationService) {
    super(store, panelConfigFacade, wellDataFacade, dataSourceFacade, null, null, null, surefloDataFacade);
  }

  ngAfterViewInit(): void {
    this.validateOnInit();
  }

  private isValidForm() {
    this.cardForm.statusChanges
      .pipe(filter(() => this.cardForm.valid)).subscribe(() => {
        let bIsValid = this.dataSourceFacade.validateGauges(this.gauges);
        this.isFormValidEvent.emit(true && bIsValid);
      });

    this.cardForm.statusChanges
      .pipe(filter(() => this.cardForm.invalid)).subscribe(() => {
        let bIsValid = this.dataSourceFacade.validateGauges(this.gauges);
        this.isFormValidEvent.emit(false && bIsValid);
      });
  }

  private hasChanges() {
    let bIsValid = this.dataSourceFacade.validateGauges(this.gauges);
    this.isFormValidEvent.emit(bIsValid);

    this.cardForm.valueChanges.subscribe((val) => {
      if (!this.cardForm.pristine) {
        this.hasCardsChangedEvent.emit(true);
      }
    });
  }

  incrementSlaveId(): void {
    if (this.card.CardAddress < this.maxSlaveId) {
      this.card.CardAddress = Number(this.card.CardAddress) + 1;
      this.hasCardsChangedEvent.emit(true);
    }
  }

  decrementSlaveId(): void {
    if (this.card.CardAddress > 1) {
      this.card.CardAddress = Number(this.card.CardAddress) - 1;
      this.hasCardsChangedEvent.emit(true);
    }
  }

  checkChanged(event) {
    switch (event.source.id) {
      case 'InChargePowerSupply':
        this.card.SupportInChargePowerSupplyModule = event.checked;
        break;

      case 'EnableDownlink':
        this.card.EnableDownlink = event.checked;
        break;
    }
  }

  openGaugeDetailsDialog(title: string): void {
    this.gwModalService.openAdvancedDialog(
      title,
      ButtonActions.None,
      GaugeDetailsComponent,
      this.gaugeDetails,
      (result) => {
        if (result)
          this.saveToolDetails();
        else
          this.closeGaugeDetails();
      },
      '700px'
    );
  }

  addGauge() {
    // Assign Well Id
    this.mapWellId();
    //this.validateCardTypeInUse();
    if (this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.InCHARGE) {
      // InCHARGE Panel Type
      const isZoneAvialableToMap = this.checkZoneAvailability();
      if (isZoneAvialableToMap) {
        this.setGaugeDetails();
        this.openGaugeDetailsDialog('New Tool');
      } else {
        const well = this.wells.find(w => w.WellId === this.currentWellId);
        const cardType = this.card.SupportInChargePowerSupplyModule ? 'InCHARGE' : 'SureSENS';
        const toolCount = this.sureSensToolCount ? this.sureSensToolCount : well.Zones.length;
        this.gwModalService.openDialog(
          `Maximum number of tools allowed is <b>${toolCount}</b> for ${well.WellName}.`,
          () => this.gwModalService.closeModal(),
          null,
          'Info',
          null,
          false,
          "Ok",
          "No"
        );
      }
    }
    else {  // SureSENS Panel Type
      this.setGaugeDetails();
      this.openGaugeDetailsDialog('New Tool');
    }
  }

  setGaugeDetails() {
    // let gauge: SureSENSGaugeDataUIModel = new SureSENSGaugeDataUIModel();
    let gauge = this.card.SupportInChargePowerSupplyModule ? new InCHARGEGaugeDataUIModel : new SureSENSGaugeDataUIModel();

    gauge.Active = true;
    if (this.gauges == null || this.gauges.length == 0) {
      
      gauge.DeviceId = UICommon.IsImportConfig ? UICommon.getImportNextDeviceId() : -1;
      gauge.GaugeType = 0; //New code.Default gauge is QPT.
      gauge.EspGaugeType = 0;
    }
    else {
      //take the last entry selected gauge type for new tool records
      let gaugeDeviceId = this.gauges.length + 1;
      if(this.gauges.find(x=>x.DeviceId === -(gaugeDeviceId)))
      {
        gauge.DeviceId = UICommon.IsImportConfig ? UICommon.getImportNextDeviceId() : -(gaugeDeviceId + 1);
      }
      else
        gauge.DeviceId = UICommon.IsImportConfig ? UICommon.getImportNextDeviceId() : -(gaugeDeviceId);
      gauge.GaugeType = this.gauges[this.gauges.length - 1].GaugeType;
      gauge.EspGaugeType = this.gauges[this.gauges.length - 1].EspGaugeType;
    }
    gauge.SerialNumber = null;
    gauge.PressureCoefficientFileContent = [];
    gauge.TemperatureCoefficientFileContent = [];
    // For InCHARGE
    if (this.card.SupportInChargePowerSupplyModule) {
      (gauge as InCHARGEGaugeDataUIModel).InCHARGECoefficientFileName = null;
      (gauge as InCHARGEGaugeDataUIModel).InCHARGECoefficientFileContent = {
        serialNumber: '',
        toolType: '',
        toolSize: '',
        fullStrokeLengthInInch: null,
        defaultFullShiftVolumeInML: null,
        shiftVolumeInMLAndOpenPercentages: [],
        selectableOpenPercentages: []
      };
      (gauge as InCHARGEGaugeDataUIModel).InCHARGEOpeningPercentage = null;
    }
    this.gaugeDetails = null;
    let selectedGauge = gauge;
    this.gaugeDetails = {
      gauges: this.gauges,
      selectedGauge: this.card.SupportInChargePowerSupplyModule ? selectedGauge as InCHARGEGaugeDataUIModel : selectedGauge,
      selectedCardId: this.card.DeviceId,
      selectedCardName: this.card.Description,
      selectedChannelId: this.channel.IdCommConfig,
      selectedChannelName: this.channel.Description,
      IsInCHARGETool: this.card.SupportInChargePowerSupplyModule,
      currentWellId: this.currentWellId,
      portingList: this.portingList,
      modalEditMode: false
    };
  }

  mapWellId() {
    if (this.toolConnectionList && this.toolConnectionList.length > 0) {
      const toolConnection = this.toolConnectionList.find(tc => tc.ChannelId === this.channel.IdCommConfig && tc.CardDeviceId === this.card.DeviceId);
      this.currentWellId = toolConnection ? toolConnection.WellId : -1;
    } else {
      this.currentWellId = -1;
    }
  }

  // InCHARGE - SureSENS
  validateCardTypeInUse() {

    const data = this.toolConnectionList.filter(tc => tc.ChannelName === this.channel.Description);
    if (data && data.length === 1) {
      this.isInchargeInUse = this.card.SupportInChargePowerSupplyModule && data[0].PortingId == -1 ? true : false;
    } else if (data && data.length > 1) {
      const suresenToolIdx = data.findIndex(tc => tc.PortingId !== -1);
      const inchargeToolIdx = data.findIndex(tc => tc.PortingId === -1);
      this.isCardTypeInUse = suresenToolIdx !== -1 && inchargeToolIdx !== -1 ? true : false;
    }

  }

  checkZoneAvailability(): boolean {

    const well = this.wells.find(w => w.WellId === this.currentWellId);
    // For InCHARGE
    if (well && this.card.SupportInChargePowerSupplyModule) {
      const toolConnectionList = this.toolConnectionList.filter(tc => tc.WellId === well.WellId && tc.ChannelId === this.channel.IdCommConfig && tc.CardDeviceId === this.card.DeviceId);
      return well.Zones && well.Zones.length === toolConnectionList.length ? false : true;
    } else if (well && !this.card.SupportInChargePowerSupplyModule) { // SureSENS
      const toolConnectionList = this.toolConnectionList.filter(tc => tc.WellId === well.WellId && tc.ChannelId === this.channel.IdCommConfig && tc.CardDeviceId === this.card.DeviceId && tc.PortingId !== -1);
      this.sureSensToolCount = well.Zones.length * 2; // SureSENS 1 Zone we can configure Two Tools (Tubing & Annulus)
      // return well.Zones && this.sureSensToolCount === toolConnectionList.length ? false : true;
      // GATE-1339 SW - Allow multiple gauges for well zones
      return true;
    } else return true;
  }

  viewToolDetails(gaugeID) {
    // Assign Well Id
    this.mapWellId();
    this.gaugeDetails = null;
    let selectedGauge: SureSENSGaugeDataUIModel = _.cloneDeep(this.gauges.find(g => g.DeviceId == gaugeID));
    this.gaugeDetails = {
      gauges: this.gauges,
      selectedGauge: this.card.SupportInChargePowerSupplyModule ? selectedGauge as InCHARGEGaugeDataUIModel : selectedGauge,
      selectedCardId: this.card.DeviceId,
      selectedCardName: this.card.Description,
      selectedChannelId: this.channel.IdCommConfig,
      selectedChannelName: this.channel.Description,
      IsInCHARGETool: this.card.SupportInChargePowerSupplyModule,
      currentWellId: this.currentWellId,
      portingList: this.portingList,
      modalEditMode: true
    };

    this.openGaugeDetailsDialog(selectedGauge.Description);
  }

  private InitCardAppType(): void {
    if (this.card.SupportInChargePowerSupplyModule) {
      this.selectedCardAppType = 'InCHARGE';
    } else {
      this.selectedCardAppType = 'SureSENS';
    }
    this.EnableCardAppTypeSelection();
  }

  private EnableCardAppTypeSelection(): void {
    if (this.gauges && this.gauges.length > 0) {
      this.disableCardAppType = true;
    } else {
      this.disableCardAppType = false;
    }
  }

  initColumns(column: IgxColumnComponent) {
    // if (column.field == 'GaugeType') {
    //   column.formatter = (gaugeType => this.gaugeTypeName(gaugeType));
    // }
  }

  gaugeTypeName(value: any): string {
    if (this.toolTypes && this.toolTypes.length > 0)
      return this.toolTypes.find(t => t.GaugeType == value.GaugeType && t.ESPGaugeType == value.EspGaugeType).TypeName;
    else
      return 'loading...';
  }

  closeGaugeDetails() {
    this.gwModalService.closeModal();
    setTimeout(() => {
      this.gaugeDetails = null;
    }, 500);
  }

  saveToolDetails() {
    let selectedGauge: SureSENSGaugeDataUIModel = Object.assign({}, this.gaugeDetails.selectedGauge);
    let index = this.gauges.findIndex(g => g.DeviceId === selectedGauge.DeviceId);
    this.currentWellId = this.gaugeDetails.currentWellId;
    if (index == -1) {  // New Gauge added
      this.gridGauges.addRow(selectedGauge);
    }
    else {
      this.gauges[index].ToolAddress = selectedGauge.ToolAddress;
      this.gauges[index].GaugeType = selectedGauge.GaugeType;
      this.gauges[index].EspGaugeType = selectedGauge.EspGaugeType;
      this.gauges[index].Description = selectedGauge.Description;
      this.gauges[index].SerialNumber = selectedGauge.SerialNumber;
      this.gauges[index].PressureCoefficientFileContent = selectedGauge.PressureCoefficientFileContent;
      this.gauges[index].PressureCoefficientFileName = selectedGauge.PressureCoefficientFileName;
      this.gauges[index].TemperatureCoefficientFileContent = selectedGauge.TemperatureCoefficientFileContent;
      this.gauges[index].TemperatureCoefficientFileName = selectedGauge.TemperatureCoefficientFileName;
      // InCHARGE
      if (this.card.SupportInChargePowerSupplyModule) {
        (this.gauges[index] as InCHARGEGaugeDataUIModel).InCHARGECoefficientFileName = (selectedGauge as InCHARGEGaugeDataUIModel).InCHARGECoefficientFileName;
        (this.gauges[index] as InCHARGEGaugeDataUIModel).InCHARGECoefficientFileContent = (selectedGauge as InCHARGEGaugeDataUIModel).InCHARGECoefficientFileContent;
        (this.gauges[index] as InCHARGEGaugeDataUIModel).InCHARGEOpeningPercentage = (selectedGauge as InCHARGEGaugeDataUIModel).InCHARGEOpeningPercentage;
      }
      this.gridGauges.updateRow(this.gauges[index], selectedGauge.DeviceId);
    }

    this.hasCardsChangedEvent.emit(true);   // Card has changed
    this.closeGaugeDetails();
    if (this.dataSourceFacade.validateGauges(this.gauges)) {
      this.isFormValidEvent.emit(true && this.cardForm.valid);
      this.EnableCardAppTypeSelection();
    }
  }

  private validateOnInit(): void {
    if (this.isDirty && this.cardForm) {
      this.cardForm.markAllAsTouched();
      this.validateCardName();
      this.validateCardAddress();
      if (this.validateCardNameMssg != null || this.validateCardAddressMssg != null)
        this.isFormValidEvent.emit(false);
    }
  }

  validateCardName() {
    this.validateCardNameMssg = null;
    let ctrl = this.cardForm.controls['Description'];
    if (ctrl && ctrl.touched && ctrl.invalid) {
      this.validateCardNameMssg = this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get('Description'));
      const error: CardErrorNotifierModel = {
        path: this.getCardPath(),
        channelId: this.dataSource.Channel.IdCommConfig,
        fieldName: 'Description',
        deviceId: this.card.DeviceId,
        cardName: this.card.currentCardName,
        tabName: this.dataSource.Channel.Description + " : " + this.card.currentCardName,
        errors: [
          {
            name: 'Description',
            value: `Card Name : ${this.validateCardNameMssg}`
          }
        ]
      };
      this.setErrorNotifierList(error);
      return;
    } else {
      this.updateErrorNotifierList('Description');
    }
  }

  validateCardAddress() {
    this.validateCardAddressMssg = null;
    let ctrl = this.cardForm.controls['CardAddress'];
    if (ctrl && ctrl.touched && ctrl.invalid) {
      this.validateCardAddressMssg = this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get('CardAddress'));
      const error: CardErrorNotifierModel = {
        path: this.getCardPath(),
        channelId: this.dataSource.Channel.IdCommConfig,
        fieldName: 'CardAddress',
        deviceId: this.card.DeviceId,
        tabName: this.dataSource.Channel.Description + " : " + this.card.currentCardName,
        errors: [
          {
            name: 'CardAddress',
            value: `Card Address : ${this.validateCardAddressMssg}`
          }
        ]
      };
      this.setErrorNotifierList(error);
      return;
    } else {
      this.updateErrorNotifierList('CardAddress');
    }
  }

  // GATE- 1238 Datasource Error Validation
  setErrorNotifierList(data: CardErrorNotifierModel) {
    if (this.cardErrorsList && this.cardErrorsList.length > 0) {
      const cardErrorIdx = this.cardErrorsList.findIndex(cardError => cardError.deviceId === this.card.DeviceId);
      if (cardErrorIdx == -1) {
        this.cardErrorsList.push(data);
      }
      else {
        const fieldIdx = this.cardErrorsList[cardErrorIdx].errors.findIndex(e => e.name === data.errors[0].name);
        if (fieldIdx === -1) {
          this.cardErrorsList[cardErrorIdx].errors.push(data.errors[0]);
        } else {
          this.cardErrorsList[cardErrorIdx].tabName = data.tabName;
          this.cardErrorsList[cardErrorIdx].errors[fieldIdx] = data.errors[0];
        }
      }

    } else {
      this.cardErrorsList.push(data);
    }

    this.cardFormInvalidEvent.emit({
      errors: this.cardErrorsList, deviceId: this.card.DeviceId,
      fieldName: data.fieldName
    });
  }

  updateErrorNotifierList(fieldName: string) {

    if (fieldName && this.cardErrorsList && this.cardErrorsList.length > 0) {
      const cardErrorIdx = this.cardErrorsList.findIndex((item) => item.deviceId === this.card.DeviceId);
      if (cardErrorIdx !== -1) {
        const fieldIdx = this.cardErrorsList[cardErrorIdx].errors.findIndex(e => e.name === fieldName);
        if (fieldIdx !== -1) {
          if (this.cardErrorsList[cardErrorIdx].errors.length > 1) {
            this.cardErrorsList[cardErrorIdx].errors.splice(fieldIdx, 1);
          } else {
            this.cardErrorsList.splice(cardErrorIdx, 1);
          }
        }
      }
    } else {
      this.cardErrorsList = [];
    }

    const errorsList = this.cardErrorsList.length > 0 ? this.cardErrorsList : null;
    if (errorsList) {
      this.updateCardNameInErrors(errorsList);
    }
    this.cardFormInvalidEvent.emit({
      errors: errorsList, deviceId: this.card.DeviceId,
      fieldName: fieldName
    });
  }

  getCardPath() {
    let path = this.router.url;
    path = path.includes(';') ? this.router.url.split(';')[0] : path;
    return `${path}`;
  }

  updateCardNameInErrors(cardErrorList: CardErrorNotifierModel[]) {
    const cardName = this.dataSource.Channel.Description + " : " + this.card.Description;
    cardErrorList.forEach(cardError => {
      const errorIdx = cardError.errors.findIndex(e => e.name === 'Description');
      if (errorIdx == -1) {
        cardError.tabName = cardName;
        // cardError.errors.map(e => e.value = cardName + " : " + this.validateCardAddressMssg)
      }
    });
  }
  // End GATE- 1238 Datasource Error Validation

  createFormGroup() {
    this.cardForm = new FormGroup({});
    for (const property in interfaceCardSchema.properties) {
      let formControl = new FormControl('');
      let validationFn: ValidatorFn[] = [];
      if (interfaceCardSchema.required.includes(property))
        validationFn.push(Validators.required);

      if (interfaceCardSchema.properties.hasOwnProperty(property)) {
        let prop = interfaceCardSchema.properties[property];
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

        if (prop.pattern !== undefined)
          validationFn.push(Validators.pattern(prop.pattern));

        if (prop.type !== undefined && prop.type === 'integer') {
          validationFn.push(this.validationService.ValidateInteger);
        }

        // Special Cases
        switch (property) {
          case 'Description':
            validationFn.push(this.dataSourceFacade.validateCardNameValidator(this.card));
            break;

          case 'CardAddress':
            validationFn.push(this.dataSourceFacade.validateCardAddressValidator(this.card));
            break;
        }
      }
      formControl.setValidators(validationFn);
      this.cardForm.addControl(property, formControl);
    }

    // This is required because all the properties are not loaded into the UI form and hence the form has missing values when bind to data object
    this.cardForm.setValue({
      DeviceId: this.card.DeviceId,
      Active: this.card.Active,
      CardAddress: this.card.CardAddress,
      CommConfigId: this.card.CommConfigId,
      Gauges: this.card.Gauges,
      CardType: this.card.CardType,
      Description: this.card.Description,
      SupportInChargePowerSupplyModule: this.card.SupportInChargePowerSupplyModule,
      EnableDownlink: this.card.EnableDownlink,
    });
  }

  private initInputLabelMap(): void {
    if (
      interfaceCardSchema !== undefined &&
      interfaceCardSchema !== null &&
      interfaceCardSchema.properties !== undefined &&
      interfaceCardSchema.properties !== null) {
      for (const property in interfaceCardSchema.properties) {
        if (interfaceCardSchema.properties.hasOwnProperty(property)) {
          const prop = interfaceCardSchema.properties[property];
          if (prop.title !== undefined) {
            this.inputLabelMap.set(property, prop.title);
          }
        }
      }
    }
  }

  // ICommunicationChannelBase methods
  postCallGetToolTypes(): void {
    this.toolTypes = this.toolTypesStore;
    this.gauges = this.card.Gauges ?? [];
  }

  postCallGetWells(): void {
    this.wells = this.wellEnity;
  }

  postCallGetToolConnections(): void {
    this.toolConnectionList = this.toolConnectionEntity;
  }

  postCallGetDataSources(): void {
    this.dataSource = this.dataSourcesEntity.find(ds => ds.Channel.Description === this.channel.Description);
  }

  CardAppTypeChange(cardAppType) {
    this.selectedCardAppType = cardAppType.value;
    if (this.selectedCardAppType === 'InCHARGE') {
      this.card.SupportInChargePowerSupplyModule = true;
      this.card.EnableDownlink = true;
    } else {
      this.card.SupportInChargePowerSupplyModule = false;
      this.card.EnableDownlink = false;
    }
  }

  public deleteRow(rowIndex, gaugeId) {
    const isFlowmeterLinked = this.surefloEnity.length > 0 ? this.validateToolWithFlowMeters(gaugeId) : false;
    let gauge = this.gauges.find(g => g.DeviceId == gaugeId) ?? null;
    if (gauge && !isFlowmeterLinked) {
      this.gwModalService.openDialog(
        `Do you want to delete tool '${gauge.Description}'?`,
        () => this.deleteGauge(gaugeId),
        () => this.gwModalService.closeModal(),
        deleteUIModal.title,
        null,
        true,
        deleteUIModal.primaryBtnText,
        deleteUIModal.secondaryBtnText
      );
    } else if (gauge && isFlowmeterLinked) {
      this.gwModalService.openDialog(
        `${gauge.Description} is associated with a FlowMeter(s).<br>Delete the associated FlowMeter(s) before deleting the tool.</br>`,
        () => this.gwModalService.closeModal(),
        null,
        'Warning',
        null,
        false,
        "Ok"
      );
    }
  }

  private deleteGauge(deviceId: number): void {
    let index = this.gauges.findIndex(g => g.DeviceId === deviceId) ?? -1;
    if (index !== -1) {
      let delGauge = _.cloneDeep(this.gauges[index]);
      delGauge.Description = String.Format("{0} - {1} - {2}", this.channel.Description ?? "", this.card.Description ?? "", this.gauges[index].Description ?? "");
      this.gwModalService.closeModal();
      this.EnableCardAppTypeSelection();
      this.gauges.splice(index, 1);
      this.gridGauges.notifyChanges(true);
      this.hasCardsChangedEvent.emit(true);   // Card has changed
      if (this.gauges.length <= 0) {
        this.isFormValidEvent.emit(false);
      }
      this.dataSourceFacade.deleteGauge(deviceId, this.card.DeviceId, delGauge);
      this.removeToolConnection(deviceId, this.card.DeviceId);
    }
  }

  removeToolConnection(deviceId, cardDeviceId) {
    let toolConnections = this.toolConnectionEntity.filter(t => t.DeviceId == deviceId && t.CardDeviceId == cardDeviceId) ?? [];
    if (toolConnections.length > 0) {
      toolConnections.forEach(toolConn => {
        this.dataSourceFacade.deleteToolConnection(toolConn.Id, deviceId);
      });
    }
  }

  validateToolWithFlowMeters(gaugeId: number) {
    let count = 0;
    this.surefloEnity.forEach(fm => {
      if (parseInt(fm.Technology) === FlowMeterTypes.SureFLO298) {
        const flowmeter = fm as SureFLO298UIFlowMeterUIModel;
        let isFlowMterLinked = flowmeter.flowMeterPTMapping.InletPressureSource.DeviceId === gaugeId ||
          flowmeter.flowMeterPTMapping.ThroatPressureSource.DeviceId === gaugeId ||
          flowmeter.flowMeterPTMapping.TemperatureSource.DeviceId === gaugeId;
        if (flowmeter.flowMeterPTMapping.UseRemoteGauge) {
          isFlowMterLinked = isFlowMterLinked || flowmeter.flowMeterPTMapping.RemotePressureSource?.DeviceId === gaugeId;
        }
        count = isFlowMterLinked ? count + 1 : count;
      } else {
        const exflowmeter = fm as SureFLO298ExUIFlowMeterUIModel;
        let isExFlowMeterLinked = exflowmeter.flowMeterPTMapping.InletPressureSource.DeviceId === gaugeId ||
          exflowmeter.flowMeterPTMapping.OutletPressureSource.DeviceId === gaugeId ||
          exflowmeter.flowMeterPTMapping.InletTemperatureSource.DeviceId === gaugeId ||
          exflowmeter.flowMeterPTMapping.OutletTemperatureSource.DeviceId === gaugeId;
        if (exflowmeter.flowMeterPTMapping.UseRemoteGauge) {
          isExFlowMeterLinked = isExFlowMeterLinked || (exflowmeter.flowMeterPTMapping.RemotePressureSource?.DeviceId === gaugeId || exflowmeter.flowMeterPTMapping.RemoteTemperatureSource?.DeviceId === gaugeId);
        }
        count = isExFlowMeterLinked ? count + 1 : count;
      }

    });
    return count > 0 ? true : false;
  }

  ngOnChanges(): void {
    this.gauges = this.card.Gauges ?? [];
    this.EnableCardAppTypeSelection();
    //this.validateOnInit();
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }

    this.arrSubscriptions = [];
    // Discard Tool Connection changes if Card is not created
    this.discardToolConnection();
    super.ngOnDestroy();
  }

  // GATE-1282
  discardToolConnection() {
    const datasource = this.dataSourceFacade.dataSourcesEntity.find(ds => ds.Channel.IdCommConfig === this.channel.IdCommConfig);
    if (datasource) {
      const cardIdList = datasource.Cards.map(c => c.DeviceId);
      let toolConnections = [];
      if (cardIdList.length > 0) {
        toolConnections = this.toolConnectionList.filter(tc => tc.ChannelId === this.channel.IdCommConfig &&
          cardIdList.findIndex(cardId => cardId === tc.CardDeviceId) === -1) ?? [];
        if (toolConnections.length > 0) {
          this.deleteToolConnection(toolConnections);
        }
      } else {
        let toolConnections = this.toolConnectionList.filter(t => t.ChannelId === this.channel.IdCommConfig) ?? [];
        if (toolConnections.length > 0) {
          this.deleteToolConnection(toolConnections);
        }
      }
    }
  }

  deleteToolConnection(toolConnections) {
    toolConnections.forEach(toolConn => {
      this.dataSourceFacade.deleteToolConnection(toolConn.Id, toolConn.DeviceId);
    });
  }

  // Gate -1238 Datasource Validation
  private getCardErrorlist() {
    this.cardErrorsList = [];
    if (this.dataSource && this.dataSource.cardError) {
      const cardIdx = this.dataSource.cardError.findIndex(e => e.deviceId === this.card.DeviceId);
      if (cardIdx !== -1) {
        this.cardErrorsList.push(this.dataSource.cardError[cardIdx]);
      }
    }
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.createFormGroup();
    this.initInputLabelMap();
    this.initToolTypes();
    this.initPanelConfigurationCommon();
    this.initWells();
    this.initDataSources();
    this.initToolConnections();
    this.initFlowMeters();
    this.isValidForm();
    this.hasChanges();
    this.InitCardAppType();
    this.addToolBtnVisibility = this.wellDataFacade.wellEnity?.length == 0 ? false : true;
    this.toolConnectionService.getPortingList().subscribe(res => this.portingList = res);
    this.getCardErrorlist();
    if (this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId != PanelTypeList.InCHARGE) {
      this.disableCardAppType = true;
    }
    this.maxSlaveId = interfaceCardSchema.properties?.CardAddress?.maximum;
    this.isSerialChannel = this.channel.channelType === CommunicationChannelType.SERIAL;
  }
}
