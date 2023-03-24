import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SerialChannelProperty } from '@core/models/UIModels/SerialChannel.model';
import { Store } from '@ngrx/store';
import { StateUtilities } from '@store/state/IState';
import { ISerialChannelPropertiesState } from '@store/state/serialChannelProperties.state';
import { Observable, Subscription } from 'rxjs';

import { PANELCONFIG_COMMON_LOAD } from '@store/actions/panelConfigurationCommon.action';
import { SERIALCHANNELPROPERTIES_LOAD } from '@store/actions/serialChannelProperties.action';

import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { WriteToServerDataModel } from '@core/models/webModels/WriteToServerData.model';
import { ConfigurationService } from '@core/services/configurationService.service';
import { IPanelConfigurationCommonState } from '@store/state/panelConfigurationCommon.state';
import { PanelTypeList, UICommon } from '@core/data/UICommon';
import { Router } from '@angular/router';
import { GatewayPanelConfigurationService } from '@core/services/gateway-panel-configuration.service';

@Component({
  selector: 'app-setbaudrate',
  templateUrl: './setbaudrate.component.html',
  styleUrls: ['./setbaudrate.component.scss']
})
export class SetBaudrateComponent implements OnInit, OnDestroy {

  panelTypeId: number;
  deviceDataPoint: DataPointDefinitionModel;
  newValue: number = 19200;
  newValueFormControl: FormControl;

  private panelConfigurationCommon$: Observable<IPanelConfigurationCommonState>;
  private serialCannelProperties$: Observable<ISerialChannelPropertiesState>;
  public serialChannelProperty: SerialChannelProperty;
  
  private arrSubscriptions: Subscription[] = [];
  
  constructor(private store: Store,
    private router: Router,
    public dialogRef: MatDialogRef<SetBaudrateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SetBaudRateComponentData,
    private configurationService: ConfigurationService,
    private gatewayPanelConfigurationService: GatewayPanelConfigurationService) { 
      this.panelConfigurationCommon$ = this.store.select<any>((state: any) => state.panelConfigCommonState);
      this.serialCannelProperties$ = this.store.select<any>((state: any) => state.serialChannelPropertiesState);
    }

  modelValue(value: number): string {
    return value.toString();
  }

  onChange(event) {
    this.newValue = parseInt(event.value);
  }

  private navToMonitorPage() {
    const panelInfo = UICommon.getPanelType(this.panelTypeId);
    this.router.navigate([`${panelInfo.name}/monitoring`]);
  }

  public WriteDataPoint(): void {
    const writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = this.deviceDataPoint.DeviceId;
    writeVar.PointIndex = this.deviceDataPoint.DataPointIndex;
    writeVar.PointName = this.deviceDataPoint.TagName;
    writeVar.Value = this.newValue;
    writeVar.WriteToServerCommandEnum = 1;
    writeVar.Unit = this.deviceDataPoint.UnitSymbol;
    this.configurationService.WriteToServer(writeVar).subscribe((d) => {
      UICommon.deletedObjects = [];
      this.gatewayPanelConfigurationService.ResetStateConfiguration();
      this.navToMonitorPage();
    });
  }
    
  OnCancel(): void {
    this.dialogRef.close();
  }
  
  OnOk() {
    this.WriteDataPoint();
    this.dialogRef.close();
  }

  private subscribeToPanelConfigurationCommon(): void {
    let subscription = this.panelConfigurationCommon$.subscribe(
      (state: IPanelConfigurationCommonState) => {
              if (state !== undefined) {
                  if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
                      this.store.dispatch(PANELCONFIG_COMMON_LOAD());  // Dispatch Action if not loaded
                  } else {
                    this.panelTypeId = state.panelConfigurationCommon.PanelTypeId;
                  }
              }
          }
      );
  }

  private subscribeSerialSettings() {
    let subscription = this.serialCannelProperties$.subscribe((state: ISerialChannelPropertiesState) => {
      if (state !== undefined && state != null) {
        if (state.isLoaded === false && !StateUtilities.hasErrors(state))   // Dispatch Action if not loaded
          this.store.dispatch(SERIALCHANNELPROPERTIES_LOAD());
        else
          this.serialChannelProperty = state.serialChannelProperties;
      }
    });

    this.arrSubscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
          subscription = null;
      });
    }
    this.arrSubscriptions = [];
  }

  ngOnInit(): void {
    this.subscribeToPanelConfigurationCommon();
    this.subscribeSerialSettings();
    this.newValueFormControl = new FormControl('', [Validators.required]);
    this.deviceDataPoint = this.data.device;
    this.newValue = this.deviceDataPoint.RawValue;
  }

}

export class SetBaudRateComponentData {
  device: DataPointDefinitionModel;
}
