import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from '@core/services/adminGaurd.service';

// Feature module components
import { MultinodeHomeComponent } from './components/multinode-home/multinode-home.component';
import { GeneralSettingsComponent } from './components/general-settings/general-settings.component';

// Shared module components
import { ClockSettingsComponent } from '@shared/configuration/components/clock-settings/clock-settings.component';
import { NetworkSettingsComponent } from '@shared/configuration/components/network-settings/network-settings.component';
import { DashboardComponent } from '@shared/configuration/components/dashboard/dashboard.component';
import { SieComponent } from './components/sie/sie.component';
import { DatasourceComponent } from '@shared/communication/components/datasource/datasource.component';
import { MultinodeMonitoringComponent } from './components/multinode-monitoring/multinode-monitoring.component';
import { ToolboxComponent } from '@shared/monitoring/components/toolbox/toolbox.component';
import { ToolDetailsComponent } from '@shared/monitoring/components/tooldetails/tooldetails.component';
import { AuthCard } from '@core/services/auth-card.service';
import { CardDetailsComponent } from '@shared/monitoring/components/carddetails/card-details.component';
import { MultinodeAdvancedComponent } from './components/multinode-advanced/multinode-advanced.component';
import { PublishingComponent } from '@shared/publishing/components/publishing/publishing.component';
import { DirtyCheckGuard } from '@core/services/dirty-check-guard';
import { IfieldDataloggerComponent } from '@shared/data-logger/ifield-datalogger/ifield-datalogger.component';


export const routes: Routes = [
  {
    path: '', component: MultinodeHomeComponent, children: [
      { path: 'general', component: GeneralSettingsComponent, canActivate: [AdminGuard] },
      { path: 'sie', component: SieComponent, canActivate: [AdminGuard] },
      { path: 'sie/:Id', component: SieComponent, pathMatch: 'full', canActivate: [AdminGuard] },
      { path: 'clocksetting', component: ClockSettingsComponent, canActivate: [AdminGuard] },
      { path: 'networksetting', component: NetworkSettingsComponent, canActivate: [AdminGuard] },
      { path: 'datasource', component: DatasourceComponent, canActivate: [AdminGuard] },
      { path: 'datasource/:Id', component: DatasourceComponent, pathMatch: 'full', canActivate: [AdminGuard] },
      { path: 'publishing', component: PublishingComponent, canActivate: [AdminGuard], canDeactivate: [DirtyCheckGuard] },
      { path: 'publishing/:Id', component: PublishingComponent, pathMatch: 'full', canActivate: [AdminGuard] },
      { path: 'datalogger', component: IfieldDataloggerComponent, canActivate: [AdminGuard], canDeactivate: [DirtyCheckGuard] },
      { path: 'datalogger/:Id', component: IfieldDataloggerComponent, pathMatch: 'full', canActivate: [AdminGuard] }   
    ],
  },
  {
    path: 'monitoring', children: [
      { path: '', component: MultinodeMonitoringComponent, pathMatch: 'full' },
      { path: ':welId', component: MultinodeMonitoringComponent, pathMatch: 'full' },
      { path: 'tool/:Id', component: ToolDetailsComponent, pathMatch: 'full', canActivate: [AuthCard] },
      
    ]
  },
  { 
    path: 'toolbox', children: [
      {path: '', component: ToolboxComponent, pathMatch: 'full', canActivate: [AdminGuard] },
      { path: 'advanced', component: MultinodeAdvancedComponent, pathMatch: 'full', canActivate: [AdminGuard] },
  ] 

  },
  { path: 'card/:Id', component: CardDetailsComponent, pathMatch: 'full', canActivate: [AdminGuard] },
  { path: 'dashboard', component: DashboardComponent, pathMatch: 'full', canActivate: [AdminGuard] },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MultinodeRoutingModule { }
