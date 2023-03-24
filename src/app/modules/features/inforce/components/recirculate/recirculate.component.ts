import { Component, OnInit } from '@angular/core';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { DeviceIdIndexValue } from '@core/models/webModels/PointTemplate.model';
import { HyrdraulicPowerUnitPointIndex, OperationMode, ExecutionMode } from '@features/inforce/common/InForceModbusRegisterIndex';
import { InforceDeviceDataModel } from '@core/models/webModels/InforceDeviceData.model';
import { IInforceDeviceState } from '@store/state/inforcedevices.state';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { StateUtilities } from '@store/state/IState';
import * as INFORCE_DEVICES_ACTIONS from '@store/actions/inforcedevices.action';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { SetServerComponentData, SetServerValueComponent } from '@shared/monitoring/components/setservervalue/setservervalue.component';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import * as DEVICEPOINTS_ACTIONS from '@store/actions/deviceDataPoints.action';
import { IDeviceDataPoints } from "@store/state/deviceDataPoints.state";
import * as _ from 'lodash';
import { ConfigurationService } from '@core/services/configurationService.service';
import { WriteToServerDataModel } from '@core/models/webModels/WriteToServerData.model';
import { UICommon } from '@core/data/UICommon';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-recirculate',
  templateUrl: './recirculate.component.html',
  styleUrls: ['./recirculate.component.scss']
})
export class RecirculateComponent implements OnInit {
  private datePipe = new DatePipe('en-US');
  isVolumeBased = true;
  toolboxRoute: string = "/inforce/toolbox";
  progressPercent: number = 0;
  public deviceIdIndexValue: DeviceIdIndexValue[] = [];
  public deviceIdTEMP: number;
  public RecirculateTime: number = 15;
  public RecirculateVolume: number = 15;
  public ReservoirTankVolume: number = 15;
  private inforceDevices: InforceDeviceDataModel[] = null;
  private InforceDeviceState$: Observable<IInforceDeviceState>;
  private arrSubscriptions: Subscription[] = [];
  volumeBasedData: RecirculateColumns[] = [];
  timeBasedData: RecirculateColumns[] = [];
  recirculationValidationMessage: string;
  selectedRecirculateMethod: string = 'VolumeBased';
  RecirculateMethods = ['VolumeBased', 'TimeBased'];
  private deviceDataPointsModels$: Observable<IDeviceDataPoints>;
  private devicePointSubscription: Subscription = null;
  private datapointdefinitions: DataPointDefinitionModel[] = [];
  index: number;
  deviceValue: number;
  showMaintenenceMode: boolean = false;

  constructor(protected store: Store<{
    inforcedevicesState: IInforceDeviceState;
    deviceDataPointsState: IDeviceDataPoints;
  }>,
    private gwModalService: GatewayModalService,
    private realTimeService: RealTimeDataSignalRService,
    private configService: ConfigurationService,
  ) {
    this.InforceDeviceState$ = this.store.select<IInforceDeviceState>((state: any) => state.inforcedevicesState);
    this.deviceDataPointsModels$ = this.store.select<IDeviceDataPoints>((state: any) => state.deviceDataPointsState);
  }
  getrecirculateprogressPercentage() {
    this.progressPercent = 30;
    return this.progressPercent;
  }
  getPlannedRecirculationTimePointValue(): number {

    return this.getDeviceIndexValue(0) / 60;
  }
  getReservoirTankVolumePointValue(): number {
    return this.getRoundOffNumber((this.getDeviceIndexValue(2) / 3.78541));//convert L to gallon
  }
  getLastRecirculationOADatePointValue(): string {
    var msDateObj = this.getDeviceIndexValue(3);
    var date = new Date(((msDateObj - 25569) * 86400000));
    var tz = date.getTimezoneOffset();
    var newdate = new Date(((msDateObj - 25569 + (tz / (60 * 24))) * 86400000))
    return this.datePipe.transform(newdate.getTime(), 'MMM dd, yyyy, hh:mm:ss a') 
    //return new Date(newdate.getTime()).toLocaleString();

  }
  getLastRecirculationVolumeInTanksPointValue() {
    return this.getDeviceIndexValue(4).toFixed(2);
  }
  getLastRecirculationTimePointValue() {
    return (this.getDeviceIndexValue(5) / 60.0).toFixed(1);
  }
  getPlannedRecirculationVolumeInTanksPointValue(): number {

    return this.getDeviceIndexValue(1);
  }

