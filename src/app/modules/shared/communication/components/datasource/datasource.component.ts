import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { String } from 'typescript-string-operations';
import * as _ from 'lodash';

import { ActivatedRoute, Router } from '@angular/router';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { InterfaceCardDataUIModel } from '@core/models/webModels/InterfaceCardDataUIModell.model';
import { ValidationService } from '@core/services/validation.service';
import { Store } from '@ngrx/store';
import { GatewayPanelBase, ICommunicationBase } from '@comp/GatewayPanelBase.component';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';

// Custom Pipes Module
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { ChannelErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { CommunicationChannelType, deleteUIModal, PanelTypeList, UICommon } from '@core/data/UICommon';
import { UtilityService } from '@core/services/utility.service';
import { SurefloService } from '@core/services/sureflo.service';
import { ConfigurationService } from '@core/services/configurationService.service';
import { SurefloFacade } from '@core/facade/surefloFacade.service';
import { SureFLOFlowMeterUIModel } from '@core/models/UIModels/sureflo.model';
import { FlowMeterTypes } from '@core/models/webModels/SureFLODataModel.model';
import { SureFLO298UIFlowMeterUIModel } from '@core/models/UIModels/sureflo-flowmeter-model';
import { SureFLO298ExUIFlowMeterUIModel } from '@core/models/UIModels/sureflo-ex-flowmeter-model';

@Component({
  selector: 'app-datasource',
  templateUrl: './datasource.component.html',
  styleUrls: ['./datasource.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatasourceComponent extends GatewayPanelBase implements OnInit, OnDestroy, ICommunicationBase {

  dataSource: DataSourceUIModel;
  dataSourceToUpdate: any;

  panelTypeId: number;
  panelName: string;
  channelId: number;
  channelName: string = 'New Source';
  isLeavingWorkflow: boolean = true;
  isFormValid: boolean = false;
  hasChannelChanged: boolean = false;
  hasCardsChanged = false;
  bIsUnloading: boolean = false;
  bShowBackButton: boolean = true;
  bShowDeleteButton: boolean = true;
  bDisableDelete: boolean = true;
  selectedTabIndex = 0;
  newCard: InterfaceCardDataUIModel;
  btnNextText: string = "Create Source";
  tablblAddCard: string = "+ Add Card";
  hasChannelErrors = false;
  isSureSENSPanel = false;
  hasCardsLimitReached = false;

  private currentSourceIndex: number;
  private nextChannelId: number;
  private prevChannelId: number;
  private prevChannelCardCount: number;
  private arrSubscriptions: Subscription[] = [];

  constructor(protected store: Store,
    private panelConfigFacade: PanelConfigurationFacade,
    private dataSourceFacade: DataSourceFacade,
    private surefloDataFacade: SurefloFacade,
    private validationService: ValidationService,
    private gwModalService: GatewayModalService,
    private utilityService: UtilityService,
    private surefloService: SurefloService,
    private configurationService: ConfigurationService,
    private router: Router,
    protected route: ActivatedRoute) {
    super(store, panelConfigFacade, null, dataSourceFacade, null, null, null, surefloDataFacade);
  }

  hasCardsChangedEvent(hasChanged: boolean) {
    this.hasCardsChanged = hasChanged;
    this.dataSource.IsDirty = hasChanged || this.hasCardsChanged;

    // GATE - 1774
    this.setUpDeleteButton();
  }

  cardFormInvalidEvent(data) {
    if (this.dataSource.cardError === null || this.dataSource.cardError.length == 0) {
      this.dataSource.cardError = data.errors;
    } else {
      const cardErrorIdx = this.dataSource.cardError.findIndex(error => error.deviceId === data.deviceId);
      if (cardErrorIdx !== -1) {
        if (data.errors !== null) {
          this.dataSource.cardError[cardErrorIdx] = data.errors[0];
        } else {
          this.dataSource.cardError.splice(cardErrorIdx, 1);
        }
      } else {
        if (data.errors) {
          console.log(data.errors);
          this.dataSource.cardError.push(data.errors[0]);
          // data.errors.forEach(error => {
          //   this.dataSource.cardError.push(error);
          // });
        }
      }
    }
    // console.log(this.dataSource.cardError);
  }

  onTabChanged(event): void {

    if (event.tab.textLabel === this.tablblAddCard) {
      this.updateNewCard();
    } else {
      this.newCard = null;
      if (this.dataSource != null)
        this.SaveDataSource();
    }
    this.setUpActionButtons(event.tab.textLabel);
  }

  isFormValidEvent(isFormValid: boolean) {
    this.isFormValid = isFormValid;
  }

  channelFormInvalidEvent(error: ChannelErrorNotifierModel[]) {
    this.hasChannelErrors = error?.length > 0;
    this.dataSource.channelError = error;
  }

  haschannelChangedEvent(hasChanged: boolean) {
    this.hasChannelChanged = hasChanged;
    this.dataSource.IsDirty = hasChanged || this.hasCardsChanged;
  }

  private setUpActionButtons(tabName: string = null) {
    this.btnNextText = isNaN(this.channelId) ? "Create Source" : "Next";
    this.bShowDeleteButton = isNaN(this.channelId) ? false : true;
    if (tabName != null && this.selectedTabIndex !== 0) {
      if (tabName === this.tablblAddCard) {
        this.btnNextText = "Create Card";
        this.bShowDeleteButton = false;
      } else {
        this.btnNextText = isNaN(this.nextChannelId) && (this.dataSource?.Cards?.length === this.selectedTabIndex) ? "Done" : "Next";
      }
    }

    // GATE - 1774
    this.setUpDeleteButton();

    // GATE - 1774 commented out - Starts
    //if (this.selectedTabIndex == 0) {
    //  this.bDisableDelete = this.dataSource?.Cards?.length > 0 ? true : false;
    //}
    //else {
    //  this.bDisableDelete = false;
    //}

    // GATE - 1513 Card validation for FlowMeters
    //if(this.surefloEnity.length > 0 && this.dataSource?.Cards?.length > 0 && this.selectedTabIndex > 0) {
    //  const totalFlowmeterCount = this.getFlowmetersCount();
    //  this.bDisableDelete =  totalFlowmeterCount > 0 ? true : false;
    //}
    // GATE - 1774 commented out - Ends
  }

  // GATE - 1774 Starts
  // Check if any tools associated to the selected card
  private isToolsAssociatedCard() {
    const cardIdx = this.selectedTabIndex <= this.dataSource?.Cards?.length ? this.selectedTabIndex - 1 : -1;
    if (cardIdx !== -1) {
      const card = this.dataSource?.Cards[cardIdx];
      if (card && card.Gauges.length > 0) {
        return true;
      }
    }
    return false;
  }

  // set up Delete button status
  private setUpDeleteButton() {
    if (this.selectedTabIndex == 0) {
      this.bDisableDelete = this.dataSource?.Cards?.length > 0 ? true : false;
    }
    else {
      this.bDisableDelete = false;
    }
    if (this.dataSource && this.dataSource.Cards?.length > 0 && this.dataSource.Channel?.channelType !== CommunicationChannelType.SERIAL) {
      this.hasCardsLimitReached = true;
    }
    // If any tools associated to the selected card, then Delete button would be disabled.
    if (this.dataSource?.Cards?.length > 0 && this.selectedTabIndex > 0) {
      this.bDisableDelete = this.isToolsAssociatedCard();
    }
  }
  // GATE - 1774 Ends

  // GATE - 1513 Card validation for FlowMeters
  getFlowmetersCount() {
    let count = 0;
    const cardIdx = this.selectedTabIndex <= this.dataSource?.Cards?.length ? this.selectedTabIndex - 1 : -1;
    if (cardIdx !== -1) {
      const card = this.dataSource?.Cards[cardIdx];
      if (card && card.Gauges.length > 0) {
        card.Gauges.forEach((gauge) => {
          count = this.validateToolWithFlowMeters(gauge.DeviceId) ? count + 1 : count;
        });
      }
    }
    return count;
  }


  // GATE - 1513 Card validation for FlowMeters
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

  updateNewCard() {
    let deviceId = this.dataSource.Cards.length + 1;
    let cardAddress = this.dataSource.Cards.length + 1;
    if (this.dataSource.Cards && this.dataSource.Cards.length > 0) {
      let cards = _.cloneDeep(this.dataSource.Cards);
      cards.sort((c1, c2) => c1.CardAddress - c2.CardAddress);
      cardAddress = cards[cards.length - 1].CardAddress + 1;
    }
    let cardName = String.Format("Card {0}", cardAddress);

    this.newCard = {
      DeviceId: UICommon.IsImportConfig ? UICommon.getImportNextDeviceId() : -deviceId,
      Active: true,
      CardAddress: cardAddress,
      CommConfigId: this.dataSource.Channel.IdCommConfig,
      Gauges: [],
      CardType: this.dataSource.Channel.channelType === CommunicationChannelType.SERIAL ? 0 : 2,  // 0 - StarInterfaceCard, 2 - IWISInterfaceCard
      Description: cardName,
      SupportInChargePowerSupplyModule: this.dataSourceFacade.IsSupportInChargePowerSupplyModule(this.panelTypeId),
      EnableDownlink: true,
      currentCardName: cardName
    };
  }

  private validateDataSourcesOnDestroy(): void {
    this.dataSourcesEntity.forEach(dataSource => {
      let ds = Object.assign({}, dataSource);
      ds.IsValid = true;
      let errMssg = this.dataSourceFacade.validateDataSource(ds);
      if (errMssg != null)
        ds.IsValid = false;
      this.dataSourceFacade.saveDataSource(ds);
    });
  }

  haschannelUpdatedEvent(channel: any) {
    this.dataSourceToUpdate = this.dataSource;
    this.dataSourceToUpdate.Channel = channel;
    if (this.dataSourceToUpdate && this.dataSourceToUpdate.Channel.channelType === CommunicationChannelType.SERIAL) {
      this.dataSourceToUpdate.Channel.ComPort = parseInt(this.dataSourceToUpdate.Channel.ComPort, 10);
      this.dataSourceToUpdate.Channel.BaudRate = parseInt(this.dataSourceToUpdate.Channel.BaudRate, 10);
      this.dataSourceToUpdate.Channel.TimeoutInMs = this.dataSourceToUpdate.Channel.TimeoutInMs ?? 0;
      this.dataSourceToUpdate.Channel.Retries = this.dataSourceToUpdate.Channel.Retries ?? 0;
    }
    this.dataSource.Channel = this.dataSourceToUpdate.Channel;
    if (this.dataSource) { this.dataSource.IsDirty = this.dataSource.IsDirty || this.hasChannelChanged; }
  }

  private SaveDataSource() {
    let dataSourceValue = Object.assign({}, this.dataSource);
    dataSourceValue.IsValid = true;
    let errMssg = this.dataSourceFacade.validateDataSource(dataSourceValue);
    if (errMssg != null) {
      dataSourceValue.IsValid = false;
    }
    this.channelId = (dataSourceValue.Channel as SerialPortCommunicationChannelDataUIModel).IdCommConfig;
    this.dataSourceFacade.saveDataSource(dataSourceValue);
  }

  private deleteToolConnections(cardId: number) {
    let toolConnections = this.toolConnectionEntity.filter(t => t.CardDeviceId == cardId) ?? [];
    if (toolConnections.length > 0) {
      toolConnections.forEach(toolConn => {
        this.dataSourceFacade.deleteToolConnection(toolConn.Id, toolConn.DeviceId);
      });
    }
  }

  private DeleteCard(): void {
    let cardIndex = this.selectedTabIndex - 1;
    let cardId = this.dataSource.Cards[cardIndex].DeviceId;

    this.gwModalService.openDialog(
      `Do you want to delete card  '${this.dataSource.Cards[cardIndex].Description}'?`,
      () => {
        this.gwModalService.closeModal();
        this.deleteToolConnections(cardId);
        this.dataSourceFacade.deleteCard(this.dataSource.Channel.IdCommConfig, cardId, String.Format("{0} - {1}", this.channelName, this.dataSource.Cards[cardIndex].Description));
        this.selectedTabIndex -= 1;
        // GATE - 1238 Datasource Error Notofication
        const cardErrorIdx = this.dataSource.cardError.findIndex(e => e.deviceId === cardId);
        if (cardErrorIdx !== -1) this.dataSource.cardError.splice(cardErrorIdx, 1);
      },
      () => this.gwModalService.closeModal(),
      deleteUIModal.title,
      null,
      true,
      deleteUIModal.primaryBtnText,
      deleteUIModal.secondaryBtnText
    );
  }

  private DeleteDataSource(): void {
    this.gwModalService.openDialog(
      `Do you want to delete the channel '${this.dataSource.Channel.Description}'?`,
      () => {
        this.gwModalService.closeModal();
        this.dataSourceFacade.deleteDataSource(this.channelId, this.dataSource.Channel.IdCommConfig, this.dataSource.Channel.Description);
        this.navigateOnDelete();
      },
      () => this.gwModalService.closeModal(),
      deleteUIModal.title,
      null,
      true,
      deleteUIModal.primaryBtnText,
      deleteUIModal.secondaryBtnText
    );
  }

  private navigateOnDelete(): void {
    if (isNaN(this.nextChannelId) && isNaN(this.prevChannelId)) {
      this.setNavigation();
    }
    else if (!isNaN(this.nextChannelId)) {
      this.router.navigate([String.Format("{0}/datasource", this.panelName), this.nextChannelId]);
    }
    else {
      this.router.navigate([String.Format("{0}/datasource", this.panelName), this.prevChannelId]);
    }
  }

  onNextOrDoneClick(): void {
    this.isLeavingWorkflow = false;
    if (this.dataSource != null) {
      // this.utilityService.getSurefloData().pipe(first()).subscribe((data) => {
      //   if(data && data.length > 0) {
      //     this.surefloService.saveFlowMeter(data).subscribe((res) => {
      //         this.gwModalService.openDialog(
      //           `Flowmeter data saved successfully.`,
      //           () => { 
      //             this.gwModalService.closeModal();
      //             this.configurationService.restartAcquisitionProcess().subscribe();
      //           },
      //           () => this.gwModalService.closeModal(),
      //         );

      //     });
      //   }
      // })
      this.SaveDataSource();
      if (this.dataSource.Channel.IdCommConfig < 0) // New DataSource
        this.router.navigated = false;

      if (this.selectedTabIndex !== 0 && this.selectedTabIndex == this.dataSource.Cards.length) {
        if (isNaN(this.nextChannelId))
          this.router.navigate([String.Format("{0}/dashboard", this.panelName)]);
        else
          this.router.navigate([String.Format("{0}/datasource", this.panelName), this.nextChannelId]); //, { queryParams: { selectedId: this.nextChannelId } }
      }
      else
        this.selectedTabIndex += 1;
    }
  }

  onCreateCard(): void {
    if (this.newCard !== undefined && this.newCard != null) {
      this.selectedTabIndex = 0;
      this.dataSource.Cards.push(this.newCard);
      this.SaveDataSource();
      setTimeout(() => {
        this.selectedTabIndex = this.dataSource.Cards.length;
      }, 0);
    }
    else {
      this.selectedTabIndex += 1;
    }
  }


  onDeleteBtnClicked(): void {
    if (this.selectedTabIndex === 0) {
      this.DeleteDataSource();   // Delete Data Source
    }
    else {
      this.DeleteCard();  // Delete a Card
    }
  }

  onBackBtnClick(): void {

    if (this.selectedTabIndex > 0)
      this.selectedTabIndex -= 1;
    else {
      if (!isNaN(this.prevChannelId)) {
       // this.router.navigate([String.Format("{0}/datasource", this.panelName)], { queryParams: { selectedId: this.prevChannelId, selectedChild: this.prevChannelCardCount } });
        this.router.navigate([String.Format("{0}/datasource", this.panelName), this.prevChannelId]);
      } else {
        this.isLeavingWorkflow = false;
        this.router.navigate([`${this.panelName}/well/-1`]);
      }
    }
  }

  getQueryParameters() {
    this.route.queryParams.subscribe(params => {
      if (params['selectedId']) {
        this.channelId = parseInt(params['selectedId']);
        this.selectedTabIndex = params['selectedChild'] ? parseInt(params['selectedChild']) : 0;
        this.initDataSources();
      }
      else {
        this.getParameter();
      }
    });
  }

  getParameter(): void {
    this.route.params.subscribe(params => {
      this.channelId = parseInt(params['Id']);
      this.selectedTabIndex = params['selectedChild'] ? parseInt(params['selectedChild']) : 0;
      this.initDataSources();
    });
  }

  postCallGetPanelConfigurationCommon(): void {
    this.panelTypeId = this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId;
    this.isSureSENSPanel = this.panelTypeId === PanelTypeList.SURESENS;
    this.panelName = UICommon.getPanelType(this.panelTypeId, true).name;
    this.getQueryParameters();
  }

  // ICommunicationChannelBase methods
  postCallGetToolTypes(): void {
  }

  postCallGetDataSources(): void {
    if (this.bIsUnloading)
      return;

    this.currentSourceIndex = -1;
    if (isNaN(this.channelId)) {

      if (!GatewayPanelBase.ShowNavigation && this.dataSourcesEntity.length === 1) {
        this.channelId = this.dataSourcesEntity[0].Channel.IdCommConfig;
        this.setCurrentDataSource();
      } else {
        this.dataSource = this.dataSourceFacade.getNewDataSource(this.dataSourcesEntity.length + 1, 0, 1);
      }
      if (this.dataSource.Channel.Description !== '') {
        this.channelName = this.dataSourceFacade.getDataSourceName(this.dataSource.Channel);
      }
      this.bShowBackButton = !GatewayPanelBase.ShowNavigation;
    }
    else {
      if (this.dataSourcesEntity && this.dataSourcesEntity.length > 0) {
        this.setCurrentDataSource();
      }
      // else {
      //   this.router.navigate(['incharge/dashboard']); // Refresh initiated when valid configuration is not saved. 
      // }
    }
    this.setUpActionButtons();
    //this.selectedTabIndex = 0;
  }

  setCurrentDataSource() {
    this.dataSource = new DataSourceUIModel();
    this.currentSourceIndex = this.dataSourcesEntity.findIndex(x => (x.Channel as SerialPortCommunicationChannelDataUIModel).IdCommConfig == this.channelId);

    if (this.currentSourceIndex == -1) {  // Data Source does not exist - Navigate to Add Source page
      this.router.navigate([String.Format("{0}/datasource", this.panelName)]);
      return;
    }

    this.dataSource = this.dataSourcesEntity[this.currentSourceIndex];
    this.dataSource.channelError = this.dataSource.channelError ?? [];
    this.dataSource.cardError = this.dataSource.cardError ?? [];
    if (this.dataSource.Channel.Description !== '') {
      this.channelName = this.dataSourceFacade.getDataSourceName(this.dataSource.Channel);
    }
    this.nextChannelId = this.currentSourceIndex + 1 < this.dataSourcesEntity.length ? (this.dataSourcesEntity[this.currentSourceIndex + 1].Channel as SerialPortCommunicationChannelDataUIModel).IdCommConfig : NaN;
    this.prevChannelId = this.currentSourceIndex > 0 ? (this.dataSourcesEntity[this.currentSourceIndex - 1].Channel as SerialPortCommunicationChannelDataUIModel).IdCommConfig : NaN;
    this.prevChannelCardCount = this.currentSourceIndex > 0 ? this.dataSourcesEntity[this.currentSourceIndex - 1].Cards?.length : 0;
    this.bShowBackButton = !isNaN(this.prevChannelId) || !GatewayPanelBase.ShowNavigation;
  }

  setNavigation() {
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([String.Format("{0}/datasource", this.panelName)]);
    this.isLeavingWorkflow = GatewayPanelBase.ShowNavigation ? true : false;
    if (this.dataSourcesEntity.length === 0 && !this.isLeavingWorkflow) {
      this.utilityService.setForwardStepper(1);
    }
  }

  postCallGetToolConnections(): void {
  }

  ngOnDestroy(): void {
   
    if (this.isLeavingWorkflow) {
      GatewayPanelBase.ShowNavigation = true;
    }

    console.log("this.isLeavingWorkflow datasource",this.isLeavingWorkflow, GatewayPanelBase.ShowNavigation)

    this.bIsUnloading = true;
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }

    this.arrSubscriptions = [];
    this.validationService.clearError();
    if (this.currentSourceIndex != -1) {
      this.SaveDataSource();  // Save on leave
      this.validateDataSourcesOnDestroy();
    }
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initPanelConfigurationCommon();
    this.initToolTypes();
    this.initToolConnections();
    this.initFlowMeters();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }
}
