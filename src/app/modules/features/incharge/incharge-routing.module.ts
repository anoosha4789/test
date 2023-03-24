import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InchargeHomeComponent } from './components/incharge-home/inchargeHome.component';
import { GeneralsettingsComponent } from './components/generalsettings/generalsettings.component';
import { AdminGuard } from '@core/services/adminGaurd.service';
import { DirtyCheckGuard } from '@core/services/dirty-check-guard';
import { DatasourceComponent } from '@shared/communication/components/datasource/datasource.component';
import { DashboardComponent } from '@shared/configuration/components/dashboard/dashboard.component';
import { ClockSettingsComponent } from '@shared/configuration/components/clock-settings/clock-settings.component';
import { NetworkSettingsComponent } from '@shared/configuration/components/network-settings/network-settings.component';
import { PublishingComponent } from '@shared/publishing/components/publishing/publishing.component';
import { WellComponent } from './components/well/well.component';
import { InChargeMonitoringComponent } from './components/incharge-monitoring/incharge-monitoring.component';
import { ToolboxComponent } from '@shared/monitoring/components/toolbox/toolbox.component';
import { ToolDetailsComponent } from '@shared/monitoring/components/tooldetails/tooldetails.component';
import { CardDetailsComponent } from '@shared/monitoring/components/carddetails/card-details.component';
import { ShiftComponent } from './components/shift/shift.component';
import { AuthCard } from '@core/services/auth-card.service';
import { SurefloDetailsComponent } from '@shared/monitoring/components/sureflodetails/sureflodetails.component';

export const routes: Routes = [
    { path: '', component: InChargeMonitoringComponent, pathMatch: 'full' },
    {
        path: '', component: InchargeHomeComponent, children: [
            //{ path: '', component: GeneralsettingsComponent, canActivate: [AdminGuard], canDeactivate: [DirtyCheckGuard] },
            { path: 'general', component: GeneralsettingsComponent, canActivate: [AdminGuard], canDeactivate: [DirtyCheckGuard] },
            { path: 'clocksetting', component: ClockSettingsComponent, canActivate: [AdminGuard] },
            { path: 'networksetting', component: NetworkSettingsComponent, canActivate: [AdminGuard]},
            { path: 'well', component: WellComponent, canActivate: [AdminGuard], canDeactivate: [DirtyCheckGuard] },
            { path: 'well/:Id', component: WellComponent, pathMatch: 'full' },
            { path: 'datasource', component: DatasourceComponent, canActivate: [AdminGuard], canDeactivate: [DirtyCheckGuard] },
            { path: 'datasource/:Id', component: DatasourceComponent, pathMatch: 'full' },
            { path: 'publishing', component: PublishingComponent, canActivate: [AdminGuard], canDeactivate: [DirtyCheckGuard] },
            { path: 'publishing/:Id', component: PublishingComponent, pathMatch: 'full' },
        ],
    },
    { 
        path: 'monitoring', children: [
            {path: '', component: InChargeMonitoringComponent, pathMatch: 'full'},
            { path: 'tool/:Id', component: ToolDetailsComponent, pathMatch: 'full', canActivate: [AuthCard] },
            { path: 'sureflo/:Id', component: SurefloDetailsComponent, pathMatch: 'full', canActivate: [AuthCard] }
        ] 
    },
    { path: 'toolbox', component: ToolboxComponent, pathMatch: 'full', canActivate: [AdminGuard] },
    { path: 'card/:Id', component: CardDetailsComponent, pathMatch: 'full', canActivate: [AdminGuard] },
    { path: 'dashboard', component: DashboardComponent, pathMatch: 'full', canActivate: [AdminGuard] },
    { path: 'shift', component: ShiftComponent, pathMatch: 'full', canActivate: [AuthCard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InchargeRoutingModule { }