  startRecirculation: boolean = false;
  
  BEGINRecirculation(): void {//function for begin recirculate. type 1 for volume based.0 for timebased
    let inputvalue: number = 0;
    if (this.selectedRecirculateMethod == 'VolumeBased') {
      inputvalue = 1;
    }
    if (inputvalue == 0) {
      let validationMessage = (UICommon.validatePositiveFloatWithoutProperty(this.RecirculateTime, 'Time to Recirculate', 1));
      if (validationMessage != null) {
        this.recirculationValidationMessage = validationMessage;
        //alert(validationMessage);
        return;
      }
    }
    else {
      let validationMessage = (UICommon.validatePositiveFloatWithoutProperty(this.RecirculateVolume, 'Volume to Recirculate', 1));
      if (validationMessage != null) {
        this.recirculationValidationMessage = validationMessage;
        //alert(validationMessage);
        return;
      }
    }
    let validationMessage = (UICommon.validatePositiveFloatWithoutProperty(this.ReservoirTankVolume, 'Reservoir Tank Volume', 1));
    if (validationMessage != null) {
      this.recirculationValidationMessage = validationMessage;
      return;
    }
    this.startRecirculation = true;

    if (this.getOperationExecutionInProgressPointValue() == 0)//verify  recirculate mode is not in progress
    {
      //console.log("START EXECUTION")
      this.setDeviceIndexValue(HyrdraulicPowerUnitPointIndex.ToRecirculateTankByVolume, inputvalue);//set recirculation Type volume based or time based
      // this.setDeviceIndexValue(InForceModbusRegisterIndex.HyrdraulicPowerUnitPointIndex.ExecuteOperationMode, 1);//set 59 index to 1 to start actual recirculation 
    }
  }

  ABORTRecirculation(): void {//function for begin recirculate. type 1 for volume based.0 for timebased

    if (this.getOperationExecutionInProgressPointValue() == 1)//verify  recirculate mode is in progress
    {
      //console.log("ABORT EXECUTION")
      let writeVar = new WriteToServerDataModel();
      writeVar.DeviceId = this.getHPUID();
      writeVar.PointIndex = HyrdraulicPowerUnitPointIndex.ExecuteOperationMode;
      writeVar.PointName = "";
      writeVar.Value = 0;
      this.configService.WriteToServer(writeVar).subscribe(
        result => {

        }
      );
    }
  }

  setDeviceIndexValue(deviceIndex, value): void { //function to set an device index value
    this.index = deviceIndex;
    this.deviceValue = value;
    if (this.getCurrentOperationModePointValue() == OperationMode.Recirculation)//verify current Mode is for recirculate mode
    {
      this.setValue();
    }
    else
      this.setOperationModeSequence();//set current operation mode to Recirculate
  }

  setOperationModeSequence(): void {
    let writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = this.getHPUID();
    writeVar.PointIndex = HyrdraulicPowerUnitPointIndex.SetOperationModeInternal;
    writeVar.PointName = "";
    writeVar.Value = OperationMode.Idle;
    this.configService.WriteToServer(writeVar).subscribe(
      result => {
        this.setRecirculateOperationMode();
      }
    );
  }

  setRecirculateOperationMode(): void {
    //set system in recirculate mode
    let writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = this.getHPUID();
    writeVar.PointIndex = HyrdraulicPowerUnitPointIndex.SetOperationModeInternal;
    writeVar.PointName = "";
    writeVar.Value = OperationMode.Recirculation;

    this.configService.WriteToServer(writeVar).subscribe(
      result => {
        this.setValue();
      }
    );
  }

  setValue(): void {
    //set system device index value

    let writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = this.getHPUID();
    writeVar.PointIndex = this.index;
    writeVar.PointName = "";
    writeVar.Value = this.deviceValue;

    this.configService.WriteToServer(writeVar).subscribe(
      result => {
        if (this.startRecirculation == true) {
          //console.log("START EXECUTION");
          let writeServerVar = new WriteToServerDataModel();
          writeServerVar.DeviceId = this.getHPUID();
          writeServerVar.PointIndex = HyrdraulicPowerUnitPointIndex.ExecuteOperationMode;
          writeServerVar.PointName = "";
          writeServerVar.Value = 1;
          this.configService.WriteToServer(writeServerVar).subscribe(
            result => {
            });
        }
        else {//make system idle
          let writeServerVar = new WriteToServerDataModel();
          writeServerVar.DeviceId = this.getHPUID();
          writeServerVar.PointIndex = HyrdraulicPowerUnitPointIndex.SetOperationModeInternal;
          writeServerVar.PointName = "";
          writeServerVar.Value = OperationMode.Idle;
          this.configService.WriteToServer(writeServerVar).subscribe(
            result => {
            });
        }
      }
    );
  }

