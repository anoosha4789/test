import { Component, OnInit, ViewChild, ViewEncapsulation, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { InchargeZoneUIModel } from '@core/models/UIModels/incharge.zone.model';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { SureSENSGaugeDataUIModel } from '@core/models/webModels/SureSENSGaugeDataUIModel.model';
import { InchargeValveCoefficientDataModel } from '@core/models/webModels/InchargeValveCoefficient.model';

import { Store } from '@ngrx/store';
import { WellFacade } from '@core/facade/wellFacade.service';

@Component({
  selector: 'app-zone-details',
  templateUrl: './zone-details.component.html',
  styleUrls: ['./zone-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ZoneDetailsComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  @Input()
  zone: InchargeZoneUIModel;

  tools: any;
  ValveSize: string;
  zoneForm: FormGroup ;
  selectedTabIndex = 0;
  gaugeId: number;
  dataSources: DataSourceUIModel[];
  toolConnectionList: ToolConnectionUIModel[];
  toolConnection: ToolConnectionUIModel;
  gaugeDetails: any;
  gaugeList = []
  portingList = [];
  isInchargeTool: boolean;
  isSuresensOnlyTool: boolean;
  isInchargeWithSuresensTool: boolean;

  constructor(protected store: Store,
    private wellDataFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private fb: FormBuilder) {
    super(store, null, wellDataFacade, dataSourceFacade, null, null, null);
   }

  onTabChange(event) {
    // console.log('tab changed' + event);
  }

  postCallGetToolConnections(): void {
    this.toolConnectionList = this.toolConnectionEntity;
    if(this.toolConnectionList && this.toolConnectionList.length > 0) {
      this.loadToolConnection();
    }
  }

  postCallGetDataSources(): void {
    this.dataSources = this.dataSourcesEntity;
  }

  loadToolConnection() {
    this.gaugeList = this.toolConnectionList.filter(tc => tc.ZoneId === this.zone.ZoneId);
    this.gaugeList.forEach(gauge => {
      this.getZoneDetails(gauge);
    });
    // if (gaugeIndex != -1) {
    //   this.gaugeId = this.toolConnectionEntity[gaugeIndex].DeviceId;
    //   this.getZoneDetails(this.gaugeId);
    // }
  }

  getZoneDetails(gauge) {
    // Get Suresnes Tools
    if(gauge.PortingId !== -1) {
      this.portingList.push(gauge);
    }
    this.dataSourceFacade.dataSourcesEntity?.forEach(ds => {
      ds.Cards.forEach(card => {
        card.Gauges.forEach(gauge => {
          if(gauge.DeviceId === gauge.DeviceId) {
            this.getCoefficeintFileData(gauge);
          }
        })
      });
    });
    
    const suresensGaugeList = this.gaugeList.filter(g => g.PortingId !== -1);
    if(this.gaugeList.length === suresensGaugeList.length) {
      this.isInchargeTool = false;
      this.isSuresensOnlyTool = true;
    }
  }

  getCoefficeintFileData(gauge) {
    
    if (gauge.InCHARGECoefficientFileContent) {
      this.gaugeDetails = (gauge.InCHARGECoefficientFileContent) as InchargeValveCoefficientDataModel;
      this.isInchargeTool = true;
    } else if(gauge.PressureCoefficientFileContent && gauge.PortingId !== -1) {
      this.portingList.sort(g => g.Porting);
      // this.isSuresensTool = true;
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    if(this.zone) {
      this.initToolConnections();
      this.initDataSources();
    }
  }

}
