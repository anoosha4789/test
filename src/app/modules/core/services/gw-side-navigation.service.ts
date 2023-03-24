import { Injectable } from '@angular/core';

import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { InchargeWellUIModel } from '@core/models/UIModels/Incharge.well.model';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { SuresensWellUIModel } from '@core/models/UIModels/suresens.well.model';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';

import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';

import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { CommunicationChannelType, MultiNodeDefaults, PANEL_ROUTES, UICommon } from '@core/data/UICommon';
import { String } from 'typescript-string-operations';
import { CustomDataLoggerConfiguration } from '@core/models/webModels/DataLogger.model';
import { MultiNodeWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { MultiNodeCommon } from '@features/multinode/common/multiNodeCommon';
import { SieUIModel } from '@core/models/UIModels/sie.model';
@Injectable({
  providedIn: 'root'
})
export class GwSideNavigationService {
  multinodeWellModel: any[];

  constructor(private panelConfigFacade: PanelConfigurationFacade,
    private wellDataFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private publishingFacade: PublishingChannelFacade) { }

  constructSideNavigation(
    panelRouteType: string,
    wellList: SuresensWellUIModel[] | InchargeWellUIModel[] | InforceWellUIModel[] | MultiNodeWellDataUIModel[],
    dataSources: DataSourceUIModel[],
    publishingList: PublishingDataUIModel[],
    dataLoggerList: CustomDataLoggerConfiguration[],
    sies: SieUIModel[]) {

    const navList = {
      navItems: null,
      stepper: null,
    };

    if (!panelRouteType) {
      return navList;
    }

    let isConfigSaved = false;
    if (GatewayPanelBase.ShowNavigation) {
      let sideNavItems: any[] = [
        {
          displayName: 'General Settings',
          iconName: 'construction',
          route: `${panelRouteType}/general`,
        }
      ];
      if (panelRouteType === PANEL_ROUTES.MULTINODE) {




        this.multinodeWellModel = [];
        let sieNavItem = {
          displayName: 'SIUs',
          iconName: 'view_array',
          route: `${panelRouteType}/sie`,
          children: []
        };

        if (sies.length > 0 && sies) {
          sies.forEach(item => {
            let sieChildNavItem = {
              //displayName: item.Name,
              displayName: item.error ? item.currentSieName : item.Name,
              iconName: 'view_array',
              parent: 'SIUs',
              route: `${panelRouteType}/sie/${item.Id}`,
              children: []
            };
            sieNavItem.children.push(sieChildNavItem);

            isConfigSaved = isConfigSaved || item.Id >= 0;
          })
          if (sies.length < MultiNodeDefaults.SIU_MAX_LIMIT) {
            sieNavItem.children.push({
              parent: 'SIUs',
              displayName: 'Add SIU',
              iconName: 'add',
              route: `${panelRouteType}/sie/`,
            });
          }
          sideNavItems.push(sieNavItem)
        }
        else {
          sideNavItems.push({
            displayName: 'SIUs',
            iconName: 'view_array',
            route: `${panelRouteType}/sie`,
            children: [
              {
                parent: 'SIUs',
                displayName: 'Add SIU',
                iconName: 'add',
                route: `${panelRouteType}/sie/`,
              }
            ]
          });
        }
      } else {

        // Side Navigation  Well Items
        if (wellList && wellList.length > 0) {
          let wellNavItem = {
            displayName: 'Wells',
            iconName: 'view_array',
            route: `${panelRouteType}/well`,
            children: []
          };

          wellList.forEach((well, index) => {

            wellNavItem.children.push({
              parent: 'Wells',
              iconName: 'arrow_right',
              displayName: well.Error ? well.currentWellName : well.WellName,
              route: `${panelRouteType}/well/${well.WellId}`
            });

            isConfigSaved = isConfigSaved || well.WellId >= 0;
          });

          wellNavItem.children.push({
            parent: 'Wells',
            displayName: 'Add Well',
            iconName: 'add',
            route: `${panelRouteType}/well/`,
          });

          sideNavItems.push(wellNavItem);
        } else {
          sideNavItems.push({
            displayName: 'Wells',
            iconName: 'view_array',
            route: `${panelRouteType}/well`,
            children: [
              {
                parent: 'Wells',
                displayName: 'Add Well',
                iconName: 'add',
                route: `${panelRouteType}/well/`,
              }
            ]
          });
        }
      }


      // Side Navigation Items
      if (dataSources && dataSources.length > 0) {
        let dataSourcesNav = {
          displayName: 'Data Sources',
          iconName: 'settings_input_component',
          route: `${panelRouteType}/datasource`,
          children: []
        };

        dataSources.forEach((dataSource, index) => {
          let channel = dataSource.Channel.channelType == 0 ? dataSource.Channel as SerialPortCommunicationChannelDataUIModel
            : dataSource.Channel as TcpIpCommunicationChannelDataUIModel;

          dataSourcesNav.children.push({
            parent: 'Data Sources',
            // displayName: String.Format('Source {0}', index + 1),
            displayName: this.dataSourceFacade.getDataSourceName(dataSource.Channel),
            iconName: 'arrow_right',
            route: `${panelRouteType}/datasource/${channel.IdCommConfig}`,
          });

          isConfigSaved = isConfigSaved || channel.IdCommConfig >= 0;
        });

        dataSourcesNav.children.push({
          parent: 'Data Sources',
          iconName: 'add',
          displayName: 'Add Data Source',
          route: `${panelRouteType}/datasource/`,
        });

        sideNavItems.push(dataSourcesNav);
      } else {
        sideNavItems.push({
          displayName: 'Data Sources',
          iconName: 'source',
          route: `${panelRouteType}/datasource`,
          children: [
            {
              parent: 'Data Sources',
              displayName: 'Add Data Source',
              iconName: 'add',
              route: `${panelRouteType}/datasource/`,
            }
          ]
        });
      }

      // Data Publishing Nav Item
      let publishingNavItem = {
        displayName: 'Realtime Data',
        iconName: 'timeline',
        route: `${panelRouteType}/publishing`,
        children: []
      };

      // Data Publishing - Start
      if (publishingList && publishingList.length > 0) {

        publishingList.forEach((publishing, index) => {
          publishingNavItem.children.push({
            parent: 'Realtime Data',
            iconName: 'arrow_right',
            displayName: this.publishingFacade.getPublishingName(publishing).Name,
            route: `${panelRouteType}/publishing/${publishing.Id}`,
          });
        });

        if (!UICommon.IsImportConfig) {

          publishingNavItem.children.push({
            parent: 'Realtime Data',
            displayName: 'Add Realtime Data',
            iconName: 'add',
            route: isConfigSaved ? `${panelRouteType}/publishing/` : null,
          });
        }
        sideNavItems.push(publishingNavItem);

      } else {
       sideNavItems.push(publishingNavItem);
      }

      // Data Publishing - End

      // Data Logger - Start
      let dataLoggerNavItem = {
        displayName: 'Data Logger',
        iconName: 'list_alt',
        route:  isConfigSaved ? `${panelRouteType}/datalogger/newdatalogger` : `${panelRouteType}/datalogger`,
        children: []
      };
      if (UICommon.IsImportConfig) {
        dataLoggerNavItem.route = `${panelRouteType}/datalogger`;
      }

      if (dataLoggerList && dataLoggerList.length > 0) {
        dataLoggerList.forEach((datalogger, index) => {
          if (datalogger.IsDeleted == 0) {
            dataLoggerNavItem.children.push({
              parent: 'Data Logger',
              iconName: 'arrow_right',
              displayName: datalogger.Name,
              route: `${panelRouteType}/datalogger/${datalogger.Id}`,
            });
          }
        })

   
      if (!UICommon.IsImportConfig) {
        dataLoggerNavItem.children.push({
          parent: 'Data Logger',
          displayName: 'Add Data Logger',
          iconName: 'add',
          route: `${panelRouteType}/datalogger/newdatalogger`,
        });
      }
      sideNavItems.push(dataLoggerNavItem);
    }
    else{
      sideNavItems.push(dataLoggerNavItem);
    }
      // Data Logger - End

      sideNavItems.push({
        displayName: 'Clock Settings',
        iconName: 'schedule',
        route: `${panelRouteType}/clocksetting`,
      });

      sideNavItems.push({
        displayName: 'Network Settings',
        iconName: 'router',
        route: `${panelRouteType}/networksetting`,
      });

      navList.stepper = null;
      navList.navItems = sideNavItems;

    } else {
      // Stepper Navigation items
      const stepperNavItems: any[] = [
        {
          label: 'General Information',
          desc: '',
          state: 'number',
          route: `${panelRouteType}/general`,
          completed: false
        },
        {
          label: panelRouteType === PANEL_ROUTES.MULTINODE ? 'Add an SIU' : 'Add Well',
          desc: '',
          state: 'number',
          route: panelRouteType === PANEL_ROUTES.MULTINODE ? `${panelRouteType}/sie` : `${panelRouteType}/well`,
          completed: false
        }
      ];

      if (panelRouteType !== PANEL_ROUTES.INFORCE_CONFIGURATION && panelRouteType !== PANEL_ROUTES.MULTINODE) {
        stepperNavItems.push(
          {
            label: 'Add Data Source',
            desc: '',
            state: 'number',
            route: `${panelRouteType}/datasource`,
            completed: false
          });
      }

      navList.navItems = null;
      navList.stepper = stepperNavItems;
    }

    return navList;
  }
}