  getCurrentOperationModePointValue(): number {
    this.getCommStatusPointValue();
    return this.getDeviceIndexValue(6);
  }

  getOperationExecutionInProgressPointValue(): number {
    return this.getDeviceIndexValue(7);
  }

  getRecirculationType(): number {
    return this.getDeviceIndexValue(10);
  }

  getCommStatusPointValue(): void {
    if (this.deviceIdIndexValue != null) {

      if (this.getDeviceIndexValue(12) == 0) {
        // this.router.navigate(["/Home"]);
      }
    }
  }

  fillDataArray() {
    this.volumeBasedData = [
      { label: 'Volume to Recirculate (tank volume)', value: this.getPlannedRecirculationVolumeInTanksPointValue().toString(), actions: true, DataPointIndex: this.getDeviceDataPointIndex(1), DeviceId: this.getHPUID() },
      { label: 'Reservoir Tank Volume (gal)', value: this.getReservoirTankVolumePointValue().toString(), actions: true, DataPointIndex: this.getDeviceDataPointIndex(2), DeviceId: this.getHPUID() },
      { label: 'Last Recirculation Time', value: this.getLastRecirculationOADatePointValue().toString(), actions: false, DataPointIndex: this.getDeviceDataPointIndex(3), DeviceId: this.getHPUID() },
      { label: 'Last Recirculation Volume (tank volume)', value: this.getLastRecirculationVolumeInTanksPointValue().toString(), actions: false, DataPointIndex: this.getDeviceDataPointIndex(4), DeviceId: this.getHPUID() },
      { label: 'Last Recirculation Duration (min)', value: this.getLastRecirculationTimePointValue().toString(), actions: false, DataPointIndex: this.getDeviceDataPointIndex(5), DeviceId: this.getHPUID() }
    ];
    this.timeBasedData = [
      { label: 'Time to Recirculate (min)', value: this.getPlannedRecirculationTimePointValue().toFixed(1).toString(), actions: true, DataPointIndex: this.getDeviceDataPointIndex(0), DeviceId: this.getHPUID() },
      { label: 'Reservoir Tank Volume (gal)', value: this.getReservoirTankVolumePointValue().toString(), actions: true, DataPointIndex: this.getDeviceDataPointIndex(2), DeviceId: this.getHPUID() },
      { label: 'Last Recirculation Time', value: this.getLastRecirculationOADatePointValue().toString(), actions: false, DataPointIndex: this.getDeviceDataPointIndex(3), DeviceId: this.getHPUID() },
      { label: 'Last Recirculation Volume (tank volume)', value: this.getLastRecirculationVolumeInTanksPointValue().toString(), actions: false, DataPointIndex: this.getDeviceDataPointIndex(4), DeviceId: this.getHPUID() },
      { label: 'Last Recirculation Duration (min)', value: this.getLastRecirculationTimePointValue().toString(), actions: false, DataPointIndex: this.getDeviceDataPointIndex(5), DeviceId: this.getHPUID() }
    ];
  }

  private startStopRecirculation(recirculate: boolean): Observable<any> {
    let writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = this.deviceIdTEMP;
    writeVar.PointIndex = HyrdraulicPowerUnitPointIndex.SetOperationModeInternal;
    writeVar.PointName = HyrdraulicPowerUnitPointIndex.SetOperationModeInternalName;
    writeVar.Value = recirculate ? OperationMode.Recirculation : OperationMode.Idle;
    writeVar.WriteToServerCommandEnum = 1;
    return this.configService.WriteToServer(writeVar);
  }

