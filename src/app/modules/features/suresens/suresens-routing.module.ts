import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from '@core/services/adminGaurd.service';

// Feature module components
import { GeneralSettingComponent } from '@features/suresens/components/general-setting/general-setting.component';
import { SuresensHomeComponent } from '@features/suresens/components/suresens-home/suresens-home.component';
import { SuresensWellComponent } from '@features/suresens/components/suresens-well/suresens-well.component';
import { DatasourceComponent } from '@shared/communication/components/datasource/datasource.component';

// Shared module components
import { ClockSettingsComponent } from '@shared/configuration/components/clock-settings/clock-settings.component';
import { NetworkSettingsComponent } from '@shared/configuration/components/network-settings/network-settings.component';
import { DashboardComponent } from '@shared/configuration/components/dashboard/dashboard.component';
import { SuresensMonitoringComponent } from './components/suresens-monitoring/suresens-monitoring.component';
import { ToolboxComponent } from '@shared/monitoring/components/toolbox/toolbox.component';
import { PublishingComponent } from '@shared/publishing/components/publishing/publishing.component';
import { ToolDetailsComponent } from '@shared/monitoring/components/tooldetails/tooldetails.component';
import { AuthCard } from '@core/services/auth-card.service';
import { CardDetailsComponent } from '@shared/monitoring/components/carddetails/card-details.component';
import { SurefloDetailsComponent } from '@shared/monitoring/components/sureflodetails/sureflodetails.component';
import { IfieldDataloggerComponent } from '@shared/data-logger/ifield-datalogger/ifield-datalogger.component';

export const routes: Routes = [

  {
    path: '', component: SuresensHomeComponent, children: [
      { path: 'general', component: GeneralSettingComponent, canActivate: [AdminGuard] },
      { path: 'clocksetting', component: ClockSettingsComponent, canActivate: [AdminGuard] },
      { path: 'networksetting', component: NetworkSettingsComponent, canActivate: [AdminGuard] },
      { path: 'well', component: SuresensWellComponent, canActivate: [AdminGuard] },
      { path: 'well/:Id', component: SuresensWellComponent, pathMatch: 'full' },
      { path: 'datasource', component: DatasourceComponent, canActivate: [AdminGuard] },
      { path: 'datasource/:Id', component: DatasourceComponent, pathMatch: 'full' },
      { path: 'publishing', component: PublishingComponent, canActivate: [AdminGuard]},
      { path: 'publishing/:Id', component: PublishingComponent, pathMatch: 'full' },
      { path: 'datalogger', component: IfieldDataloggerComponent, canActivate: [AdminGuard]},
      { path: 'datalogger/:Id', component: IfieldDataloggerComponent, pathMatch: 'full' }       
    ],
  },
  { path: 'dashboard', component: DashboardComponent, pathMatch: 'full', canActivate: [AdminGuard] },
  {
    path: 'monitoring', children: [
      { path: '', component: SuresensMonitoringComponent, pathMatch: 'full' },
      { path: 'tool/:Id', component: ToolDetailsComponent, pathMatch: 'full', canActivate: [AuthCard] },
      { path: 'sureflo/:Id', component: SurefloDetailsComponent, pathMatch: 'full', canActivate: [AuthCard] }
    ]
  },
  { path: 'toolbox', component: ToolboxComponent, pathMatch: 'full', canActivate: [AdminGuard] },
  { path: 'card/:Id', component: CardDetailsComponent, pathMatch: 'full', canActivate: [AdminGuard] },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuresensRoutingModule { }
