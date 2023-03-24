import { OnInit, OnDestroy, Directive, Optional } from '@angular/core';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

import { GaugeTypeUIModel } from '@core/models/UIModels/models.model';
import { initialPanelConfigurationCommon, IPanelConfigurationCommonState } from '@store/state/panelConfigurationCommon.state';
import { ModbusProtocolModel } from '@core/models/UIModels/ModbusProtocol.model';
import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { DeviceModel } from '@core/models/webModels/DeviceInfo.model';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { ModbusMapTemplateUIModel } from '@core/models/UIModels/modbusTemplate.model';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';

import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { PointTemplatesExtension } from '@core/models/UIModels/PointTemplatesExtension.model';
import { PointTemplatesFacade } from '@core/facade/pointTemplatesFacade.service';
import { SurefloFacade } from '@core/facade/surefloFacade.service';
import { SureFLOFlowMeterUIModel } from '@core/models/UIModels/sureflo.model';
import { DataLoggerFacade } from '@core/facade/dataLoggerFacade.service';
import { CustomDataLoggerConfiguration } from '@core/models/webModels/DataLogger.model';
import { DataLoggerTypesDataModel } from '@core/models/UIModels/dataLoggerTypes.model';
import { SieFacade } from '@core/facade/sieFacade.service';
import { SieUIModel } from '@core/models/UIModels/sie.model';
import { DiagnosticsTestTypesDataModel } from '@core/models/UIModels/diagnosticsTestTypes.model';

export interface IGatewayPanelBase {
  initPanelConfigurationCommon(): void;
  postCallGetPanelConfigurationCommon(): void;
}

export interface IWellBase {
  initWells(): void;
  postCallGetWells(): void;
}

export interface ICommunicationBase {
  initToolTypes(): void;
  initDataSources(): void;
  postCallGetToolTypes(): void;
  postCallGetDataSources(): void;
  initToolConnections(): void;
  postCallGetToolConnections(): void;
}

export interface IPublishingBase {
  initModbusProtocols(): void;
  initModbusMapTemplateDetails(): void;
  initDataPublishing(): void;

  postCallGetModbusProtocols();
  postCallGetModbusTemplateDetails(): void;
  postCallGetDataPublishing(): void;
}

export interface IDeviceDataPointBase {
  initDeviceDataPoints(): void;
  postCallDeviceDataPoints(): void;
}

export interface IPointTemplatesExensionBase {
  initPointTemplates(deviceTypeId: number): void;
  postCallGetPointTemplates(): void;
}

export interface ISurefloBase {
  initFlowMeters(): void;
  postCallGetFlowMeters(): void;
}

export interface IGatewayValidate {
  validateOnInit(): void;
}

export class GatewayPanelBase implements OnInit, OnDestroy, IGatewayPanelBase, IWellBase, ICommunicationBase, IPublishingBase, IDeviceDataPointBase, IPointTemplatesExensionBase, ISurefloBase {
  // static common objects
  static ShowNavigation: boolean = false;
  static DefaultModbusMapdIds: number[] = [];

  // State objects
  panelConfigurationCommonState: IPanelConfigurationCommonState = initialPanelConfigurationCommon;
  toolTypesStore: GaugeTypeUIModel[] = [];
  modbusProtocols: ModbusProtocolModel[] = [];
  modbusTemplateDetails: ModbusMapTemplateUIModel[] = [];

  // Store Entity objects
  wellEnity: any[];
  dataSourcesEntity: DataSourceUIModel[];
  publishingEntity: PublishingDataUIModel[];
  toolConnectionEntity: ToolConnectionUIModel[] = [];
  devices: DeviceModel[] = [];
  datapointdefinitions: DataPointDefinitionModel[] = [];
  pointTemplatesEnity: PointTemplatesExtension[] = [];
  surefloEnity: SureFLOFlowMeterUIModel[] = [];
  dataLoggerEntity: CustomDataLoggerConfiguration[] = [];
  sieEntity: SieUIModel[] = [];
  loggerTypesEntity: DataLoggerTypesDataModel[] = [];
  diagonsticsTestTypesEntity: DiagnosticsTestTypesDataModel[] = [];

  

  // state subscriptions
  private arrPanelSubscriptions: Subscription[] = [];

  constructor(protected store: Store<any>,
    private panelConfigCommonFacade: PanelConfigurationFacade,
    private wellFacade: WellFacade,
    private dataSourcesFacade: DataSourceFacade,
    private publishingChannelFacade: PublishingChannelFacade,
    private deviceDataPointsFacade: DeviceDataPointsFacade,
    private pointTemplatesFacade: PointTemplatesFacade,
    private surefloFacade?: SurefloFacade,
    private dataLoggerFacade?: DataLoggerFacade,
    protected sieFacade?: SieFacade) {
  }

  // IGatewayPanelBase methods
  public initPanelConfigurationCommon() {
    // this.subscribeToPanelConfigurationCommon(); // initialize state here
    let subsciption = this.panelConfigCommonFacade.initPanelConfigurationCommon().subscribe(panelConfigState => {
      this.panelConfigurationCommonState = panelConfigState;
      this.postCallGetPanelConfigurationCommon();
    });
    this.arrPanelSubscriptions.push(subsciption);
  }

  public postCallGetPanelConfigurationCommon() {
  }

  // ICommunicationBase methods
  public initToolTypes() {
    // this.subscribeToToolTypes();  // initialize state here
    let subsciption = this.dataSourcesFacade.initToolTypes().subscribe(toolTypes => {
      this.toolTypesStore = toolTypes;
      this.postCallGetToolTypes();
    });
    this.arrPanelSubscriptions.push(subsciption);
  }

  public initDataSources() {
    // this.subscribeToCommunicationChannelEntityStore();  // initialize state here
    let subsciption = this.dataSourcesFacade?.initDataSources().subscribe(sources => {
      this.dataSourcesEntity = _.cloneDeep(sources);
      this.postCallGetDataSources();
    });
    this.arrPanelSubscriptions.push(subsciption);
  }

  public initToolConnections() {
    // this.subscribeToolConnections();  // initialize state here
    let subsciption = this.dataSourcesFacade.initToolConnections().subscribe(toolConnections => {
      this.toolConnectionEntity = _.cloneDeep(toolConnections);
      this.postCallGetToolConnections();
    });
    this.arrPanelSubscriptions.push(subsciption);
  }

  public initDataLoggers() {
    let subsciption = this.dataLoggerFacade.initDataLogger().subscribe(dataLoggers => {
      this.dataLoggerEntity = _.cloneDeep(dataLoggers);
      this.postCallGetDataLoggers();
    });
    this.arrPanelSubscriptions.push(subsciption);
  }

  public initSie() {
    let subsciption = this.sieFacade.initSie().subscribe(sie => {
      this.sieEntity = _.cloneDeep(sie);
      this.postCallGetSie();
    });
    this.arrPanelSubscriptions.push(subsciption);
  }
  
  
  public initLoggerTypes() {
    let subsciption = this.dataLoggerFacade.initLoggerTypes().subscribe(loggerTypes => {
      this.loggerTypesEntity = _.cloneDeep(loggerTypes);
      this.postCallGetLoggerTypes();
    });
    this.arrPanelSubscriptions.push(subsciption);
  }

    
  public initDiagnosticsTestTypes() {
    let subsciption = this.sieFacade.initDiagnosticsTestTypes().subscribe( diagonsticsTestTypes => {
      this.diagonsticsTestTypesEntity = _.cloneDeep(diagonsticsTestTypes);
      this.postCallGetDiagnosticsTestTypes();
    });
    this.arrPanelSubscriptions.push(subsciption);
  }

  postCallGetLoggerTypes() {
  }

  postCallGetDiagnosticsTestTypes() {
  }

  postCallGetDataLoggers() {
  }

  postCallGetSie() {
  }

  postCallGetToolTypes() {
  }

  public postCallGetDataSources() {
  }

  postCallGetToolConnections() {
  }

  // Initialize Well State
  public initWells() {
    // this.subscribeToWellEntityStore();
    let subsciption = this.wellFacade.initWells().subscribe(wells => {
      this.wellEnity = _.cloneDeep(wells);
      this.postCallGetWells();
    });
    this.arrPanelSubscriptions.push(subsciption);
  }