  onClickSettings(RecirculateColumns: RecirculateColumns) {
    this.startStopRecirculation(true).subscribe(() => {
      this.recirculationValidationMessage = null;
      let DataPointDef: DataPointDefinitionModel = this.getDeviceDatapoint(RecirculateColumns.DataPointIndex, RecirculateColumns.DeviceId)
      let data = _.cloneDeep(DataPointDef);
      data.UnitSymbol = data.DataPointIndex === HyrdraulicPowerUnitPointIndex.PlannedRecirculationVolumeInTanks ? " tank volume"
                        : data.DataPointIndex === HyrdraulicPowerUnitPointIndex.ReservoirTankVolume ? " gal"
                        : data.DataPointIndex === HyrdraulicPowerUnitPointIndex.PlannedRecirculationTimeInSeconds ? " min" : data.UnitSymbol;
      data.RawValue = parseFloat(RecirculateColumns.value);
     
      let description =  data.DataPointIndex === HyrdraulicPowerUnitPointIndex.PlannedRecirculationVolumeInTanks ? "Volume to Recirculate"
      : data.DataPointIndex === HyrdraulicPowerUnitPointIndex.ReservoirTankVolume ? "Reservoir Tank Volume"
      : data.DataPointIndex === HyrdraulicPowerUnitPointIndex.PlannedRecirculationTimeInSeconds ? "Time to Recirculate" : "";
      let serverData: SetServerComponentData = {
        fieldName: "Setpoint",
        precision: 1,
        device: data,
        min : 0.1,
        multiplicationFactor: (HyrdraulicPowerUnitPointIndex.PlannedRecirculationTimeInSeconds == data.DataPointIndex) ? 60: (HyrdraulicPowerUnitPointIndex.ReservoirTankVolume==data.DataPointIndex) ? 3.78541 : null
      };
   
      let dialogSetServerValue = this.gwModalService.openDialogInsideModal(
        description,
        ButtonActions.None,
        SetServerValueComponent,
        serverData, (res) => {
          this.startStopRecirculation(false).subscribe();
          this.fillDataArray();
          dialogSetServerValue.close();
        },
        '350px',
      );
    });
  }

