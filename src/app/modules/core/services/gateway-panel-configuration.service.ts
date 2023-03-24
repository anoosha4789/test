import { Injectable } from '@angular/core';

import { IPanelConfigurationCommonState } from '@store/state/panelConfigurationCommon.state';
import { Store } from '@ngrx/store';
import { StateUtilities } from '@store/state/IState';
import { EMPTY, forkJoin, Observable, of, Subscription } from 'rxjs';

import * as PANELCONFIG_COMMON_ACTIONS from '@store/actions/panelConfigurationCommon.action';
import * as ERROR_HANDLING_SETTINGS_STATE_ACTIONS from '@store/actions/errorHandlingSettings.action';
import * as USER_ACCOUNT_ACTIONS from '@store/actions/users.action';
import * as UNIT_SYSTEM_ACTIONS from '@store/actions/unit-system.action';
import * as WELL_ACTIONS from '@store/actions/well.entity.action';
import * as DATA_SOURCES_ACTIONS from '@store/actions/dataSources.entity.action';
import * as TOOL_CONNECTIONS_ACTIONS from '@store/actions/tool-connection.entity.action';
import * as PUBLISHING_ACTIONS from '@store/actions/publishing.entity.action';
import * as DEVICEPOINTS_ACTIONS from '@store/actions/deviceDataPoints.action';
import * as MODBUSTEMPLATE_ACTIONS from '@store/actions/mapTemplateDetails.action';
import * as SUREFLO_ACTIONS from '@store/actions/sureflo.entity.action';
import * as SHIFT_DEFAULT_ACTIONS from '@store/actions/shift-default.action';
import * as INFORCE_DEVICES_ACTIONS from '@store/actions/inforcedevices.action';
import * as PANEL_DEFAULT_ACTIONS from '@store/actions/panel-default.action';
import * as ALARM_ACTIONS from '@store/actions/alarms.action';
import * as ALARMS_AND_LIMITS_ACTIONS from '@store/actions/alarms-and-limits.action';
import * as DATA_LOGGER_ACTIONS from '@store/actions/dataLogger.entity.action';
import * as LOGGER_TYPE_ACTIONS from '@store/actions/dataLoggerTypes.action';
import * as DIAGONSTICS_TEST_TYPE_ACTIONS from '@store/actions/diagnosticsTestTypes.action';
import * as SIE_ACTIONS from '@store/actions/sie.entity.action';
import * as eFCV_POSITION_SETTINGS_STATE_ACTIONS from '@store/actions/efcvPositionSettings.action';
import { IErrorHandlingSettingsState } from '@store/state/errorHandlingSettings.state';
import { IUsersState } from '@store/state/users.state';
import { ConfigurationService } from './configurationService.service';
import { Validator } from 'jsonschema';
import { panelConfigCommonSchema } from '@core/models/schemaModels/PanelConfigurationCommonModel.schema';
import { errorHandlingSettingsSchema } from '@core/models/schemaModels/ErrorHandlingUIModel.schema';
import { ConfigurationDataModel } from '@core/models/UIModels/ConfigurationData.model';
import { IUnitSystemState } from '@store/state/unit-system.state';
import { UnitSystemUIModel } from '@core/models/UIModels/unit-system.model';
import { catchError, concatAll, map } from 'rxjs/operators';
import { WellService } from './well.service';
import { CommunicationChannelService } from './communicationChannel.service';
import { PanelConfigurationService } from './panelConfiguration.service';
import { IDeviceDataPoints } from '@store/state/deviceDataPoints.state';
import { ISurefloEntityState } from '@store/state/sureflo.state';

import { selectAllWells, selectWellState } from '@store/reducers/well.entity.reducer';
import { selectAllDataSources, selectDataSourcesState } from '@store/reducers/dataSources.entity.reducer';
import { selectAllToolConnections, selectToolConnetionState } from '@store/reducers/tool-connection.entity.reducer';
import { selectAllPublishings, selectPublishingState } from '@store/reducers/publishing.entity.reducer';
import { IWellEntityState } from '@store/state/well.state';
import { IDataSourceEntityState } from '@store/state/dataSources.state';
import { IPublishingEntityState } from '@store/state/publishing.state';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { DATA_LOGGER_TYPE, FLOWMETER_TRASMITTER_TYPE, PanelTypeList, UICommon } from '@core/data/UICommon';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { PublishingChannelService } from './publishingChannel.service';
import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { InchargeWellUIModel } from '@core/models/UIModels/Incharge.well.model';
import { ModbusSlaveRegisterMapUI } from '@core/models/webModels/ModbusSlaveRegisterMapUI.model';
import { ModbusDeviceConfigurationModelUIExtension, ModbusMapTemplateUIModel, RegisterTableType } from '@core/models/UIModels/modbusTemplate.model';
import { IRegisteredModbusMapState } from '@store/state/mapTemplateDetails.state';
import { DeleteServiceService } from './deleteService.service';
import { IToolConnecionState } from '@store/state/tool-connection.state';
import { ToolConnectionService } from './tool-connection.service';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { UserRoles } from '@core/models/webModels/Login.model';
import { selectAllflowMeters, selectflowMetersState } from '@store/reducers/sureflo.entity.reducer';
import { SurefloService } from './sureflo.service';
import { SureFLOFlowMeterUIModel } from '@core/models/UIModels/sureflo.model';
import { DeleteObjectTypesEnum } from '@core/models/webModels/DeleteObjectTypesEnum';
import { ShiftDefaultModelSchema } from '@core/models/schemaModels/ShiftDefaultsDataModel.schema';
import { PanelDefaultModelSchema } from '@core/models/schemaModels/PanelDefaultsDataModel.schema';
import { IPanelDefaultState } from '@store/state/panel-default.state';
import { IShiftDefaultState } from '@store/state/shift-default.state';
import { ShiftDefaultService } from './shift-default.service';
import { PanelDefaultService } from './panel-default.service';
import { IAlarmsAndLimitsState } from '@store/state/alarms-and-limits.state';
import { ILoggerTypeState } from "@store/state/dataLoggerTypes.state";

