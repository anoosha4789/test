import { Component, Inject, OnChanges, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { SureSENSGaugeDataUIModel } from '@core/models/webModels/SureSENSGaugeDataUIModel.model';
import { CommunicationChannelService } from '@core/services/communicationChannel.service';
import { Subscription } from 'rxjs';
import { String } from 'typescript-string-operations';

//import { CommunicationChannelFacadeService } from '@core/facade/communicationChannelFacade.service';
import { GaugeTypeUIModel } from '@core/models/UIModels/models.model';
import { GatewayPanelBase, ICommunicationBase, IWellBase } from '@comp/GatewayPanelBase.component';
import { Store } from '@ngrx/store';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { gaugeSchema } from '@core/models/schemaModels/SureSENSGaugeDataModel.schema';
import { ValidationService } from '@core/services/validation.service';
import { InchargeWellUIModel } from '@core/models/UIModels/Incharge.well.model';
import { InchargeZoneUIModel } from '@core/models/UIModels/incharge.zone.model';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { ToolConnectionService } from '@core/services/tool-connection.service';
import { InCHARGEGaugeDataUIModel } from '@core/models/webModels/InCHARGEGaugeDataUIModel.model';
import { WellFacade } from '@core/facade/wellFacade.service';
import { PanelTypeList, UICommon } from '@core/data/UICommon';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';

@Component({
  selector: 'gw-gauge-details',
  templateUrl: './gauge-details.component.html',
  styleUrls: ['./gauge-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GaugeDetailsComponent extends GatewayPanelBase implements OnInit, OnChanges, OnDestroy, ICommunicationBase, IWellBase {
  gaugeDetails: GaugeDetailsComponentData;

  IsInCHARGETool: boolean = true;
  wellDropdownVisibility: boolean = true;
  zoneDropdownVisibility: boolean = true;
  isToolValidEvent: boolean = true;
  isPortingEmpty: boolean = false;
  panelTypeId: number;
  gaugeDetailsForm: FormGroup;
  private inputLabelMap = new Map();

  fileExtension: string = "";
  importTemperatureCalpath: string = "Browse...";
  importPressureCalpath: string = "Browse...";
  importPressureCalArray: string[] = new Array();
  importTemperatureCalArray: string[] = new Array();

  importInchargeCalpath: string = "Browse...";
  importInchargeCalArray: string[] = new Array();

  validateDescription: string;
  validateToolPressureCalibrationMessage: string;
  validateToolTemperatureCalibrationMessage: string;
  validateTransducerSerialNumber: string;
  valveOpenPercentage = null;
  valveOpenPercentageMsg: string;
  inchargeCalMsg: string;

  dataSources: DataSourceUIModel[];
  selectedGauge: SureSENSGaugeDataUIModel;
  currentWellId: number;
  selToolConnection: ToolConnectionUIModel;
  toolConnectionList: ToolConnectionUIModel[];
  portingList: any[];

  toolTypes: GaugeTypeUIModel[] = [];
  selectedGaugeIndex: number; 
  public InChargeToolTypeId: number = 5;

  private maxToolAddress: number = 32;
  remainingToolAddress: number[] = new Array();

  private arrSubscriptions: Subscription[] = [];

  wells: InchargeWellUIModel[];
  zones: InchargeZoneUIModel[];

  showZones = true;
  zoneLabel = "Zone";
  modalEditMode: boolean;

  constructor(protected store: Store,
    public dialogRef: MatDialogRef<GaugeDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GaugeDetailsComponentData,
    private panelConfigFacade: PanelConfigurationFacade,
    private wellDataFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private communicationChannelService: CommunicationChannelService,
    private validationService: ValidationService,
    private toolConnectionService: ToolConnectionService) {
    super(store, panelConfigFacade, wellDataFacade, dataSourceFacade, null, null, null);
  }

  subscribeToToolNameChange(): void {
   const subscription = this.gaugeDetailsForm.controls['Description'].valueChanges.subscribe((val) => {
      if (this.gaugeDetailsForm.controls['Description'].touched) {
        this.validateTool({currentTarget: {id: 'Description'}});
      }
    });
    this.arrSubscriptions.push(subscription);
  }
  

  toolAddressChange(toolAddress) {
    if (this.selectedGauge.Description === undefined || this.selectedGauge.Description == null || this.selectedGauge.Description.trim() === "") {
      this.selectedGauge.Description = String.Format("TOOL_{0}", toolAddress.value);
      this.gaugeDetailsForm.controls['Description'].setErrors(null);
      this.gaugeDetailsForm.controls['Description'].markAsTouched();
      this.validateTool({currentTarget: {id: 'Description'}});
      if (this.gaugeDetailsForm.pristine) {
        this.validateTool({currentTarget: {id: 'SerialNumber'}});
        this.validateTool({currentTarget: {id: 'ValveOpenPercentage'}});
      }
    }
  }

  gaugeTypeChange(event) {
    let gaugeType = this.toolTypes[event.value];
    this.selectedGauge.GaugeType = gaugeType.GaugeType;
    this.selectedGauge.EspGaugeType = gaugeType.ESPGaugeType;
    this.validateTool(null);
  }

  browseFileDialog(fileType: string) {
    this.fileExtension = fileType === 'pressure' ? '.crf' : (fileType === 'incharge' ? '.json' : '.crt');
    let selectElement: string = fileType === 'pressure' ? 'selectFileCRF' : (fileType === 'incharge' ? 'selectFileJSON' : 'selectFileCRT');
    const selectedFile = document.getElementById(selectElement) as HTMLInputElement;
    selectedFile.value = null;
    selectedFile.click();
  }

  pressureCalfileChangeEvent(fileInput: any): void {
    this.gaugeDetailsForm.markAsDirty();
    if (fileInput.target.files.length == 0)
      return;

    this.validateToolPressureCalibrationMessage = null;
    this.importPressureCalpath = fileInput.target.files[0].name;
    var extension = this.importPressureCalpath.split(".")[1];
    if (extension.toLowerCase() != "crf") {
      this.importPressureCalpath = "Browse...";
      this.validateToolPressureCalibrationMessage = "Please select a valid CRF file.";
      this.isToolValidEvent = false;
      return;
    }

    var file = fileInput.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = () => {
      this.importPressureCalArray = [];
      var allTextLines = (<string>reader.result).split("\n");
      if (allTextLines.length > 0) {
        if (allTextLines[allTextLines.length - 1].trim() == "")
          allTextLines.splice(allTextLines.length - 1);
      }
      for (let i = 0; i < allTextLines.length; i++) {
        if (allTextLines[i].trim().startsWith("'")) {
          allTextLines[i] = allTextLines[i].replace("'", '');
        }
        this.importPressureCalArray.push(allTextLines[i]);
      }

      const subscription = this.communicationChannelService.validatePressureCoefficient(this.importPressureCalArray).subscribe(x => {
        if (x === true) {
          this.selectedGauge.PressureCoefficientFileContent = this.importPressureCalArray;
          this.selectedGauge.PressureCoefficientFileName = this.importPressureCalpath;
          this.validateTool(null);
        }
        else {
          this.importPressureCalpath = "Browse...";
          this.selectedGauge.PressureCoefficientFileContent = [];
          this.validateToolPressureCalibrationMessage = "Please select a valid CRF file.";
          this.isToolValidEvent = false;
        }
      },
        error => {
          this.importPressureCalpath = "Browse...";
          this.selectedGauge.PressureCoefficientFileContent = [];
          this.validateToolPressureCalibrationMessage = "Please select a valid CRF file.";
          this.isToolValidEvent = false;
        });
        this.arrSubscriptions.push(subscription);
    };
  }

  temperatureCalfileChangeEvent(fileInput: any): void {
    this.gaugeDetailsForm.markAsDirty();
    if (fileInput.target.files.length == 0)
      return;

    this.validateToolTemperatureCalibrationMessage = null;
    this.importTemperatureCalpath = fileInput.target.files[0].name;
    var extension = this.importTemperatureCalpath.split(".")[1];
    if (extension.toLowerCase() != "crt") {
      this.importTemperatureCalpath = "Browse...";
      this.validateToolTemperatureCalibrationMessage = "Please select a valid CRT file.";
      this.isToolValidEvent = false;
      return;
    }

    var file = fileInput.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = () => {
      this.importTemperatureCalArray = [];
      var allTextLines = (<string>reader.result).split("\n");
      if (allTextLines.length > 0) {
        if (allTextLines[allTextLines.length - 1].trim() == "")
          allTextLines.splice(allTextLines.length - 1);
      }
      for (let i = 0; i < allTextLines.length; i++) {
        if (allTextLines[i].trim().startsWith("'")) {
          allTextLines[i] = allTextLines[i].replace("'", '');
        }
        this.importTemperatureCalArray.push(allTextLines[i]);
      }
      const subscription = this.communicationChannelService.validateTemperatureCoefficient(this.importTemperatureCalArray).subscribe(x => {
        if (x === true) {
          this.selectedGauge.TemperatureCoefficientFileContent = this.importTemperatureCalArray;
          this.selectedGauge.TemperatureCoefficientFileName = this.importTemperatureCalpath;
          this.validateTool(null);
        }
        else {
          this.importTemperatureCalpath = "Browse...";
          this.selectedGauge.TemperatureCoefficientFileContent = [];
          this.validateToolTemperatureCalibrationMessage = "Please select a valid CRT file.";
          this.isToolValidEvent = false;
        }
      },
        error => {
          this.importTemperatureCalpath = "Browse...";
          this.selectedGauge.TemperatureCoefficientFileContent = [];
          this.validateToolTemperatureCalibrationMessage = "Please select a valid CRT file.";
          this.isToolValidEvent = false;
        });
      this.arrSubscriptions.push(subscription);
    };
  }

  inchargeCalfileChangeEvent(fileInput: any): void {
    this.gaugeDetailsForm.markAsDirty();
    if (fileInput.target.files.length == 0)
      return;

    this.inchargeCalMsg = null;
    this.importInchargeCalpath = fileInput.target.files[0].name;
    var extension = this.importInchargeCalpath.split(".")[1];
    if (extension.toLowerCase() != "json") {
      this.importInchargeCalpath = "Browse...";
      this.inchargeCalMsg = "Please select a valid calibration file.";
      this.isToolValidEvent = false;
      return;
    }

    var file = fileInput.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onloadend = (e) => {
      const isvalidJsonFile = this.isValidJsonFile(reader.result.toString());
      const calFile = isvalidJsonFile ? JSON.parse(reader.result.toString()) : null;
      (this.selectedGauge as InCHARGEGaugeDataUIModel).InCHARGECoefficientFileName = this.importInchargeCalpath;
      (this.selectedGauge as InCHARGEGaugeDataUIModel).InCHARGECoefficientFileContent = calFile;
      if (calFile) {
        const isvalidCalFile = this.validateInchargeCalFile(calFile);
        if(isvalidCalFile) { 
          this.inchargeCalMsg = null;
          this.validateTool(null);
        } else {
          this.importInchargeCalpath = "Browse...";
          this.inchargeCalMsg = "Please select a valid calibration file.";
          this.isToolValidEvent = false;
        }
      } else {
        this.importInchargeCalpath = "Browse...";
        this.inchargeCalMsg = "Please select a valid JSON file.";
        this.isToolValidEvent = false;
      }
    };
  }

  isValidJsonFile(str) {
    try {
      JSON.parse(str)
    } catch(e) {
      return false;
    }
    return true;
  }

  validateInchargeCalFile(file) {
    return file.DefaultFullShiftVolumeInML && file.DefaultFullShiftVolumeInML.toString().length > 0 &&
           file.SelectableOpenPercentages && file.SelectableOpenPercentages.length > 0 && 
           file.ShiftVolumeInMLAndOpenPercentages && file.ShiftVolumeInMLAndOpenPercentages.length > 0
  }

  validateToolName(bLoading: boolean): boolean {
    let bIsValidToolName = true;
    for (let i = 0; i < this.gaugeDetails.gauges.length; i++) {
      let gauge = this.gaugeDetails.gauges[i];
      if (gauge.DeviceId !== this.selectedGauge.DeviceId && 
          gauge.Description.toLowerCase().trim() === this.selectedGauge.Description.toLowerCase().trim()) {
          bIsValidToolName = false;
      }
    }
    // let dataSource = this.dataSources.find(d => d.Channel.IdCommConfig === this.gaugeDetails.selectedChannelId);
    // if (dataSource) {
    //   let card = dataSource.Cards.find(c => c.DeviceId === this.gaugeDetails.selectedCardId);
    //   if (card) {
    //     for (let i = 0; i < card.Gauges?.length; i++) {
    //       let gauge = card.Gauges[i];
    //       if (gauge.DeviceId == this.selectedGauge.DeviceId)
    //         continue;

    //       if (gauge.Description.toLowerCase().trim() === this.selectedGauge.Description.toLowerCase().trim()) {
    //         bIsValidToolName = false;
    //         break;
    //       }
    //     }
    //   }
    //   else {
    //     for (let i = 0; i < this.gaugeDetails.gauges.length; i++) {
    //       let gauge = this.gaugeDetails.gauges[i];
    //       if (gauge.DeviceId == this.selectedGauge.DeviceId)
    //         continue;

    //         if (gauge.Description.toLowerCase().trim() === this.selectedGauge.Description.toLowerCase().trim()) {
    //           bIsValidToolName = false;
    //           break;
    //       }        
    //     }
    //   }
    // }
    return bIsValidToolName;
  }

  validateSerialNumber(): boolean {

    this.validateTransducerSerialNumber = null;
    let transducerCount = 0;
    // Current Card Level Validation
    for (let i = 0; i < this.gaugeDetails.gauges.length; i++) {
      let gauge = this.gaugeDetails.gauges[i];
      if (gauge.DeviceId !== this.selectedGauge.DeviceId && 
          gauge.SerialNumber.toLowerCase().trim() == this.selectedGauge.SerialNumber.toLowerCase().trim()) {
          transducerCount++;
      }
    }
    // Across Card level validation
    this.dataSources.forEach(datasource => {
      if (datasource && datasource.Cards) {
        datasource.Cards.forEach(card => {
          card.Gauges.forEach(gauge => {
            if ((
              datasource.Channel.IdCommConfig !== this.gaugeDetails.selectedChannelId ||
              card.DeviceId !== this.gaugeDetails.selectedCardId || 
              gauge.DeviceId !== this.selectedGauge.DeviceId) &&
              gauge.SerialNumber.toLowerCase().trim() == this.selectedGauge.SerialNumber.toLowerCase().trim()) {
              transducerCount++;
            }
          })
        })
      }
    });

    // if (!this.dataSources)
    //   return;
    // let dataSource = this.dataSources.find(d => d.Channel.IdCommConfig === this.gaugeDetails.selectedChannelId);
    // if (!dataSource) { // New Data Source
    //   for (let i = 0; i < this.gaugeDetails.gauges.length; i++) {
    //     let gauge = this.gaugeDetails.gauges[i];
    //     if (gauge.DeviceId == this.selectedGauge.DeviceId)
    //       continue;

    //     if (gauge.SerialNumber == this.selectedGauge.SerialNumber)
    //       transducerCount++;
    //   }
    // }

    // if (dataSource) {
    //   let card = dataSource.Cards.find(c => c.DeviceId === this.gaugeDetails.selectedCardId);
    //   if (!card) {  // New Card
    //     for (let i = 0; i < this.gaugeDetails.gauges.length; i++) {
    //       let gauge = this.gaugeDetails.gauges[i];
    //       if (gauge.DeviceId == this.selectedGauge.DeviceId)
    //         continue;

    //       if (gauge.SerialNumber == this.selectedGauge.SerialNumber)
    //         transducerCount++;
    //     }
    //   }
    // }

    // for (let i = 0; i < this.dataSources.length; i++) {
    //   if (this.dataSources[i].Cards != undefined && this.dataSources[i].Cards != null)
    //     for (let j = 0; j < this.dataSources[i].Cards.length; j++) {
    //       for (let k = 0; k < this.dataSources[i].Cards[j].Gauges.length; k++) {
    //         if (this.dataSources[i].Channel.IdCommConfig == this.gaugeDetails.selectedChannelId
    //           && this.dataSources[i].Cards[j].DeviceId == this.gaugeDetails.selectedCardId
    //           && this.dataSources[i].Cards[j].Gauges[k].DeviceId == this.selectedGauge.DeviceId)
    //           continue; //Skip selected gauge

    //         if (this.selectedGauge.SerialNumber == this.dataSources[i].Cards[j].Gauges[k].SerialNumber) {
    //           transducerCount = transducerCount + 1;
    //         }
    //       }
    //     }
    // }

    // GATE-1157 Two tools with same transducer serial number
    // if (this.gaugeDetails.gauges && this.gaugeDetails.gauges.length > 0) {
    //   const tools = this.gaugeDetails.gauges.filter(gauge => gauge.SerialNumber === this.selectedGauge.SerialNumber);
    //   for (const tool of tools) {
    //     transducerCount = tool && tool.DeviceId !== this.selectedGauge.DeviceId ? transducerCount + 1 : transducerCount;
    //   }
    // }

    return transducerCount > 0 ? false : true;
  }

  validateTool(event, bLoading: boolean = false): void {
    let index = this.gaugeDetails.gauges.findIndex(g => g.DeviceId == this.selectedGauge.DeviceId);
    let bNewGauge = index == -1 ? true : false;
    if (!bNewGauge)
      bLoading = false;

    if (event != null) {
      switch(event.currentTarget.id) {
        case 'Description':
          this.validateDescription = null;
          break;

        case 'SerialNumber':
          this.validateTransducerSerialNumber = null;
          break;

        case 'ValveOpenPercentage':
          this.valveOpenPercentageMsg = null;
          break;
      }
        
      let ctrl = this.gaugeDetailsForm.get(event.currentTarget.id);
      if (ctrl && ctrl.invalid) { // ctrl.touched
        ctrl.markAsTouched();
        this.isToolValidEvent = false;
        let errMssg = this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(event.currentTarget.id));
        switch(event.currentTarget.id) {
          case 'Description':
            this.validateDescription = errMssg;
            break;
  
          case 'SerialNumber':
            this.validateTransducerSerialNumber = errMssg;
            break;
  
          case 'ValveOpenPercentage':
            this.valveOpenPercentageMsg = errMssg;
            break;
        }
        return;
      }

      if (event.currentTarget.id == 'ValveOpenPercentage' && event.target) {
        this.valveOpenPercentage = event.target.value  && event.target.value !== '' ? parseFloat(event.target.value) : null;
        if (this.IsInCHARGETool) {
          (this.selectedGauge as InCHARGEGaugeDataUIModel).InCHARGEOpeningPercentage = this.valveOpenPercentage;
        }
      }
    }

    if (this.validateDescription != null || this.validateTransducerSerialNumber != null || this.valveOpenPercentageMsg != null) {
      this.isToolValidEvent = false;
      return;
    }

    // SureSENS Panel
    if (this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.SURESENS && this.selToolConnection) {
      if (!this.selToolConnection.WellName ) {
        this.isToolValidEvent = false;
        return;
      }
    }

    // InCHARGE Panel - SureSENS Tool
    if (this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId !== PanelTypeList.SURESENS && this.selToolConnection) {
      if (!this.selToolConnection.WellName || !this.selToolConnection.ZoneName) {
        this.isToolValidEvent = false;
        return;
      }
    }

    if (this.IsInCHARGETool) { // InCHARGE gauge
      this.selectedGauge = (this.selectedGauge as InCHARGEGaugeDataUIModel);
      if ((this.selectedGauge as InCHARGEGaugeDataUIModel).InCHARGEOpeningPercentage === null ||
          !(this.selectedGauge as InCHARGEGaugeDataUIModel).InCHARGECoefficientFileName) {
        this.isToolValidEvent = false;
        return;
      }
      this.isToolValidEvent = (this.selectedGauge.SerialNumber !== null && this.selectedGauge.SerialNumber != "");
      return;
    }

    // Porting - SureSENS
    if (this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId !== PanelTypeList.SURESENS && this.selToolConnection && !this.IsInCHARGETool) {
      if (this.selToolConnection.Porting == '') {
        this.isToolValidEvent = false;
        return;
      }
      if(this.selToolConnection.Porting && this.portingList.length > 0) {
        if(this.portingList.findIndex(p => p.ConnectPorting === this.selToolConnection.Porting) === -1) {
          this.isToolValidEvent = false;
          return;
        }
      }
    }

    if ((this.selectedGauge.SerialNumber !== null && this.selectedGauge.SerialNumber != "")
      && (this.selectedGauge.PressureCoefficientFileContent != null && this.selectedGauge.PressureCoefficientFileContent.length > 0)
      && (this.selectedGauge.TemperatureCoefficientFileContent != null && this.selectedGauge.TemperatureCoefficientFileContent.length > 0))
      this.isToolValidEvent = true;
    else
      this.isToolValidEvent = false;
  }

  // validateValveInitalOpen(event) {
  //   this.valveOpenPercentageMsg = null;
  //   let ctrl = this.gaugeDetailsForm.get(event.currentTarget.id);
  //   if (ctrl && ctrl.touched && ctrl.invalid) {
  //     this.isToolValidEvent = false;
  //     this.valveOpenPercentageMsg = this.validationService.getValidationErrorMessage(ctrl.errors, 'Initial Open %');
  //     return;
  //   }

  //   if (event.target) {
  //     this.valveOpenPercentage = event.target.value  && event.target.value !== '' ? parseFloat(event.target.value) : null;
  //     if (this.IsInCHARGETool) {
  //       (this.selectedGauge as InCHARGEGaugeDataUIModel).InCHARGEOpeningPercentage = this.valveOpenPercentage;
  //     }
  //   }
  //   this.validateTool(null);
  //   this.valveOpenPercentageMsg = null;
  // }

  // setUpOpenPercentage(event) {
  //   this.valveOpenPercentage = event.target.value  && event.target.value !== '' ? parseFloat(event.target.value) : null;
  //   let ctrl = this.gaugeDetailsForm.get(event.currentTarget.id);
  //   if (ctrl && this.valveOpenPercentage != null) {
  //     ctrl.setErrors(null);
  //   }
  // }

  private initializeGaugeFiles(): void {
    this.importTemperatureCalpath = "Browse...";
    this.importPressureCalpath = "Browse...";

    if (this.selectedGauge.PressureCoefficientFileContent != null && this.selectedGauge.PressureCoefficientFileContent.length > 0)
      this.importPressureCalpath = this.selectedGauge.PressureCoefficientFileName;

    if (this.selectedGauge.TemperatureCoefficientFileContent != null && this.selectedGauge.TemperatureCoefficientFileContent.length > 0)
      this.importTemperatureCalpath = this.selectedGauge.TemperatureCoefficientFileName;
  }

  private mapInchargeProperties(): void {
   
    this.valveOpenPercentage = (this.selectedGauge as InCHARGEGaugeDataUIModel).InCHARGEOpeningPercentage !== null 
      && (this.selectedGauge as InCHARGEGaugeDataUIModel).InCHARGEOpeningPercentage !== undefined
    ? (this.selectedGauge as InCHARGEGaugeDataUIModel).InCHARGEOpeningPercentage : null;
    this.importInchargeCalpath = (this.selectedGauge as InCHARGEGaugeDataUIModel).InCHARGECoefficientFileName || 'Browse...';
    this.gaugeDetailsForm.patchValue({ ValveOpenPercentage: this.valveOpenPercentage});
  }

  private getRemainingToolAddress(): void {
    this.remainingToolAddress = new Array();

    // Add current if exist
    if (this.selectedGauge.ToolAddress !== undefined && this.selectedGauge.ToolAddress != null)
      this.remainingToolAddress.push(this.selectedGauge.ToolAddress);

    // Add remaining addresses
    for (var i = 1; i <= this.maxToolAddress; i++) {
      if (this.gaugeDetails.gauges.findIndex(c => c.ToolAddress == i) == -1)
        this.remainingToolAddress.push(i);
    }
  }

  private setUpToolAddress() {
    this.selectedGauge = this.gaugeDetails.selectedGauge;
    if (this.IsInCHARGETool) {
      this.selectedGauge.GaugeType = this.InChargeToolTypeId;
    }
    this.getRemainingToolAddress();
  }

  private createFormGroup() {
    this.gaugeDetailsForm = new FormGroup({});
    let gaugeDetailsSchema = gaugeSchema;
    for (const property in gaugeDetailsSchema.properties) {
      let formControl = new FormControl('');
      let validationFn: ValidatorFn[] = [];
      if (gaugeDetailsSchema.required.includes(property))
        validationFn.push(Validators.required);

      if (gaugeDetailsSchema.properties.hasOwnProperty(property)) {
        let prop = gaugeDetailsSchema.properties[property];
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

        // Special Cases
        switch(property) {
          case 'Description':
            validationFn.push(this.toolNameValidator());
            break;

          case 'SerialNumber':
            validationFn.push(this.serialNumberValidator());
            break;
        }
      }
      formControl.setValidators(validationFn);
      this.gaugeDetailsForm.addControl(property, formControl);
    }
    // TO DO - Add to JSON Schema 
    // this.gaugeDetailsForm.addControl("WellName", formControl);
    this.gaugeDetailsForm.addControl("ZoneName", new FormControl(''));
    this.gaugeDetailsForm.addControl("Porting", new FormControl(''));
    if (this.IsInCHARGETool) {
      let valveOpenPercentageFormControl = new FormControl('');
      valveOpenPercentageFormControl.setValidators([Validators.required, this.openPercentageValidator()]);
      this.gaugeDetailsForm.addControl("ValveOpenPercentage", valveOpenPercentageFormControl);
    }
    this.subscribeToToolNameChange();
  }

  private initInputLabelMap(): void {
    let gaugeDetailsSchema = gaugeSchema;
    if (
      gaugeDetailsSchema !== undefined &&
      gaugeDetailsSchema !== null &&
      gaugeDetailsSchema.properties !== undefined &&
      gaugeDetailsSchema.properties !== null) {
      for (const property in gaugeDetailsSchema.properties) {
        if (gaugeDetailsSchema.properties.hasOwnProperty(property)) {
          const prop = gaugeDetailsSchema.properties[property];
          if (prop.title !== undefined) {
            this.inputLabelMap.set(property, prop.title);
          }
        }
      }
    }
    this.inputLabelMap.set("ValveOpenPercentage", "Initial Open %");   // for Initial Valve Open %
  }

  get ToolName() {
    return this.gaugeDetailsForm.get('Description');
  }

  get ToolSerialNumber() {
    return this.gaugeDetailsForm.get('SerialNumber');
  }
  get WellName() {
    return this.gaugeDetailsForm.get('WellName');
  }

  get ZoneName() {
    return this.gaugeDetailsForm.get('ZoneName');
  }

  get Porting() {
    return this.gaugeDetailsForm.get('Porting');
  }

  get ValveOpenPercentage() {
    return this.gaugeDetailsForm.get('ValveOpenPercentage');
  }

  // On Modal Close
  OnCancel(): void {
    this.dialogRef.close();
  }

  // On Modal Submit
  OnOk() {    
    this.selToolConnection.SerialNumber = this.selectedGauge.SerialNumber;
    this.selToolConnection.ChannelId = this.gaugeDetails.selectedChannelId;
    this.selToolConnection.ChannelName = this.gaugeDetails.selectedChannelName;
    this.selToolConnection.DeviceName = this.selectedGauge.Description;
    setTimeout(() => {
      this.dataSourceFacade.saveToolConnection(this.selToolConnection);
    }, 500);   
    
    if (this.gaugeDetailsForm.dirty && this.gaugeDetailsForm.valid) {
      this.dialogRef.close(this.selectedGauge);
    } else {
      this.dialogRef.close();
    }
  }

  // ICommunicationBase methods
  postCallGetToolTypes(): void {
    if (this.IsInCHARGETool) {
      this.toolTypes = this.toolTypesStore.filter((deviceType) => (deviceType.GaugeType === this.InChargeToolTypeId));
    } else {
      this.toolTypes = this.toolTypesStore.filter((deviceType) => (deviceType.GaugeType !== this.InChargeToolTypeId));
    }
  }

  postCallGetDataSources(): void {
    this.dataSources = this.dataSourcesEntity;
    this.validateTool(null, true);
  }

  postCallGetWells(): void {
    this.wells = this.wellEnity;
  }
  
  postCallGetToolConnections(): void {
    this.toolConnectionList = this.toolConnectionEntity;
  }

  // On Well Dropdown Selection Change
  onWellSelChange(event): void {
    const well = this.wellEnity.find(w => w.WellName === event.value);
    this.selToolConnection.WellId = well.WellId;
    this.selToolConnection.WellName = well.WellName;
    if (this.IsInCHARGETool) {
      this.zones = this.filterInchargeZoneInUse(well.Zones , well.WellId);
    } else {
      // this.zones = this.filterSuresenZoneInUse(well.Zones, well.WellId);
      this.zones = well.Zones; // GATE-1339 SW - Allow multiple gauges for well zones
    }
    this.validateTool(null);
  }

  // On Zone Dropdown Selection Change
  onZoneSelChange(event): void {
    const zone = this.zones.find(z => z.ZoneName === event.value);
    if(!this.IsInCHARGETool) {
      // GATE-1339 SW - Allow multiple gauges for well zones
      this.portingList = this.gaugeDetails.portingList;
      // this.portingList = this.updatePortingList(zone.ZoneId);
    }
    this.selToolConnection.ZoneId = zone.ZoneId;
    this.selToolConnection.ZoneName = zone.ZoneName;
    this.validateTool(null);
  }

  // On Porting Dropdown Selection Change
  onPortingSelChange(event): void {
    const porting = this.portingList.find(p => p.ConnectPorting === event.value);
    this.selToolConnection.PortingId = porting.Id;
    this.selToolConnection.Porting = porting.ConnectPorting;
    this.validateTool(null);
  }

  // InCHARGE or SureSENS Card
  loadToolConnection() {
    // if (this.toolConnectionEntity && this.toolConnectionEntity.length === 0) {
    //   const well = this.wellEnity.find(w => w.WellId === this.currentWellId);
    //   this.zones = well.Zones;
    //   this.selToolConnection = this.initialToolConnection();
    // }
    // check whether Tool Connection existing in to the database or not 
    if (this.IsInCHARGETool) {
      this.getInchargeToolConnection();
    } else {
      this.getSuresensToolConnection();
    }

  }

  // InCHARGE Tool Mapping Logic
  // InCHARGE ==> 1 Card - 1 Well - 1 Zone - 1 Tool
  getInchargeToolConnection() {
    
    // Update existng Tool Connection Details
    this.selToolConnection = this.toolConnectionEntity.find(tc => tc.ChannelId === this.gaugeDetails.selectedChannelId
                              && tc.CardDeviceId === this.gaugeDetails.selectedCardId 
                              && tc.Porting === "" 
                              && tc.DeviceId === this.selectedGauge.DeviceId);
    if (this.selToolConnection) {
      this.currentWellId = this.selToolConnection.WellId;
      const well = this.wellEnity.find(w => w.WellId === this.selToolConnection.WellId);
      this.wells = this.filterInchargeWellInUse();
      this.zones = this.filterInchargeZoneInUse(well.Zones, well.WellId, this.selToolConnection.ZoneId);
      this.gaugeDetailsForm.patchValue(
        {
          WellName: this.selToolConnection.WellName,
          ZoneName: this.selToolConnection.ZoneName
        }
      );
      if (this.gaugeDetails.gauges.length > 1) this.wellDropdownVisibility = false;
      if (this.gaugeDetails.gauges.length === well.Zones.length) this.zoneDropdownVisibility = false;
    } else {
      // Card 1 ==> Well 1 ==> Tool Connection Saved to DB & User trying to create a new  Tool COnnection for Well 2
      // Well 1 should be removed from Well Dropdown 
      const well = this.wellEnity.find(w => w.WellId === this.currentWellId);
      this.wells = this.filterInchargeWellInUse(this.gaugeDetails.selectedCardId);
      if (well) {
        this.zones = this.wells.length > 0 ? this.filterInchargeZoneInUse(well.Zones, well.WellId) : [];
      }
      this.selToolConnection = this.initialToolConnection(this.toolConnectionEntity.length + 1);
      if (this.gaugeDetails.gauges.length + 1 > 1) this.wellDropdownVisibility = false;
    }
    this.mapInchargeProperties();
  }

  // SureSENS Tool Mapping Logic
  // SureSENS ==> Card 1 - Well 1 - Zone 1 - Porting  Tubing -  Tool 1
  // SureSENS ==> Card 1 - Well 1 - Zone 1 - Porting  Annulus -  Tool 2
  getSuresensToolConnection() {
    // Update existng Tool Connection Details
    if(this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.SURESENS) {
      this.selToolConnection = this.toolConnectionEntity.find(tc => tc.ChannelId === this.gaugeDetails.selectedChannelId
        && tc.CardDeviceId === this.gaugeDetails.selectedCardId 
        && tc.DeviceId === this.selectedGauge.DeviceId);
    } else {
    this.selToolConnection = this.toolConnectionEntity.find(tc => tc.ChannelId === this.gaugeDetails.selectedChannelId
      && tc.CardDeviceId === this.gaugeDetails.selectedCardId 
      && tc.Porting !== "" 
      && tc.DeviceId === this.selectedGauge.DeviceId);
    }
    if (this.selToolConnection) {
      const well = this.wellEnity.find(w => w.WellId === this.selToolConnection.WellId);
      // GATE-1339 SW - Allow multiple gauges for well zones
      this.portingList = this.gaugeDetails.portingList;
      this.wells = this.panelTypeId === PanelTypeList.InCHARGE ? this.filterInchargeWellInUse(this.selToolConnection.CardDeviceId) : this.filterWellInUse();
      this.zones = well.Zones;
      // this.zones = this.filterSuresenZoneInUse(well.Zones, well.WellId, this.selToolConnection.ZoneId);
      // this.portingList = this.updatePortingList(this.selToolConnection.ZoneId, this.selToolConnection.PortingId);
      // this.wells = this.filterWellInUse();
      // this.zones = this.portingList && this.portingList.length == 0 ?
      //              this.filterSuresenZoneInUse(well.Zones, well.WellId, this.selToolConnection.ZoneId) : well.Zones;
      this.gaugeDetailsForm.patchValue(
        {
          WellName: this.selToolConnection.WellName,
          ZoneName: this.selToolConnection.ZoneName,
          Porting: this.selToolConnection.Porting
        }
      );
      if (this.gaugeDetails.gauges.length > 1) this.wellDropdownVisibility = false;
    } else {
      // Well 1 Tool Connection Saved to DB & User trying to create a new  Tool Connection for Well 2
      // Well 1 should be removed from Well Dropdown 
      const well = this.wellEnity.find(w => w.WellId === this.currentWellId);
      this.wells = this.panelTypeId === PanelTypeList.InCHARGE ? this.filterInchargeWellInUse(this.gaugeDetails.selectedCardId) :
                   this.filterWellInUse(this.gaugeDetails.selectedCardId);
      if (well) {
        // this.portingList = this.removePortingInUse();
        // this.zones = this.wells.length > 0 ? this.filterSuresenZoneInUse(well.Zones, well.WellId) : [];
        this.zones = well.Zones;
      }
      let toolConnectionId = this.toolConnectionEntity.length + 1;
      if(this.toolConnectionEntity.find(x=>x.Id === -(toolConnectionId)))
      {
        this.selToolConnection = this.initialToolConnection(toolConnectionId + 1);
      }
      else
      this.selToolConnection = this.initialToolConnection(toolConnectionId);
      
      if (this.gaugeDetails.gauges.length + 1 > 1) this.wellDropdownVisibility = false;
    }
   
  }

  filterInchargeZoneInUse(zones, wellId?, zoneId?) {
   
    const toolConnectionList = wellId ? this.toolConnectionEntity.filter(tc => tc.ChannelId === this.gaugeDetails.selectedChannelId && tc.WellId === wellId && tc.PortingId === -1) : 
              this.toolConnectionEntity.filter(tc => tc.ChannelId === this.gaugeDetails.selectedChannelId && tc.PortingId === -1);
    if (toolConnectionList && toolConnectionList.length > 0) {
      const filteredZones = [];
      zones.forEach(zone => {
        const zoneIdx = zoneId ? toolConnectionList.findIndex(tc => tc.ZoneId === zone.ZoneId && zone.ZoneId === zoneId && tc.CardDeviceId === this.gaugeDetails.selectedCardId) :
                        toolConnectionList.findIndex(tc => tc.ZoneId === zone.ZoneId) ;
        
        if (zoneId) {
          // Get current zone value
          if (zoneIdx !== -1) {
            filteredZones.push(zone); // For existing gauge either in local state or database
          }
          // Populate newly added or yet to map  zones  to the dropdown
          const newZoneIdx = toolConnectionList.findIndex(tc => tc.ZoneId === zone.ZoneId);
          if(newZoneIdx === -1) filteredZones.push(zone);
        } else if (!zoneId && zoneIdx === -1) {
          filteredZones.push(zone);
        }
      });
      return filteredZones;
    } else {
      return zones;
    }
  }

  filterSuresenZoneInUse(zones, wellId?, zoneId?) {
    const filteredZones = [];
    const toolConnectionList = wellId ? this.toolConnectionEntity.filter(tc => tc.ChannelId === this.gaugeDetails.selectedChannelId && tc.WellId ===  wellId && tc.PortingId !== -1) :
    this.toolConnectionEntity.filter(tc => tc.ChannelId === this.gaugeDetails.selectedChannelId && tc.PortingId !== -1);   
    if (toolConnectionList && toolConnectionList.length > 0) {
      zones.forEach(zone => {
        if(zoneId) {
            const zoneIdx = toolConnectionList.findIndex(tc => tc.CardDeviceId === this.gaugeDetails.selectedCardId && tc.ZoneId === zone.ZoneId && zone.ZoneId === zoneId)
            if (zoneIdx !== -1) {
              filteredZones.push(zone); // For existing gauge either in local state or database
            } 
            return filteredZones;
        }
        // GATE-1339 SW - Allow multiple gauges for well zones
        filteredZones.push(zone);
        // We can map one zone (Tubing & Annulus) for one Tool
        // const zoneMapCount = toolConnectionList.filter(tc => tc.CardDeviceId === this.gaugeDetails.selectedCardId && tc.ZoneId === zone.ZoneId ).length;
        // if (zoneMapCount !== 2) {
        //   filteredZones.push(zone);
        // }
      });
      return filteredZones;
    } else return zones;
  }


  // Remove Wells used in other Cards
  filterWellInUse(deviceId?) {
    // True - if both Incharge & Surensens used in a  channel with  cards
    let removeWellInCardEnabled = false; 
    let wellIdList = [];
    // Handle Card Level Well Removal
    if(deviceId) {
     
      let isNewCard = false;
      // Get All Tool Connections related to Source
      let toolConnectionList = this.toolConnectionList.filter(tc => tc.ChannelId === this.gaugeDetails.selectedChannelId);
      // Get Current Source Cards 
      const currentSource =  this.dataSources.find(ds => ds.Channel.IdCommConfig === this.gaugeDetails.selectedChannelId);
      isNewCard = (currentSource && currentSource.Cards.findIndex(c => c.DeviceId === deviceId) === -1)  ||  (toolConnectionList.findIndex(cardId=> cardId.CardDeviceId === this.gaugeDetails.selectedCardId) === -1) ? true : false;
      // For new Configuration
      // One Well Can used for Suresens & Incharge maz 3 Tools
      if(isNewCard && currentSource && currentSource.Cards.length > 0 && toolConnectionList.length > 0) {
        currentSource.Cards.forEach(card => {
          const data = toolConnectionList.filter(tc => tc.CardDeviceId === card.DeviceId);
          if (data && data.length > 0) {
            const cardWellId = data[0].WellId;
            if (card.SupportInChargePowerSupplyModule && card.SupportInChargePowerSupplyModule === this.gaugeDetails.IsInCHARGETool) {
              removeWellInCardEnabled = true;
              wellIdList.push(cardWellId);
            } else if (!card.SupportInChargePowerSupplyModule && !card.SupportInChargePowerSupplyModule === !this.gaugeDetails.IsInCHARGETool){
              removeWellInCardEnabled = true;
              wellIdList.push(cardWellId);
            }
          }

        });
        
      }
    }
    // Remove wells are used in Cards for Incharge & Suresens - Channel Level
    let filteredWells = [];
    this.wells.forEach(well => {
      const wellIdx = this.toolConnectionList.findIndex(tc => tc.ChannelId !== this.gaugeDetails.selectedChannelId && tc.WellId === well.WellId);
      if(wellIdx === -1){
        filteredWells.push(well);
      }
    });

    // Remove wells used in Card for Incharge & Suresens - Card Level
    if (removeWellInCardEnabled) {
      let wells: any[] = [];
      filteredWells.forEach(well => {
        const wellIdx = wellIdList.findIndex(wellId => wellId === well.WellId);
        if(wellIdx === -1) wells.push(well);
      });
      filteredWells = wells;
    }
    
    return filteredWells;
  }

  // GATE- 1517 InCHARGE Well association with card rule changes
  // Well can be associated with cards in diff channel
  // Well should be associated with one InCHARGE & one SureSENS panel only 
  filterInchargeWellInUse(deviceId?) {
   
    let wellPanelMapList: Array<IWellMapDetails> = [];
    let filteredWellList = this.wells;
    let wellList: any[] = [];
    let wellIdx = null;

    if (this.toolConnectionList.length > 0) {
      this.dataSources.forEach(ds => {
        ds.Cards.forEach(card => {
          const filteredToolConList = this.toolConnectionList.filter(tc => tc.ChannelId === ds.Channel.IdCommConfig && tc.CardDeviceId === card.DeviceId);
          if (filteredToolConList && filteredToolConList.length > 0) {
            const toolConnection = filteredToolConList[0];
            let wellPanelTypeObj: IWellMapDetails = {
              wellId: toolConnection.WellId,
              cardId: toolConnection.CardDeviceId,
              channelId: toolConnection.ChannelId,
              panelTypeIncharge: card.SupportInChargePowerSupplyModule ? true : false
            };
            wellPanelMapList.push(wellPanelTypeObj);
          }
        });
      });
    }
    
    filteredWellList.forEach(well => {
      const wellMapIdx = wellPanelMapList.findIndex(wp => wp.wellId === well.WellId && wp.channelId === this.gaugeDetails.selectedChannelId
                                                    && wp.cardId === this.gaugeDetails.selectedCardId);
      if (well.WellId === this.currentWellId && wellMapIdx !== -1) {
        wellList.push(well);
      } else {
        wellIdx = this.IsInCHARGETool ?
          wellPanelMapList.findIndex(wp => wp.wellId === well.WellId && wp.panelTypeIncharge) :
          wellPanelMapList.findIndex(wp => wp.wellId === well.WellId && !wp.panelTypeIncharge);
        // Get wells not assocated with cards
        if (wellIdx === -1) {
          wellList.push(well);
        }
      }
    });
    filteredWellList = wellList;
    return filteredWellList;
  }

  // Remove Porting used in other SureSENS Cards
  removePortingInUse(portingId?) {
    const filteredPortingList = [];
    this.gaugeDetails.portingList.forEach(p => {
      const portingIdx = portingId ? this.toolConnectionList.findIndex(tc => tc.PortingId === p.Id && tc.PortingId === portingId) :
                        this.toolConnectionList.findIndex(tc => tc.PortingId === p.Id);
      if (portingId && portingIdx !== -1) {
        filteredPortingList.push(p);
      } else if (!portingId && portingIdx === -1) {
        filteredPortingList.push(p);
      }
      
    });
    return filteredPortingList;
  }

  updatePortingList(zoneId, portingId?) {
    let toolConnectionList = this.toolConnectionList.filter(tc =>  tc.ChannelId === this.gaugeDetails.selectedChannelId 
                                      && tc.CardDeviceId === this.gaugeDetails.selectedCardId 
                                      && tc.Porting !== ""
                                      && tc.ZoneId === zoneId);
    if (toolConnectionList.length > 0) {
      const filteredPortingList = [];
      this.gaugeDetails.portingList.forEach(p => {  
        const portingIdx = portingId ? toolConnectionList.findIndex(tc => tc.PortingId === p.Id && tc.PortingId === portingId) :
                          toolConnectionList.findIndex(tc => tc.PortingId === p.Id);
        // both portings are used
        if (portingId && portingIdx !== -1 && toolConnectionList.length === 2) {
          filteredPortingList.push(p);
        } 

        if (portingId && toolConnectionList.length === 1) {
          filteredPortingList.push(p);
        } else if (!portingId && toolConnectionList.length === 1 && portingIdx === -1) {
          filteredPortingList.push(p);
        } 
        
      });
      // filteredPortingList.push(porting);
      this.isPortingEmpty = filteredPortingList.length === 0 ? true : false;
      return filteredPortingList;
    } else return this.gaugeDetails.portingList;
  }

  initialToolConnection(Id?: number) {
    let well = this.wells.find(w => w.WellId == this.currentWellId);
    const toolConnectionObj = {
      Id: -Id || -1,
      WellId: well ? well.WellId : -1,
      WellName: well ? well.WellName : "",
      ZoneId: -1,
      ZoneName: "",
      SerialNumber: this.gaugeDetails.selectedGauge.SerialNumber,
      DeviceId: this.gaugeDetails.selectedGauge.DeviceId,
      DeviceName: this.gaugeDetails.selectedGauge.Description,
      CardDeviceId: this.gaugeDetails.selectedCardId,
      CardDeviceName:  this.gaugeDetails.selectedCardName,
      ChannelId: this.gaugeDetails.selectedChannelId,
      ChannelName: '',
      PortingId: -1,
      Porting: ""
    };
    return toolConnectionObj;
  }

  setSelectedGaugeIndex(): void {
    this.selectedGaugeIndex = this.toolTypes.findIndex(t => t.GaugeType === this.gaugeDetails.selectedGauge.GaugeType && t.ESPGaugeType === this.gaugeDetails.selectedGauge.EspGaugeType)??0;
  }

  postCallGetPanelConfigurationCommon(): void {
    this.panelTypeId = this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId;
    
    if(this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.SURESENS)  { 
      this.showZones = false;
    }
    this.zoneLabel = this.panelTypeId === PanelTypeList.MultiNode ? "eFCV" : "Zone";
  }
  
  ngOnChanges(): void {
    this.setUpToolAddress();
    this.createFormGroup();
    this.initializeGaugeFiles();
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }

    this.arrSubscriptions = [];
    super.ngOnDestroy();
  }
  
  ngOnInit(): void {
    super.ngOnInit();

    if (this.data) {
      this.gaugeDetails = this.data;
      this.IsInCHARGETool = this.data.IsInCHARGETool;
      this.currentWellId = this.data.currentWellId;
      this.modalEditMode = this.data.modalEditMode;
      this.setUpToolAddress();
      this.createFormGroup();
      this.initInputLabelMap();
      this.initializeGaugeFiles();
      this.initToolTypes();
      this.initPanelConfigurationCommon();
      this.initWells();
      this.initDataSources();
      this.initToolConnections();
      this.loadToolConnection();
      this.setSelectedGaugeIndex();
    }
  }

  // Validators
  toolNameValidator(): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
        if (c.value === undefined || c.value == null || c.value == "")
            return null;
         
       this.selectedGauge.Description = c.value;
       if(!this.validateToolName(false))
          return { customError: 'Name already exists.' };

        return null;
    };
  }

  serialNumberValidator(): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
        if (c.value === undefined || c.value == null || c.value == "")
            return null;
         
       this.selectedGauge.SerialNumber = c.value;
       if(!this.validateSerialNumber())
          return { customError: 'Serial number already exists.' };

        return null;
    };
  }

  openPercentageValidator(): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value === undefined || c.value == null || c.value == "")
          return null;
       
     let percentageValue = parseFloat(c.value);
     if (percentageValue < 0 || percentageValue > 100) 
        return { customError: 'Valid range is 0 to 100.' };

      return null;
    };
  }
}

export class GaugeDetailsComponentData {
  gauges: SureSENSGaugeDataUIModel[];
  selectedGauge: SureSENSGaugeDataUIModel;
  selectedCardId: number;
  selectedCardName: string;
  selectedChannelId: number;
  selectedChannelName: string;
  IsInCHARGETool: boolean;
  currentWellId: number;
  portingList: any[];
  modalEditMode: boolean;
}

export interface IWellMapDetails {
  wellId: number,
  cardId: number,
  channelId: number,
  panelTypeIncharge: boolean;
}