  createDeviceIdAndIndexArray() {
    this.deviceIdIndexValue = [];
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.PlannedRecirculationTimeInSeconds, -999.0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.PlannedRecirculationVolumeInTanks, -999.0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.ReservoirTankVolume, -999.0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.LastRecirculationOADate, -999.0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.LastRecirculationVolumeInTanks, 0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.LastRecirculationTimeInSeconds, -999.0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.CurrentOperationMode, -999.0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.OperationExecutionInProgress, -999.0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.CurrentRecirculationTimeInSeconds, -999.0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.CurrentRecirculationVolumeInTanks, -999.0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.ToRecirculateTankByVolume, -1, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.OperationAbortingInProgress, -1, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.CommStatus, 1, ''));
  }
  
  getDeviceIndexValue(index: number): number {
    if (this.deviceIdIndexValue != null && this.deviceIdIndexValue[index] != null)
      return this.deviceIdIndexValue[index].value;
  }

  getDeviceDataPointIndex(index: number) {
    if (this.deviceIdIndexValue != null && this.deviceIdIndexValue[index] != null)
      return this.deviceIdIndexValue[index].pointIndex;
  }
  getRoundOffNumber(value: number): number {
    return Number(value.toFixed(1));
  }

  setdEfaultIds() {
    this.deviceIdTEMP = this.getHPUID();
  }

  private getHPUID(): number {
    if (this.inforceDevices && this.inforceDevices.length > 0) {
      let inforceDevice: InforceDeviceDataModel = this.inforceDevices.find(c => c.DeviceName == "HPU");
      return inforceDevice.DeviceId;
    }
    else
      return 2;//need to be removed,  from 1.3
  }

  getDeviceDatapoint(pointIndex: number, deviceId: number): DataPointDefinitionModel {
    let dtPointDef = new DataPointDefinitionModel();
    this.datapointdefinitions.forEach(item => {
      if (item.DataPointIndex == pointIndex && item.DeviceId == deviceId)
        dtPointDef = item;
    });
    return dtPointDef;
  }

  private subscribeToDeviceDataPoints() {
    if (this.devicePointSubscription == null) {
      this.devicePointSubscription = this.deviceDataPointsModels$.subscribe((state: IDeviceDataPoints) => {

        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DATAPOINTDEF());
          }
          else {
            this.datapointdefinitions = state.datapointdefinitions;
          }
        }
      });

    }
  }

  private subscribeToInforceDevices(): void {
    const subscription = this.InforceDeviceState$.subscribe(
      (state: IInforceDeviceState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(INFORCE_DEVICES_ACTIONS.INFORCEDEVICES_LOAD());
          } else {
            this.inforceDevices = state.inforcedevices;
          }
          if(this.inforceDevices){
            this.setdEfaultIds();
             //this.fillDataArray();
             this.createDeviceIdAndIndexArray();
             this.subScribeToRealTimeData();
             this.checkOperationMode();
          }
         
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  unsubscribeArrSubscriptions(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }

    this.arrSubscriptions = [];
  }

  subScribeToRealTimeData() {
    let deviceSubs = null;
    if (this.deviceIdIndexValue != undefined && this.deviceIdIndexValue != null) {
      this.deviceIdIndexValue.forEach(e => {
        deviceSubs = this.realTimeService.GetRealtimeData(e.deviceId, e.pointIndex).subscribe(d => {

          if (d != undefined && d != null) {  
            e.match(d);
            if (e.pointIndex == HyrdraulicPowerUnitPointIndex.PlannedRecirculationTimeInSeconds 
              || e.pointIndex == HyrdraulicPowerUnitPointIndex.PlannedRecirculationVolumeInTanks 
              || e.pointIndex == HyrdraulicPowerUnitPointIndex.ReservoirTankVolume
              ||e.pointIndex == HyrdraulicPowerUnitPointIndex.LastRecirculationOADate
              || e.pointIndex== HyrdraulicPowerUnitPointIndex.LastRecirculationVolumeInTanks
              || e.pointIndex == HyrdraulicPowerUnitPointIndex.LastRecirculationTimeInSeconds) {
              this.fillDataArray();
            }
          }
        });
        this.arrSubscriptions.push(deviceSubs);
      });
    }
  }

  getVolumeRecirculateProgress(): number {
    if (this.getOperationExecutionInProgressPointValue() == 0)
      return 0;
    else
      return ((this.getPlannedRecirculationVolumeInTanksPointValue() - this.getRemainingRecirculationVolumeInTanksPointValue()) / this.getPlannedRecirculationVolumeInTanksPointValue()) * 100;
  }

  getTimebasedRecirculateProgress(): number {
    if (this.getOperationExecutionInProgressPointValue() == 0)
      return 0;
    else
      return ((this.getPlannedRecirculationTimePointValue() - this.getRemainingRecirculationTimePointValue()) / this.getPlannedRecirculationTimePointValue()) * 100;
  }

  getRemainingRecirculationVolumeInTanksPointValue(): number {
    return this.getDeviceIndexValue(9);
  }
  getRemainingRecirculationTimePointValue(): number {
    return this.getDeviceIndexValue(8) / 60.0;
  }

  VolumeRemainingForRecirculation(): number {
    if (this.getRemainingRecirculationVolumeInTanksPointValue() != null)
      return this.getRemainingRecirculationVolumeInTanksPointValue();
  }

  TimeRemainingForRecirculation(): number {

    if (this.getDeviceIndexValue(8) != null)
      var value =this.getRoundOffNumber(this.getDeviceIndexValue(8)) ;
    return value;
  }

  disableStartButton(): boolean {
    let returnValue = true;
    if (this.getOperationExecutionInProgressPointValue() != ExecutionMode.ExecutionOn && this.getCurrentOperationModePointValue() == OperationMode.Idle) // && this.getfatalCriticalAlarmCount()==0
      returnValue = null;//enable
    return returnValue;
  }

  disableAbortButton(): boolean {
    let returnValue = true;
    if (this.getOperationExecutionInProgressPointValue() == ExecutionMode.ExecutionOn && this.getCurrentOperationModePointValue() == OperationMode.Recirculation)
      returnValue = null;//enable
    return returnValue;
  }
  onshowMaintenenceModeEvent(isValid: boolean) {
    this.showMaintenenceMode = isValid;
  }
  private checkOperationMode(): void {
    if (this.getOperationExecutionInProgressPointValue() == ExecutionMode.ExecutionOn && this.getCurrentOperationModePointValue() == OperationMode.Recirculation){
      let recirculationType = this.getRecirculationType();
      this.selectedRecirculateMethod = recirculationType == 1 ? this.RecirculateMethods[0] : this.RecirculateMethods[1];
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeArrSubscriptions();
  }

  ngOnInit(): void {
    this.subscribeToDeviceDataPoints();
    this.subscribeToInforceDevices();
  }
}
class RecirculateColumns {
  label:string;
  value: string;
  actions: boolean;
  DataPointIndex: number;
  DeviceId: number
}