import { UtilityService } from './utility.service';
import { AlarmService } from './alarm.service';
import { selectAllDataLoggers, selectDataLoggerState } from '@store/reducers/dataLogger.entity.reducer';
import { IDataLoggerEntityState } from '@store/state/dataLogger.entity.state';
import { DataLoggerService } from './dataLogger.service';
import { DiagonsticsTestsService } from './diagonsticsTests.service';
import { DataLoggerUIModel } from '@core/models/UIModels/dataLogger.model';
import { selectAllSie, selectSieState } from '@store/reducers/sie.entity.reducer';
import { ISieEntityState } from '@store/state/sie.state';
import { IeFCVPositionSettingsState } from '@store/state/efcvPositionSettings.state';
import { SieService } from './sie.service';
import { multinodeEfcvPositionSchema } from '@core/models/schemaModels/MultinodeEfcvPosition.schema';
import { SIEConfigCommonSchema } from '@core/models/schemaModels/SIECongfigurationUIModel.schema';
import { SieUIModel } from '@core/models/UIModels/sie.model';
import { IDiagnosticsTestTypesState } from '@store/state/diagnosticsTestTypes.state';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class GatewayPanelConfigurationService {
  private configurationData: ConfigurationDataModel = new ConfigurationDataModel();

  private panelConfigurationModels$: Observable<IPanelConfigurationCommonState>;
  private IErrorHandlingSettingsState$: Observable<IErrorHandlingSettingsState>;
  private usersModels$: Observable<IUsersState>;
  private unitSystemModel$: Observable<IUnitSystemState>;
  private panelDefaultState$: Observable<IPanelDefaultState>;
  private alarmsAndLimitsState$: Observable<IAlarmsAndLimitsState>;
  private loggerTypeState$: Observable<ILoggerTypeState>;
  private diagnosticsTestTypeState$: Observable<IDiagnosticsTestTypesState>;
  private shiftDefaultState$: Observable<IShiftDefaultState>;
  private modbusTemplateDetails$: Observable<IRegisteredModbusMapState>;
  private IeFCVPositionSettingsState$: Observable<IeFCVPositionSettingsState>;
  private bIsConfigDirty = false;

  private arrInitSubscriptions: Subscription[] = [];
  constructor(
    private configurationService: ConfigurationService,
    private wellService: WellService,
    private communicationChannelsService: CommunicationChannelService,
    private toolConnectionService: ToolConnectionService,
    private panelConfigurationService: PanelConfigurationService,
    private gwModalService: GatewayModalService,
    private publishingChannelService: PublishingChannelService,
    private surefloService: SurefloService,
    private deleteService: DeleteServiceService,
    private shiftDefaultService: ShiftDefaultService,
    private panelDefaultService: PanelDefaultService,
    private alarmService: AlarmService,
    private utilityService: UtilityService,
    private dataLoggerService: DataLoggerService,
    private sieService: SieService,
    private store: Store<{
      usersState: IUsersState;
      panelConfigCommonState: IPanelConfigurationCommonState;
      errorHandlingSettingsState: IErrorHandlingSettingsState;
      unitSystemState: IUnitSystemState;
      deviceDataPointsState: IDeviceDataPoints;
    }>
  ) {
    this.usersModels$ = this.store.select<IUsersState>((state: any) => state.usersState);
    this.panelConfigurationModels$ = this.store.select<IPanelConfigurationCommonState>((state: any) => state.panelConfigCommonState);
    this.IErrorHandlingSettingsState$ = this.store.select<IErrorHandlingSettingsState>((state: any) => state.errorHandlingSettingsState);
    this.unitSystemModel$ = store.select<IUnitSystemState>((state: any) => state.unitSystemState);
    this.panelDefaultState$ = this.store.select<IPanelDefaultState>((state: any) => state.panelDefaultState);
    this.alarmsAndLimitsState$ = this.store.select<IAlarmsAndLimitsState>((state: any) => state.alarmsAndLimitsState);
    this.shiftDefaultState$ = this.store.select<IShiftDefaultState>((state: any) => state.shiftDefaultState);
    this.loggerTypeState$ = this.store.select<ILoggerTypeState>((state: any) => state.loggerTypeState);
    this.diagnosticsTestTypeState$ = this.store.select<IDiagnosticsTestTypesState>((state: any) => state.diagnosticsTestTypeState);
    this.modbusTemplateDetails$ = this.store.select<IRegisteredModbusMapState>((state: any) => state.mapTemplateDetailsState);
    this.IeFCVPositionSettingsState$ = this.store.select<IeFCVPositionSettingsState>((state: any) => state.eFCVPositionSettingsState);
  }

  /***************************************************************************************
  LOGIC TO IMPORT A CONFIGURATION FILE

  Inital - Configuration is NOT empty on Webhost.
         - Store may not load all of the states.
  Use promise to make sure that
   - if the state in the store is loaded, return promise true to indicate the state object is ready to export.
   - if the state in the store is not loaded, we need to dispatch "LOAD" action to load object into store

  Only when all configuration objects are loaded, export will happen.

  ******************************************************************************************/
  ExportConfiguration(filename: string): void {
    UICommon.isBusyWaiting = true;
    this.bIsConfigDirty = false;

    const promises: Promise<any>[] = [];
    // IPanelConfigurationState is defined in the feature module, it is not loaded yet.
    // Has to comment out this line to make Promise.all work
    promises.push(this.getVersionNumber());
    promises.push(this.initPanelConfiguration());
    promises.push(this.initWells());
    promises.push(this.initDataSources());
    promises.push(this.initToolConnections());
    promises.push(this.initCustomMaps());
    promises.push(this.initDataPublishing());
    promises.push(this.initErrorHandlingSettingState());
    // promises.push(this.initCustomerUsers());
    promises.push(this.initUnitSystem());
    promises.push(this.initFlowMeters());
    // Inforce
    if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.INFORCE) {
      promises.push(this.initShiftDefaultState());
      promises.push(this.initPanelDefaultState());
      if (UICommon.IsImportConfig || (this.configurationData?.panelConfigurationCommon?.Id !== undefined && this.configurationData?.panelConfigurationCommon?.Id !== -1 && UICommon.IsConfigSaved)) {
        promises.push(this.initAlarmsAndLimitsState());
      }
    }
    if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.MultiNode) {
      promises.push(this.initeFCVPositionSettingState());
      promises.push(this.initSie());
      promises.push(this.initDiagnosticsTypes());
    }
    promises.push(this.initDataLoggers());
    promises.push(this.initDataLoggerTypes())

    Promise.all(promises).then(
      // finally output the
      (results) => {
        results.forEach((element) => {
          console.debug(element);
        });
        this.unsubscribeInitSubscriptions();  // Unsubscribe Init*** state subscriptions
        this.saveConfigFile(filename);
        UICommon.isBusyWaiting = false;
      },
      reject => {
        UICommon.isBusyWaiting = false;
        this.unsubscribeInitSubscriptions();  // Unsubscribe Init*** state subscriptions
      }
    );
  }
  private getVersionNumber() {
    return new Promise((resolve) => {
      this.configurationService.getBuildNumber().subscribe((buildNumber) => {
        this.configurationData.VersionNumber = buildNumber;
        resolve(true);
      });
    });
  }
  private initPanelConfiguration() {
    return new Promise((resolve, reject) => {
      let subscription = this.panelConfigurationModels$.subscribe(
        (state: IPanelConfigurationCommonState) => {
          if (state !== undefined) {
            if (state.isLoaded === false) {
              // Dispatch Action if not loaded
              this.store.dispatch(
                PANELCONFIG_COMMON_ACTIONS.PANELCONFIG_COMMON_LOAD()
              );
            } else {
              if (StateUtilities.hasErrors(state)) {
                reject(state.error);
              } else {
                this.configurationData.panelConfigurationCommon = state.panelConfigurationCommon;
                this.bIsConfigDirty = this.bIsConfigDirty || state.isDirty;
                resolve(true);
              }
            }
          }
        }
      );
      this.arrInitSubscriptions.push(subscription);
    });
  }
  private initErrorHandlingSettingState() {
    return new Promise((resolve, reject) => {
      let subscription = this.IErrorHandlingSettingsState$.subscribe(
        (state: IErrorHandlingSettingsState) => {
          if (state !== undefined) {
            if (state.isLoaded === false) {
              // Dispatch Action if not loaded
              this.store.dispatch(
                ERROR_HANDLING_SETTINGS_STATE_ACTIONS.LOAD_ERROR_HANDLING_SETTINGS()
              );
            } else {
              if (StateUtilities.hasErrors(state)) {
                reject(state.error);
              } else {
                this.configurationData.errorHandlingSettings = state.errorHandlingSettings;
                this.bIsConfigDirty = this.bIsConfigDirty || state.isDirty;
                resolve(true);
              }
            }
          }
        }
      );

      this.arrInitSubscriptions.push(subscription);
    });
  }

  private initeFCVPositionSettingState() {
    return new Promise((resolve, reject) => {
      let subscription = this.IeFCVPositionSettingsState$.subscribe(
        (state: IeFCVPositionSettingsState) => {
          if (state !== undefined) {
            if (state.isLoaded === false) {
              // Dispatch Action if not loaded
              this.store.dispatch(
                eFCV_POSITION_SETTINGS_STATE_ACTIONS.LOAD_eFCV_POSITION_SETTINGS()
              );
            } else {
              if (StateUtilities.hasErrors(state)) {
                reject(state.error);
              } else {
                this.configurationData.eFCVPositionSettings = state.eFCVPositionSettings;
                this.bIsConfigDirty = this.bIsConfigDirty || state.isDirty;
                resolve(true);
              }
            }
          }
        }
      );
      this.arrInitSubscriptions.push(subscription);
    });
  }

  private initCustomerUsers() {
    return new Promise((resolve, reject) => {
      let subscription = this.usersModels$.subscribe((state: IUsersState) => {
        if (state !== undefined) {
          if (state.isLoaded === false) {
            // Dispatch Action if not loaded
            this.store.dispatch(USER_ACCOUNT_ACTIONS.USERS_LOAD());
          } else {
            if (StateUtilities.hasErrors(state)) {
              reject(state.error);
            } else {
              this.configurationData.users = state.users;
              resolve(true);
            }
          }
        }
      });

      this.arrInitSubscriptions.push(subscription);
    });
  }
  private initUnitSystem() {
    return new Promise((resolve, reject) => {
      let subscription = this.unitSystemModel$.subscribe((state: IUnitSystemState) => {
        if (state !== undefined) {
          if (state.isLoaded === false) {
            // Dispatch Action if not loaded
            this.store.dispatch(UNIT_SYSTEM_ACTIONS.UNITSYSTEM_LOAD());
          } else {
            if (StateUtilities.hasErrors(state)) {
              reject(state.error);
            } else {
              this.configurationData.unitSystem = state.unitSystem;
              this.bIsConfigDirty = this.bIsConfigDirty || state.isDirty;
              resolve(true);
            }
          }
        }
      });

      this.arrInitSubscriptions.push(subscription);
    });
  }

  private initShiftDefaultState() {
    return new Promise((resolve, reject) => {
      let subscription = this.shiftDefaultState$.subscribe(
        (state: IShiftDefaultState) => {
          if (state !== undefined) {
            if (state.isLoaded === false) {
              // Dispatch Action if not loaded
              this.store.dispatch(SHIFT_DEFAULT_ACTIONS.LOAD_SHIFT_DEFAULTS());
            } else {
              if (StateUtilities.hasErrors(state)) {
                reject(state.error);
              } else {
                this.configurationData.shiftDefaults = state.shiftDefaults;
                this.bIsConfigDirty = this.bIsConfigDirty || state.isDirty;
                resolve(true);
              }
            }
          }
        }
      );

      this.arrInitSubscriptions.push(subscription);
    });
  }

  private initPanelDefaultState() {
    return new Promise((resolve, reject) => {
      let subscription = this.panelDefaultState$.subscribe(
        (state: IPanelDefaultState) => {
          if (state !== undefined) {
            if (state.isLoaded === false) {
              // Dispatch Action if not loaded
              this.store.dispatch(PANEL_DEFAULT_ACTIONS.LOAD_PANEL_DEFAULTS());
            } else {
              if (StateUtilities.hasErrors(state)) {
                reject(state.error);
              } else {
                this.configurationData.panelDefaults = state.panelDefaults;
                this.bIsConfigDirty = this.bIsConfigDirty || state.isDirty;
                resolve(true);
              }
            }
          }
        }
      );

      this.arrInitSubscriptions.push(subscription);
    });
  }

  private initAlarmsAndLimitsState() {
    return new Promise((resolve, reject) => {
      let subscription = this.alarmsAndLimitsState$.subscribe(
        (state: IAlarmsAndLimitsState) => {
          if (state !== undefined) {
            if (state.isLoaded === false) {
              // Dispatch Action if not loaded
              this.store.dispatch(ALARMS_AND_LIMITS_ACTIONS.LOAD_ALARMS_AND_LIMITS());
            } else {
              if (StateUtilities.hasErrors(state)) {
                reject(state.error);
              } else {
                this.configurationData.alarmsAndLimits = state.alarmsAndLimits;
                this.bIsConfigDirty = this.bIsConfigDirty || state.isDirty;
                resolve(true);
              }
            }
          }
        }
      );

      this.arrInitSubscriptions.push(subscription);
    });
  }

  private initSie() {
    return new Promise((resolve, reject) => {
      let subscription = this.store.select<any>(selectSieState).subscribe((state: ISieEntityState) => {
        if (state && !state.isLoaded) {
          this.store.dispatch(SIE_ACTIONS.SIE_LOAD());
        } else {
          this.store.select<any>(selectAllSie).subscribe(data => {
            this.configurationData.sies = data;
            resolve(true);
          },
            error => reject(error));
        }
      });

      this.arrInitSubscriptions.push(subscription);
    });
  }

  private initWells() {
    return new Promise((resolve, reject) => {
      let subscription = this.store.select<any>(selectWellState).subscribe((state: IWellEntityState) => {
        if (state && !state.isLoaded) {
          this.store.dispatch(WELL_ACTIONS.WELL_LOAD());
        } else {
          this.store.select<any>(selectAllWells).subscribe(data => {
            this.configurationData.wells = data;
            resolve(true);
          },
            error => reject(error));
        }
      });

      this.arrInitSubscriptions.push(subscription);
    });
  }
  private initDataLoggers() {
    return new Promise((resolve, reject) => {
      let subscription = this.store.select<any>(selectDataLoggerState).subscribe((state: IDataLoggerEntityState) => {
        if (state && !state.isLoaded) {
          this.store.dispatch(DATA_LOGGER_ACTIONS.DATALOGGER_LOAD());
        } else {
          this.store.select<any>(selectAllDataLoggers).subscribe(data => {
            this.configurationData.dataLoggers = data;
            resolve(true);
          },
            error => reject(error));
        }
      });

      this.arrInitSubscriptions.push(subscription);
    });
  }
  private initDataLoggerTypes() {
    return new Promise((resolve, reject) => {
      let subscription = this.loggerTypeState$.subscribe(
        (state: ILoggerTypeState) => {
          if (state !== undefined) {
            if (state.isLoaded === false) {
              this.store.dispatch(LOGGER_TYPE_ACTIONS.LOAD_DATA_LOGGER_TYPES());
            } else {
              if (StateUtilities.hasErrors(state)) {
                reject(state.error);
              } else {
                this.configurationData.dataLoggerTypes = state.loggerTypes;
                this.bIsConfigDirty = this.bIsConfigDirty || state.isDirty;
                resolve(true);
              }
            }
          }
        }
      );
      this.arrInitSubscriptions.push(subscription);
    });
  }

  private initDiagnosticsTypes() {
    return new Promise((resolve, reject) => {
      let subscription = this.diagnosticsTestTypeState$.subscribe(
        (state: IDiagnosticsTestTypesState) => {
          if (state !== undefined) {
            if (state.isLoaded === false) {
              this.store.dispatch(DIAGONSTICS_TEST_TYPE_ACTIONS.LOAD_DIAGNOSTICS_TEST_TYPES());
            } else {
              if (StateUtilities.hasErrors(state)) {
                reject(state.error);
              } else {
                this.configurationData.diagnosticsTestTypes = state.diagnosticsTestTypes;
                this.bIsConfigDirty = this.bIsConfigDirty || state.isDirty;
                resolve(true);
              }
            }
          }
        }
      );
      this.arrInitSubscriptions.push(subscription);
    });
  }
  private initDataSources() {
    return new Promise((resolve, reject) => {
      let subscription = this.store.select<any>(selectDataSourcesState).subscribe((state: IDataSourceEntityState) => {
        if (!state.isLoaded) {
          this.store.dispatch(DATA_SOURCES_ACTIONS.DATASOURCES_LOAD());
        } else {
          this.store.select<any>(selectAllDataSources).subscribe(sources => {
            this.configurationData.dataSources = sources;
            resolve(true);
          },
            error => reject(error));
        }
      });

      this.arrInitSubscriptions.push(subscription);
    });
  }
  private initToolConnections() {
    return new Promise((resolve, reject) => {
      let subscription = this.store.select<any>(selectToolConnetionState).subscribe((state: IToolConnecionState) => {
        if (!state.isLoaded) {
          this.store.dispatch(TOOL_CONNECTIONS_ACTIONS.TOOL_CONNECTIONS_LOAD());
        } else {
          this.store.select<any>(selectAllToolConnections).subscribe(toolConnections => {
            this.configurationData.toolConnections = toolConnections;
            resolve(true);
          },
            error => reject(error));
        }
      });

      this.arrInitSubscriptions.push(subscription);
    });
  }

  private initDataPublishing() {
    return new Promise((resolve, reject) => {
      let subscription = this.store.select<any>(selectPublishingState).subscribe((state: IPublishingEntityState) => {
        if (!state.isLoaded) {
          this.store.dispatch(PUBLISHING_ACTIONS.PUBLISHING_LOAD());
        } else {
          this.store.select<any>(selectAllPublishings).subscribe(publishing => {
            this.configurationData.publishing = _.cloneDeep(publishing);
            resolve(true);
          },
            error => reject(error));
        }
      });

      this.arrInitSubscriptions.push(subscription);
    });
  }
  private initCustomMaps() {
    return new Promise((resolve, reject) => {
      let subscription = this.modbusTemplateDetails$.subscribe((state: IRegisteredModbusMapState) => {
        if (state !== undefined) {
          if (state.isLoaded === false) {
            this.store.dispatch(MODBUSTEMPLATE_ACTIONS.MAPTEMPLATES_LOAD());  // Dispatch Action if not loaded
          }
          else {
            if (StateUtilities.hasErrors(state)) {
              reject(state.error);
            } else {
              if (UICommon.IsImportConfig) {
                this.configurationData.customMaps =  _.cloneDeep(state.templates) ;
                this.bIsConfigDirty = this.bIsConfigDirty || state.isDirty;
                resolve(true);
              }
              else {
                this.getModbusMapDetails(state.templates).subscribe(result => {
                  this.configurationData.customMaps = [];
                  let customMaps: ModbusMapTemplateUIModel[] = [];
                  if (result && result.length > 0) {
                    result.forEach(mapRecord => {
                      let mapIndex = state.templates.findIndex(m => m.Id === mapRecord.modbusMapId) ?? -1;
                      if (mapIndex != -1) {
                        let modbusMapTemplate: ModbusMapTemplateUIModel = {
                          Id: state.templates[mapIndex].Id,
                          MapName: state.templates[mapIndex].MapName,
                          MapRecords: []
                        }
                        if (mapRecord.value != null) {
                          let modbusDevicemapSlave = new ModbusDeviceConfigurationModelUIExtension();
                          modbusDevicemapSlave.ModbusSlaveRegisterMap = new Array();

                          //loop to get modbus register map
                          for (var key2 in mapRecord.value) {
                            let registerMaprecords = mapRecord.value[key2];//api dictionary format.convert it to class format
                            if (isNaN(parseInt(registerMaprecords.toString()))) {
                              let registerMapUIRecord = new ModbusSlaveRegisterMapUI();
                              registerMapUIRecord.RegisterTableType = RegisterTableType[key2];//input or holding register type
                              registerMapUIRecord.DataPoints = registerMaprecords;
                              modbusDevicemapSlave.ModbusSlaveRegisterMap.push(registerMapUIRecord);
                            }
                          }
                          modbusMapTemplate.MapRecords = [];
                          modbusMapTemplate.MapRecords = modbusDevicemapSlave.ModbusSlaveRegisterMap;

                          customMaps.push(modbusMapTemplate);
                        }
                      }
                    });
                  }
                  this.configurationData.customMaps = customMaps;
                  this.bIsConfigDirty = this.bIsConfigDirty || state.isDirty;
                  resolve(true);
                },
                  error => reject(error));
              }
            }
          }
        }
      });

      this.arrInitSubscriptions.push(subscription);
    });
  }

  private initFlowMeters() {
    return new Promise((resolve, reject) => {
      let subscription = this.store.select<any>(selectflowMetersState).subscribe((state: ISurefloEntityState) => {
        if (!state.isLoaded) {
          this.store.dispatch(SUREFLO_ACTIONS.FLOWMETERS_LOAD());
        }
        else {
          this.store.select<any>(selectAllflowMeters).subscribe(flowmeters => {
            this.configurationData.sureflo = flowmeters;
            resolve(true);
          },
            error => reject(error));
        }
      });

      this.arrInitSubscriptions.push(subscription);
    });
  }

  private unsubscribeInitSubscriptions(): void {
    this.arrInitSubscriptions.forEach(sub => {
      if (sub != null)
        sub.unsubscribe();
    })
    this.arrInitSubscriptions = [];
  }

  private getModbusMapDetails(templates: ModbusMapTemplateUIModel[]): Observable<any[]> {
    let responses: any[] = [];
    for (let i = 0; i < templates.length; i++) {
      if (templates[i].MapRecords && templates[i].MapRecords.length > 0)
        continue;

      responses.push(this.publishingChannelService.getRegisteredModbusTemplateDetailsById(templates[i].Id)
        .pipe(map(value => ({ modbusMapId: templates[i].Id, value: value })))
        .pipe(catchError(value => of({ modbusMapId: templates[i].Id, failed: true })))
      );
    }
    if (responses.length > 0)
      return forkJoin(responses);

    return of([]);//EMPTY;
  }

  private saveConfigFile(filename: string) {
    const blob = new Blob([JSON.stringify(this.configurationData)]);
    // saveAs(blob, filename); better approach need to verify it on iOS devices
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const data = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', data);
      link.setAttribute('download', filename);
      link.click();
    }
  }
  /***************************************************************************************
  // LOGIC TO IMPORT A CONFIGURATION FILE
  //
  // Inital - Configuration is empty
  //
  // after successfull import the configuration file, we need to
  // validate the object aginst schema
  //
  //
  // For each object
  // dispatch UPDATE_* action with the new object to post the new object to webhost.
  // If any action failed
  // Issue command to API to reset database --> empty Configuration
  // issue warning.
  // then exit
  //
  // else { update the store }
  // for each object
  // dispatch LOAD_SUCSSESS action with the new object to update the store states
  //
  // ISSUE: how to only update the local store states without updating webhost?
  // ISSUE: how to prevent component to trigger LOAD actions multiple times?
  // ISSUE: where/when should we trigger state LOAD actions? if state is loaded already, we should noe trigger it again.
  // ISSUE: how to prevent multiple admins to import different configuration files?
  // ISSUE: how to maintain config.db integrty when there is a power outrage during importing file.
  //
  // 9/23/2020
  // Import Behavoir changes:
  // 1. validate each state objects
  // 2. call the update action to update the local store states.
  // 3. user needs to click Apply to SAVE all the local states to the webhost
  //    3.1 Need to chain each SAVE action
  //    3.2 If a single action failed, database will be reset.
  //    3.3 user will be issue message to re-import the configuration file.
   ******************************************************************************************/
  private setImportMaxDeviceId(): void {
    let inxDevice = this.configurationData.wells.length;
    if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.INFORCE) {
      inxDevice = inxDevice + 9; // count for HPU devices
      this.configurationData.wells.forEach(x => {
        inxDevice = inxDevice + x.Zones.length;
      })
    }
    if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.MultiNode) {
      inxDevice = inxDevice + 1; // multinode control device
      this.configurationData.sies.forEach(y=>{
        inxDevice = inxDevice + 1;
      })
      this.configurationData.wells.forEach(x => {
        inxDevice = inxDevice + x.Zones.length;
      })
      
    }
    this.configurationData.dataSources.forEach(dataSource => {
      dataSource.Cards.forEach(card => {
        inxDevice = inxDevice + card.Gauges?.length;
      });
      inxDevice = inxDevice + dataSource.Cards.length;
    });
    // inxDevice = inxDevice + this.configurationData.sureflo.length; // SureFLO handeled differently as they are always added in last
    UICommon.ImportMaxDeviceId = inxDevice + 1;
  }

  private validateConfigFile(fileData: string): boolean {
    try {
      if (fileData == null || fileData.length === 0) {
        return false;
      }
      const configObjectString = fileData;
      let config: ConfigurationDataModel = JSON.parse(configObjectString);

      if (!config.VersionNumber.startsWith('2')) {
        return false;
      }
    } catch (e) {
      console.log('Exception occurred : ' + e);
      return false;
    }

    return true;
  }

  public validateImportFile(file: any) {

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onloadend = () => {
        if (UICommon.IsImportConfig) {
          this.gwModalService.openDialog(
            `Are you sure you want to import?<br>Existing configuration will be overwritten.</br>`,
            () => {
              this.gwModalService.closeModal();
              if (!this.validateConfigFile(reader.result as string))
                reject(false);

              resolve(true);
            },
            () => {
              this.gwModalService.closeModal();
              resolve(false);
            },
            'Warning',
            null,
            true,
            'Import',
            'Cancel'
          );

          return;
        }

        if (!this.validateConfigFile(reader.result as string)) {
          reject(false);
        }

        resolve(true);
      };
    });
  }

  private updateRegisteredModbusMapForImport(): void {
    let versionNumber = parseFloat(this.configurationData.VersionNumber.substring(0,3));
    if (versionNumber < 2.2) {
      let customMaps: ModbusMapTemplateUIModel[] = this.configurationData.customMaps.filter(m => m.Id >= 6 && m.Id <= 10)??[];
      if (customMaps.length > 0) {
        const ids = this.configurationData.customMaps?.map(object => {
          return object.Id;
        });
        let maxMapId = Math.max.apply(null,ids);
        maxMapId = maxMapId > 10 ? maxMapId + 1: 11;
        customMaps.forEach((map,index) => {
          let publishings = this.configurationData.publishing.filter(p => p.RegisteredModbusMapId === map.Id)??[];
          publishings.forEach(pub => pub.RegisteredModbusMapId = maxMapId + index);
          map.Id = maxMapId + index;
        });
      }
    }
  }
  
  public ImportConfiguration(file: any): Promise<boolean> {
    const reader = new FileReader();
    reader.readAsText(file);

    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const configObjectString = reader.result as string;
        this.configurationData = JSON.parse(configObjectString);
        UICommon.IsImportConfig = true; // Set imported config as true
        
        // Update Custom ModbusMap having Ids same as MultiNode Default Map or iField Default Map
        this.updateRegisteredModbusMapForImport();
        
        // DISPATCH ACTIONS to update the local state.
        this.store.dispatch(PANELCONFIG_COMMON_ACTIONS.PANELCONFIG_COMMON_LOAD_SUCCESS({ panelConfigurationCommon: this.configurationData.panelConfigurationCommon }));
        this.store.dispatch(ERROR_HANDLING_SETTINGS_STATE_ACTIONS.LOAD_ERROR_HANDLING_SETTINGS_SUCCESS({ errorHandlingSettings: this.configurationData.errorHandlingSettings }));
        this.store.dispatch(UNIT_SYSTEM_ACTIONS.UNITSYSTEM_LOAD_SUCCESS({ newunitSystem: this.configurationData.unitSystem }));
        this.store.dispatch(WELL_ACTIONS.WELL_LOAD_SUCCESS({ wells: this.configurationData.wells }));
        this.store.dispatch(TOOL_CONNECTIONS_ACTIONS.TOOL_CONNECTIONS_LOAD_SUCCESS({ toolConnections: this.configurationData.toolConnections }));
        this.store.dispatch(DATA_SOURCES_ACTIONS.DATASOURCES_LOAD_SUCCESS({ dataSources: this.configurationData.dataSources }));
        this.store.dispatch(MODBUSTEMPLATE_ACTIONS.MAPTEMPLATES_LOAD_SUCCESS({ templates: this.configurationData.customMaps }));
        this.store.dispatch(PUBLISHING_ACTIONS.PUBLISHING_LOAD_SUCCESS({ publishings: this.configurationData.publishing }));
        this.store.dispatch(SUREFLO_ACTIONS.FLOWMETERS_LOAD_SUCCESS({ flowMeters: this.configurationData.sureflo }));
        if (this.configurationData.dataLoggers)
          this.store.dispatch(DATA_LOGGER_ACTIONS.DATALOGGER_LOAD_SUCCESS({ dataLoggers: this.configurationData.dataLoggers }));
        if (this.configurationData.dataLoggerTypes)
          this.store.dispatch(LOGGER_TYPE_ACTIONS.LOAD_DATA_LOGGER_TYPES_SUCCESS({ loggerTypes: this.configurationData.dataLoggerTypes }));

        // Inforce
        if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.INFORCE) {
          this.configurationData.panelDefaults.FlowMeterTransmitterType = this.configurationData.panelDefaults.FlowMeterTransmitterType ?? FLOWMETER_TRASMITTER_TYPE.PrecisionDigital;
          this.store.dispatch(SHIFT_DEFAULT_ACTIONS.LOAD_SHIFT_DEFAULTS_SUCCESS({ shiftDefaults: this.configurationData.shiftDefaults }));
          this.store.dispatch(PANEL_DEFAULT_ACTIONS.LOAD_PANEL_DEFAULTS_SUCCESS({ panelDefaults: this.configurationData.panelDefaults }))
          this.store.dispatch(ALARMS_AND_LIMITS_ACTIONS.LOAD_ALARMS_AND_LIMITS_SUCCESS({ alarmsAndLimits: this.configurationData.alarmsAndLimits }))
        }
        // Multinode
        if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.MultiNode) {
          this.store.dispatch(eFCV_POSITION_SETTINGS_STATE_ACTIONS.LOAD_eFCV_POSITION_SETTINGS_SUCCESS({eFCVPositionSettings : this.configurationData.eFCVPositionSettings}));
          this.store.dispatch(SIE_ACTIONS.SIE_LOAD_SUCCESS({ sie: this.configurationData.sies}));
          if (this.configurationData.diagnosticsTestTypes)
          this.store.dispatch(DIAGONSTICS_TEST_TYPE_ACTIONS.LOAD_DIAGNOSTICS_TEST_TYPES_SUCCESS({ diagnosticsTestTypes: this.configurationData.diagnosticsTestTypes}));
        }
        this.ValidateConfiguration();
        this.setImportMaxDeviceId();
        resolve(true);
      };

      reader.onerror = () => {
        console.log("Error while reading configration file...");
        resolve(false);
      }
    });
  }

  private IsValidateSIE(sies: SieUIModel[]) {
    let bIsValid = true;
    for (let i = 0; i < sies.length; i++) {
      if (sies[i].IsValid && !sies[i].IsValid) {
        bIsValid = false;
        break;
      }
    }

    return bIsValid;
  }

  private IsValidateWell(wells: InchargeWellUIModel[]) {
    let bIsValid = true;
    for (let i = 0; i < wells.length; i++) {
      if (wells[i].IsValid && !wells[i].IsValid) {
        bIsValid = false;
        break;
      }
    }

    return bIsValid;
  }

  private IsValidateDataSources(dataSources: DataSourceUIModel[]) {
    let bIsValid = true;
    for (let i = 0; i < dataSources.length; i++) {
      if (dataSources[i].IsValid !== undefined && !dataSources[i].IsValid) {
        bIsValid = false;
        break;
      }
    }

    return bIsValid;
  }

  private IsValidToolConnection(toolConnections: ToolConnectionUIModel[]) {
    let bIsValid = true;
    for (let i = 0; i < toolConnections.length; i++) {
      if (toolConnections[i].IsValid && !toolConnections[i].IsValid) {
        bIsValid = false;
        break;
      }
    }

    return bIsValid;
  }

  private IsValidateDataPublishing(publishings: PublishingDataUIModel[]) {
    let bIsValid = true;
    for (const publishing of publishings) {
      if (publishing.IsValid && !publishing.IsValid) {
        bIsValid = false;
        break;
      }
    }

    return bIsValid;
  }

  private IsValidateFlowMeter(flowmeters: SureFLOFlowMeterUIModel[]) {
    let bIsValid = true;
    for (const flowmeter of flowmeters) {
      if (flowmeter.IsValid && !flowmeter.IsValid) {
        bIsValid = false;
        break;
      }
    }

    return bIsValid;
  }

  private IsValidateDataLogger(dataLoggers: DataLoggerUIModel[]) {
    let bIsValid = true;
    for (const dataLogger of dataLoggers) {
      if (dataLogger.IsValid && !dataLogger.IsValid) {
        bIsValid = false;
        break;
      }
    }

    return bIsValid;
  }

  private ValidateConfiguratonObject(
    configObject: any,
    configSchema: any
  ): boolean {
    const validator = new Validator();
    validator.addSchema(configSchema);
    const validationResult = validator.validate(configObject, configSchema);
    return validationResult.valid;
  }

  // Define validation step
  private ValidateConfiguration(): boolean {
    let status = true;
    // #1 validate panelConfiguration
    status = status &&
      this.ValidateConfiguratonObject(
        this.configurationData.panelConfigurationCommon,
        panelConfigCommonSchema
      );
    if (!status) {
      return false;
    }

    // #2 validate errorHandlingSettings
    status = status &&
      this.ValidateConfiguratonObject(
        this.configurationData.errorHandlingSettings,
        errorHandlingSettingsSchema
      );
    if (!status) {
      return false;
    }

    // InFORCE
    if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.INFORCE) {
      // Validate Shift Defaults
      status = status &&
        this.ValidateConfiguratonObject(
          this.configurationData.shiftDefaults,
          ShiftDefaultModelSchema
        );
      if (!status) {
        return false;
      }
      // Validate Panel Defaults
      status = status &&
        this.ValidateConfiguratonObject(
          this.configurationData.panelDefaults,
          PanelDefaultModelSchema
        );
      if (!status) {
        return false;
      }
    }

    // Multinode
    if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.MultiNode) {
      // validate SIE
      status = status &&
        this.IsValidateSIE(this.configurationData.sies);
      if (!status) {
        return false;
      }
    }

    // #3 validate wells
    status = status &&
      this.IsValidateWell(this.configurationData.wells)
    if (!status) {
      return false;
    }

    // #4 validate dataSources
    status = status &&
      this.IsValidateDataSources(this.configurationData.dataSources)
    if (!status) {
      return false;
    }

    // validate Tool Connection
    status = status &&
      this.IsValidToolConnection(this.configurationData.toolConnections)
    if (!status) {
      return false;
    }

    // #5 validate DataPublishing
    if (this.configurationData.publishing && this.configurationData.publishing.length > 0) {
      status = status && this.IsValidateDataPublishing(this.configurationData.publishing);
      if (!status) {
        return false;
      }
    }

    // #5 validate FlowMeters
    if (this.configurationData.sureflo && this.configurationData.sureflo.length > 0) {
      status = status && this.IsValidateFlowMeter(this.configurationData.sureflo);
      if (!status) {
        return false;
      }
    }

    // #6 validate DataLoggers
    if (this.configurationData.dataLoggers && this.configurationData.dataLoggers.length > 0) {
      status = status && this.IsValidateDataLogger(this.configurationData.dataLoggers);
      if (!status) {
        return false;
      }
    }
    return status;
  }

  /***************************************************************************************
  // Reload all states when import operation is successfull.
  ****************************************************************************************/
  public ForceReloadConfiguration(accessLevel: UserRoles, isConfigSaved: boolean) {
    switch (accessLevel) {
      case UserRoles.Open:
        this.store.dispatch(PANELCONFIG_COMMON_ACTIONS.PANELCONFIG_COMMON_LOAD());
        this.store.dispatch(UNIT_SYSTEM_ACTIONS.UNITSYSTEM_LOAD());
        this.store.dispatch(WELL_ACTIONS.WELL_LOAD());
        this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DEVICES());
        this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DATAPOINTDEF());
        this.store.dispatch(DATA_SOURCES_ACTIONS.DATASOURCES_LOAD());
        this.store.dispatch(TOOL_CONNECTIONS_ACTIONS.TOOL_CONNECTIONS_LOAD());
        break;

      case UserRoles.Operator:
        this.store.dispatch(PANELCONFIG_COMMON_ACTIONS.PANELCONFIG_COMMON_LOAD());
        this.store.dispatch(
          ERROR_HANDLING_SETTINGS_STATE_ACTIONS.LOAD_ERROR_HANDLING_SETTINGS()
        );
        this.store.dispatch(UNIT_SYSTEM_ACTIONS.UNITSYSTEM_LOAD());
        this.store.dispatch(WELL_ACTIONS.WELL_LOAD());
        this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DEVICES());
        this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DATAPOINTDEF());
        this.store.dispatch(DATA_SOURCES_ACTIONS.DATASOURCES_LOAD());
        this.store.dispatch(TOOL_CONNECTIONS_ACTIONS.TOOL_CONNECTIONS_LOAD());
        this.store.dispatch(PUBLISHING_ACTIONS.PUBLISHING_LOAD());
        this.store.dispatch(DATA_LOGGER_ACTIONS.DATALOGGER_LOAD());
        this.store.dispatch(LOGGER_TYPE_ACTIONS.LOAD_DATA_LOGGER_TYPES());
        //Inforce
        if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.INFORCE) {
          this.store.dispatch(SHIFT_DEFAULT_ACTIONS.LOAD_SHIFT_DEFAULTS());
          this.store.dispatch(PANEL_DEFAULT_ACTIONS.LOAD_PANEL_DEFAULTS())
          if (UICommon.IsImportConfig || (this.configurationData?.panelConfigurationCommon?.Id !== undefined && this.configurationData?.panelConfigurationCommon?.Id !== -1 && UICommon.IsConfigSaved)) {
            this.store.dispatch(ALARMS_AND_LIMITS_ACTIONS.LOAD_ALARMS_AND_LIMITS());
          }
        }
        // Multinode
        if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.MultiNode) {
          this.store.dispatch(eFCV_POSITION_SETTINGS_STATE_ACTIONS.LOAD_eFCV_POSITION_SETTINGS());
          this.store.dispatch(SIE_ACTIONS.SIE_LOAD());
          this.store.dispatch(DIAGONSTICS_TEST_TYPE_ACTIONS.LOAD_DIAGNOSTICS_TEST_TYPES());
        }
        break;

      case UserRoles.Administrator:
        this.ForceFullReloadConfiguration(isConfigSaved);
        break;
    }
  }

  private ForceFullReloadConfiguration(isConfigSaved: boolean): void {
    this.store.dispatch(PANELCONFIG_COMMON_ACTIONS.PANELCONFIG_COMMON_LOAD());
    this.store.dispatch(ERROR_HANDLING_SETTINGS_STATE_ACTIONS.LOAD_ERROR_HANDLING_SETTINGS());
    this.store.dispatch(UNIT_SYSTEM_ACTIONS.UNITSYSTEM_LOAD());
    this.store.dispatch(WELL_ACTIONS.WELL_LOAD());
    this.store.dispatch(DATA_SOURCES_ACTIONS.DATASOURCES_LOAD());
    this.store.dispatch(TOOL_CONNECTIONS_ACTIONS.TOOL_CONNECTIONS_LOAD());
    this.store.dispatch(PUBLISHING_ACTIONS.PUBLISHING_LOAD());
    this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DEVICES());
    this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DATAPOINTDEF());
    if (isConfigSaved) {
      this.store.dispatch(DATA_LOGGER_ACTIONS.DATALOGGER_LOAD());
      this.store.dispatch(LOGGER_TYPE_ACTIONS.LOAD_DATA_LOGGER_TYPES());
      this.store.dispatch(MODBUSTEMPLATE_ACTIONS.MAPTEMPLATES_LOAD());
      this.store.dispatch(SUREFLO_ACTIONS.FLOWMETERS_LOAD());
    }
    // Inforce
    if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.INFORCE) {     
      this.store.dispatch(SHIFT_DEFAULT_ACTIONS.LOAD_SHIFT_DEFAULTS());
      this.store.dispatch(PANEL_DEFAULT_ACTIONS.LOAD_PANEL_DEFAULTS());
      this.store.dispatch(INFORCE_DEVICES_ACTIONS.INFORCEDEVICES_LOAD());
      if (isConfigSaved) {
        this.store.dispatch(ALARM_ACTIONS.ALARMS_LOAD());
        this.store.dispatch(ALARMS_AND_LIMITS_ACTIONS.LOAD_ALARMS_AND_LIMITS());
      }
    }
    // Multinode
    if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.MultiNode) {
      this.store.dispatch(eFCV_POSITION_SETTINGS_STATE_ACTIONS.LOAD_eFCV_POSITION_SETTINGS());
      this.store.dispatch(SIE_ACTIONS.SIE_LOAD());
      this.store.dispatch(DIAGONSTICS_TEST_TYPE_ACTIONS.LOAD_DIAGNOSTICS_TEST_TYPES());
    }
  }

  ResetStateConfiguration(): void {
    this.store.dispatch(PANELCONFIG_COMMON_ACTIONS.PANELCONFIG_COMMON_RESET());
    this.store.dispatch(USER_ACCOUNT_ACTIONS.USERS_RESET());
    this.store.dispatch(ERROR_HANDLING_SETTINGS_STATE_ACTIONS.RESET_ERROR_HANDLING_SETTINGS());
    this.store.dispatch(UNIT_SYSTEM_ACTIONS.UNITSYSTEM_RESET());
    this.store.dispatch(WELL_ACTIONS.WELL_RESET());
    this.store.dispatch(DATA_SOURCES_ACTIONS.DATASOURCES_RESET());
    this.store.dispatch(TOOL_CONNECTIONS_ACTIONS.TOOL_CONNECTIONS_RESET());
    this.store.dispatch(PUBLISHING_ACTIONS.PUBLISHING_RESET());
    this.store.dispatch(MODBUSTEMPLATE_ACTIONS.MAPTEMPLATES_RESET());
    this.store.dispatch(DEVICEPOINTS_ACTIONS.RESET_DEVICES());
    this.store.dispatch(DEVICEPOINTS_ACTIONS.RESET_DATAPOINTDEF());
    this.store.dispatch(SUREFLO_ACTIONS.FLOWMETERS_RESET());
    // Inforce
    this.store.dispatch(SHIFT_DEFAULT_ACTIONS.RESET_SHIFT_DEFAULTS());
    this.store.dispatch(PANEL_DEFAULT_ACTIONS.RESET_PANEL_DEFAULTS())
    this.store.dispatch(ALARMS_AND_LIMITS_ACTIONS.RESET_ALARMS_AND_LIMITS());
    this.store.dispatch(INFORCE_DEVICES_ACTIONS.INFORCEDEVICES_RESET());
    this.store.dispatch(DATA_LOGGER_ACTIONS.DATALOGGER_RESET());
    this.store.dispatch(LOGGER_TYPE_ACTIONS.LOGGER_TYPES_RESET());
    // Multinode
    this.store.dispatch(eFCV_POSITION_SETTINGS_STATE_ACTIONS.RESET_eFCV_POSITION_SETTINGS());
    this.store.dispatch(SIE_ACTIONS.SIE_RESET());
    this.store.dispatch(DIAGONSTICS_TEST_TYPE_ACTIONS.DIAGNOSTICS_TEST_TYPES_RESET());
  }


  private RestartAcquisitionProcess(): Observable<any> {
    this.ForceFullReloadConfiguration(true);
    return this.configurationService.restartAcquisitionProcess();
  }

  SaveConfiguration(): Promise<any> {
    this.bIsConfigDirty = false;
    const promises: Promise<any>[] = [];
    promises.push(this.initPanelConfiguration());
    promises.push(this.initErrorHandlingSettingState());
    promises.push(this.initUnitSystem());
    promises.push(this.initWells());
    promises.push(this.initFlowMeters());
    promises.push(this.initDataSources());
    promises.push(this.initToolConnections())
    if (UICommon.IsImportConfig)
      promises.push(this.initCustomMaps());
    promises.push(this.initDataPublishing());
    // Inforce
    if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.INFORCE) {
      promises.push(this.initShiftDefaultState());
      promises.push(this.initPanelDefaultState());
      if (UICommon.IsImportConfig || (this.configurationData?.panelConfigurationCommon?.Id !== undefined && this.configurationData?.panelConfigurationCommon?.Id !== -1 && UICommon.IsConfigSaved)) {
        promises.push(this.initAlarmsAndLimitsState());
      }
    }
    if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.MultiNode) {
      promises.push(this.initeFCVPositionSettingState());
      promises.push(this.initSie());
      promises.push(this.initDiagnosticsTypes());
    }
    promises.push(this.initDataLoggers());

    return Promise.all(promises).then(
      // finally output the
      (results) => {
        this.unsubscribeInitSubscriptions();  // Unsubscribe Init*** state subscriptions

        results.forEach((element) => {
          console.debug(element);
        });

        let bIsValid = this.ValidateConfiguration();
        if (!bIsValid) {
          UICommon.isBusyWaiting = false;
          return Promise.reject('Invalid configuration!');
        }

        return new Promise((resolve, reject) => {

          // Get the updated unit systems list here before calling the webhost save
          const unitSystemList = new Array<UnitSystemUIModel>();
          this.configurationData.unitSystem.UnitQuantities.forEach((element) => {
            const model: UnitSystemUIModel = {
              UnitQuantityName: element.UnitQuantityName,
              SelectedUnitSymbol: element.SelectedUnitSymbol,
              SelectedDisplayUnitSymbol: element.SelectedDisplayUnitSymbol
            };
            unitSystemList.push(model);
          });

          // Configuration objects to save
          let deleteObjectPost: any[] = [];
          let saveWells: any[] = [];
          let saveDataSources: any[] = [];
          let saveToolConnections: any[] = [];
          let addSureFLOFlowMeters: any[] = [];
          let saveDataLoggers: any[] = [];
          let saveSIEs: any[] = [];

          // Delete Objects
          let delObjects: any[] = [];
          if (UICommon.deletedObjects.length > 0) {
            let sortedDeleteObjects = UICommon.deletedObjects.sort((a, b) => a.deleteOrder - b.deleteOrder);
            sortedDeleteObjects.forEach(delObj => {
              if (delObj.objectType === DeleteObjectTypesEnum.Channel && delObj.children && delObj.children.length > 0) {
                delObj.children.forEach(delChild => {
                  delObjects.push({ objectTypeEnum: delChild.objectType, objectId: delChild.id });
                });
              }
              delObjects.push({ objectTypeEnum: delObj.objectType, objectId: delObj.id });
            });
          }

          if (delObjects.length > 0)
            deleteObjectPost.push(this.deleteService.deleteConfigurationObjects(delObjects));

          if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.MultiNode) {
            // SIE
            let siesToSave = UICommon.IsImportConfig ? this.configurationData.sies : this.configurationData.sies?.filter(w => w.IsDirty === true) ?? [];
            if (siesToSave.length > 0)
              saveSIEs.push(this.sieService.saveSies(siesToSave));
          }

          // Wells
          let wellsToSave = UICommon.IsImportConfig ? this.configurationData.wells : this.configurationData.wells?.filter(w => w.IsDirty === true) ?? [];
          if (wellsToSave.length > 0)
            saveWells.push(this.wellService.saveWell(wellsToSave));

          // Data Sources
          let dataSourcesToSave = UICommon.IsImportConfig ? this.configurationData.dataSources : this.configurationData.dataSources?.filter(d => d.IsDirty === true) ?? [];
          if (dataSourcesToSave.length > 0)
            saveDataSources.push(this.communicationChannelsService.saveDataSource(dataSourcesToSave));

          // ToolConnections - check if exists or not
          if (this.configurationData.dataSources.length > 0 && this.configurationData.toolConnections && this.configurationData.toolConnections.length > 0) {
            saveToolConnections.push(this.toolConnectionService.saveToolConnection(this.configurationData.toolConnections));
          }

          // SureFLO Flowmeters
          if (this.configurationData.sureflo?.length > 0) {
            let sureFLOToSave = UICommon.IsImportConfig ? this.configurationData.sureflo : this.configurationData.sureflo.filter(s => s.IsDirty === true) ?? [];
            if (sureFLOToSave.length > 0)
              addSureFLOFlowMeters.push(this.surefloService.saveFlowMeter(sureFLOToSave));
          }

          // Data Loggers
          let dataLoggersToSave = UICommon.IsImportConfig ? this.configurationData.dataLoggers : this.configurationData.dataLoggers?.filter(w => w.IsDirty === true || w.DataLoggerType === DATA_LOGGER_TYPE.Saudi_Aramco_iField) ?? [];
          if (dataLoggersToSave.length > 0) {
            saveDataLoggers.push(this.dataLoggerService.saveDataLogger(dataLoggersToSave));
          }

          // Custom Maps
          let customMapPost: any[] = [];
          if (UICommon.IsImportConfig) {
            this.configurationData.customMaps.forEach(customMap => {
              if (this.isCustomMap(customMap.Id)) {
                customMapPost.push(this.publishingChannelService.saveModbusMaps(customMap));
              }
            });
          }

          // Call the webhost save/update here
          const configurationObjects = of(
            forkJoin(deleteObjectPost),
            this.panelConfigurationService.updatePanelConfigurationCommon(this.configurationData.panelConfigurationCommon),
            this.configurationService.updateErrorHandlingSettings(this.configurationData.errorHandlingSettings),
            this.forkUpdateeFCVData(),
            this.configurationService.saveUnitSystem(unitSystemList),
            this.forkUpdateShiftandPanelDefaultData(wellsToSave.length),
            forkJoin(saveSIEs),
            forkJoin(saveWells),
            forkJoin(saveDataSources),
            forkJoin(saveToolConnections),
            forkJoin(addSureFLOFlowMeters),
            forkJoin(customMapPost),
            this.forkUpdateInforceAlarmsAndLimitData(),
            this.forkUpdateInFORCEAlarmDevices(wellsToSave.length),
            forkJoin(saveDataLoggers),
            of(true)
          );
          const saveAll = configurationObjects.pipe(concatAll());
          saveAll.subscribe((x) => {
            if (x && x === true) {
              // Post minimum configuration saved make API call to update Data Publishing
              let publshingToSave = UICommon.IsImportConfig ? this.configurationData.publishing : this.configurationData.publishing?.filter(p => p.IsDirty === true) ?? [];
              if (publshingToSave.length === 0) {
                console.log('Configuration Saved. Restarting acquisition....');
                UICommon.isBusyWaiting = false;
                this.RestartAcquisitionProcess().subscribe(
                  () => {
                    console.log("Acquistion restarted.....");
                    resolve(true);
                  },
                  error => reject("Error in Restarting acquistion....")
                );
              } else {
                let postPublishings = this.publishingChannelService.getPublishing_PostModel(publshingToSave);
                this.publishingChannelService.savePublishing(postPublishings).subscribe((res) => {
                  console.log('Configuration Saved. Restarting acquisition....');
                  UICommon.isBusyWaiting = false;
                  this.RestartAcquisitionProcess().subscribe(
                    () => {
                      console.log("Acquistion restarted.....");
                      resolve(true);
                    },
                    error => reject("Error in Restarting acquistion....")
                  );
                },
                  error => {
                    console.log(error);
                    UICommon.isBusyWaiting = false;
                    reject('Error in Save Data Publishing!');
                  });
              }
            }
          },
            error => {
              console.log(error);
              UICommon.isBusyWaiting = false;
              reject('Error in Save Configuration!');
            }
          );
        });
      }
    )
      .catch(reason => {
        // console.log(reason);
        this.unsubscribeInitSubscriptions();  // Unsubscribe Init*** state subscriptions
        return Promise.reject(reason);
      });
  }

  private isCustomMap(mapId: number): boolean {
    let bIsCustomMap = true;
    if (mapId === 1 || mapId === 2 || mapId === 5) {
      bIsCustomMap = false;
    }
    return bIsCustomMap;
  }

  //Inforce Shift and Panel Default
  forkUpdateeFCVData() {
    if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.MultiNode) {
      if (this.configurationData?.eFCVPositionSettings)
        return this.configurationService.updateeFCVPositionSettings(this.configurationData.eFCVPositionSettings);
    }
    return EMPTY;
  }

  //Inforce Shift and Panel Default
  forkUpdateShiftandPanelDefaultData(wellCount: number) {
    let inFORCEShiftPanelDefaults: any[] = [];
    if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.INFORCE) {
      inFORCEShiftPanelDefaults.push(this.shiftDefaultService.updateShiftDefault(this.configurationData.shiftDefaults));
      inFORCEShiftPanelDefaults.push(this.panelDefaultService.updatePanelDefault(this.configurationData.panelDefaults));

      if (wellCount <= 0) {
        inFORCEShiftPanelDefaults.push(this.wellService.updateInForceWellandDevices());
      }
    }

    if (inFORCEShiftPanelDefaults.length > 0)
      return forkJoin(inFORCEShiftPanelDefaults);

    return EMPTY;
  }

  // Inforce AlaramsAndLimits 
  forkUpdateInforceAlarmsAndLimitData() {
    let inFORCELimitsAlarms: any[] = [];
    if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.INFORCE &&
      (UICommon.IsImportConfig || (this.configurationData?.panelConfigurationCommon?.Id !== undefined && this.configurationData?.panelConfigurationCommon?.Id !== -1 && UICommon.IsConfigSaved))) {
      if (this.configurationData.alarmsAndLimits && this.configurationData.alarmsAndLimits.HighOutputXPressure != null
        && this.configurationData.alarmsAndLimits.HighPumpPressure != null && this.configurationData.alarmsAndLimits.HighSupplyPressure != null
        && this.configurationData.alarmsAndLimits.LowReservoirLevel != null && this.configurationData.alarmsAndLimits.StartPumpPressure != null
        && this.configurationData.alarmsAndLimits.StopPumpPressure != null)
        inFORCELimitsAlarms.push(this.alarmService.updateAlarmsAndLimits(this.configurationData.alarmsAndLimits));
    }

    if (inFORCELimitsAlarms.length > 0)
      return forkJoin(inFORCELimitsAlarms);

    return EMPTY;
  }

  // InFORCE Alarms Devices
  forkUpdateInFORCEAlarmDevices(wellCount: number) {
    let updateAlarmDevices: any[] = [];
    if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.INFORCE && wellCount > 0) {
      updateAlarmDevices.push(this.alarmService.updateInFORCEDevices());
    }

    if (updateAlarmDevices.length > 0)
      return forkJoin(updateAlarmDevices);

    return EMPTY;
  }

  checkDirtyStatus(): Promise<boolean> {
    this.bIsConfigDirty = UICommon.deletedObjects.length > 0 ? true : false;

    if (this.bIsConfigDirty)
      return Promise.resolve(true);

    const promises: Promise<any>[] = [];
    promises.push(this.initPanelConfiguration());
    promises.push(this.initErrorHandlingSettingState());
    promises.push(this.initUnitSystem());
    promises.push(this.initWells());
    promises.push(this.initDataSources());
    promises.push(this.initToolConnections());
    promises.push(this.initDataPublishing());
    promises.push(this.initFlowMeters());
    // Inforce
    if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.INFORCE) {
      promises.push(this.initShiftDefaultState());
      promises.push(this.initPanelDefaultState());
      if (UICommon.IsImportConfig || (this.configurationData?.panelConfigurationCommon?.Id !== undefined && this.configurationData?.panelConfigurationCommon?.Id !== -1 && UICommon.IsConfigSaved)) {
        promises.push(this.initAlarmsAndLimitsState());
      }
    }

    // Multinode
    if (this.configurationData?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.MultiNode) {
      promises.push(this.initeFCVPositionSettingState());
      promises.push(this.initSie());
      promises.push(this.initDiagnosticsTypes());
    }

    promises.push(this.initDataLoggers());
    promises.push(this.initDataLoggerTypes());

    return Promise.all(promises).then((result) => {
      this.unsubscribeInitSubscriptions();

      // get dirty status for data sources
      for (let i = 0; i < this.configurationData.dataSources.length; i++) {
        if (this.configurationData.dataSources[i].IsDirty !== undefined && this.configurationData.dataSources[i].IsDirty) {
          this.bIsConfigDirty = this.bIsConfigDirty || true;
          break;
        }
      }

      // get dirty status for data publishing
      for (let i = 0; i < this.configurationData.publishing.length; i++) {
        if (this.configurationData.publishing[i].IsDirty !== undefined && this.configurationData.publishing[i].IsDirty) {
          this.bIsConfigDirty = this.bIsConfigDirty || true;
          break;
        }
      }

      return this.bIsConfigDirty;
    })
      .catch(reason => {
        this.unsubscribeInitSubscriptions();  // Unsubscribe Init*** state subscriptions
        return Promise.reject(reason);
      });;
  }
}