  postCallGetWells() { }

  // IPublishingBase methods
  public initModbusProtocols() {
    // this.subscribeToModbusProtocols();  // initialize state here
    let subsciption = this.publishingChannelFacade.initModbusProtocols().subscribe(protocols => {
      this.modbusProtocols = protocols;
      this.postCallGetModbusProtocols();
    });
    this.arrPanelSubscriptions.push(subsciption);
  }

  public initModbusMapTemplateDetails() {
    // this.subscribeToMapTemplateDetails(); // initialize state here
    let subsciption = this.publishingChannelFacade.initModbusMapTemplateDetails().subscribe(templates => {
      this.modbusTemplateDetails = templates;
      this.postCallGetModbusTemplateDetails();
    });
    this.arrPanelSubscriptions.push(subsciption);
  }

  public initDataPublishing() {
    // this.subscribeToPublishingEntityStore();  // initialize state here
    let subsciption = this.publishingChannelFacade?.initDataPublishing().subscribe(publishings => {
      this.publishingEntity = publishings;
      this.postCallGetDataPublishing();
    });
    this.arrPanelSubscriptions.push(subsciption);
  }

  postCallGetModbusProtocols() {
  }

  postCallGetModbusTemplateDetails() {
  }

  postCallGetDataPublishing() {
  }

  // IDeviceDataPointBase methods
  public initDeviceDataPoints() {
    // this.subscribeToDeviceDataPoints();  // initialize state here
    let subsciption = this.deviceDataPointsFacade.initDeviceDataPoints().subscribe(deviceDataPoints => {
      if (deviceDataPoints.devices) {
        this.devices = deviceDataPoints.devices;
      }
      if (deviceDataPoints.dataPoints) {
        this.datapointdefinitions = deviceDataPoints.dataPoints;
      }
      this.postCallDeviceDataPoints();
    });
    this.arrPanelSubscriptions.push(subsciption);
  }

  public postCallDeviceDataPoints() {
  }

  // methods
  public initPointTemplates(deviceTypeId: number) {
    let subsciption = this.pointTemplatesFacade.initPointTemplates(deviceTypeId).subscribe(pointTemplates => {
      this.pointTemplatesEnity = pointTemplates;
      this.postCallGetPointTemplates();
    });
    this.arrPanelSubscriptions.push(subsciption);
  }

  public initShiftPointTemplates() {
    let subsciption = this.pointTemplatesFacade.initShiftPointTemplates().subscribe(pointTemplates => {
      this.pointTemplatesEnity = pointTemplates;
      this.postCallGetPointTemplates();
    });
    this.arrPanelSubscriptions.push(subsciption);
  }

  postCallGetPointTemplates() {
  }

  public initFlowMeters() {
    let subsciption = this.surefloFacade.initFlowMeters().subscribe(flowMeters => {
      this.surefloEnity = flowMeters;
      this.postCallGetFlowMeters();
    });
    this.arrPanelSubscriptions.push(subsciption);
  }

  postCallGetFlowMeters() { }

  // unsubscribe all subscriptions here
  private unSubscribePanelSubscriptions(): void {
    if (this.arrPanelSubscriptions != null && this.arrPanelSubscriptions.length > 0) {
      this.arrPanelSubscriptions.forEach(subscription => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }
    this.arrPanelSubscriptions = [];
  }

  unsubscribeFacadeSubscriptions(): void {
    this.unSubscribePanelSubscriptions();
    this.panelConfigCommonFacade?.unSubscribePanelConfigSubscription();
    this.wellFacade?.unSubscribeWellSubscription();
    this.dataSourcesFacade?.unSubscribeDataSourceSubscription();
    this.publishingChannelFacade?.unSubscribePublishingSubscription();
    this.deviceDataPointsFacade?.unSubscribeDeviceSubscription();
    this.surefloFacade?.unSubscribeSurefloSubscription();
    this.dataLoggerFacade?.unSubscribeDataLoggerSubscription();
    this.sieFacade?.unSubscribeSieSubscription();
  }

  // Lifecycle methods
  ngOnDestroy(): void {
    this.unSubscribePanelSubscriptions();
  }

  ngOnInit(): void {
  }
}
