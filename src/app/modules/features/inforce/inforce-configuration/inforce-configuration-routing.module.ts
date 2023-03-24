import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminGuard } from '@core/services/adminGaurd.service';
import { DirtyCheckGuard } from '@core/services/dirty-check-guard';

import { InforceHomeComponent } from './components/inforce-home/inforce-home.component';
import { GeneralSettingsComponent } from './components/general-settings/general-settings.component';
import { InforceWellComponent } from './components/inforce-well/inforce-well.component';
import { DashboardComponent } from '@shared/configuration/components/dashboard/dashboard.component';
import { ClockSettingsComponent } from '@shared/configuration/components/clock-settings/clock-settings.component';
import { NetworkSettingsComponent } from '@shared/configuration/components/network-settings/network-settings.component';
import { DatasourceComponent } from '@shared/communication/components/datasource/datasource.component';
import { PublishingComponent } from '@shared/publishing/components/publishing/publishing.component';
import { AuthCard } from '@core/services/auth-card.service';
import { AddEditDataLoggerDialogComponent } from '@shared/data-logger/add-edit-data-logger-dialog/add-edit-data-logger-dialog.component';
import { IfieldDataloggerComponent } from '@shared/data-logger/ifield-datalogger/ifield-datalogger.component';

export const routes: Routes = [
    {
        path: '', component: InforceHomeComponent, children: [
            
            { path: 'general', component: GeneralSettingsComponent, canActivate: [AdminGuard], canDeactivate: [DirtyCheckGuard] },
            { path: 'clocksetting', component: ClockSettingsComponent, canActivate: [AdminGuard] },
            { path: 'networksetting', component: NetworkSettingsComponent, canActivate: [AdminGuard]},
            { path: 'well', component: InforceWellComponent, canActivate: [AdminGuard] },
            { path: 'well/:Id', component: InforceWellComponent, pathMatch: 'full'},
            { path: 'datasource', component: DatasourceComponent, canActivate: [AdminGuard], canDeactivate: [DirtyCheckGuard] },
            { path: 'datasource/:Id', component: DatasourceComponent, pathMatch: 'full' },
            { path: 'publishing', component: PublishingComponent, canActivate: [AdminGuard], canDeactivate: [DirtyCheckGuard] },
            { path: 'publishing/:Id', component: PublishingComponent, pathMatch: 'full' },
            { path: 'datalogger', component: IfieldDataloggerComponent, canActivate: [AdminGuard] },
            { path: 'datalogger/:Id', component: IfieldDataloggerComponent, pathMatch: 'full' }            
        ],
    },
    { path: 'dashboard', component: DashboardComponent, pathMatch: 'full', canActivate: [AdminGuard] },
    // { 
    //     path: 'monitoring', children: [
    //         {path: '', component: InforceMonitoringComponent, pathMatch: 'full'},
    //         {path: ':welId', component: InforceMonitoringComponent, pathMatch: 'full'},
    //         { path: 'tool/:Id', component: ToolDetailsComponent, pathMatch: 'full', canActivate: [AuthCard] },
    //         { path: 'well/:wellId/viewshift', component: InforceViewShiftComponent, pathMatch: 'full', canActivate: [AuthCard] }
    //     ] 
    // },
    // { 
    //     path: 'toolbox', children: [
    //         {path: '', component: ToolboxComponent, pathMatch: 'full', canActivate: [AdminGuard] },
    //         { path: 'sensorcalibration', component: SensorCalibrationComponent, pathMatch: 'full', canActivate: [AdminGuard] },
    //         { path: 'manualmode', component: ManualModeComponent, pathMatch: 'full', canActivate: [AdminGuard] },
    //         { path: 'ventoutput', component: VentOutputComponent, pathMatch: 'full', canActivate: [AdminGuard] },
    //         { path: 'recirculate', component: RecirculateComponent, pathMatch: 'full', canActivate: [AdminGuard] }
    //     ] 
    // },
    // { path: 'card/:Id', component: CardDetailsComponent, pathMatch: 'full', canActivate: [AdminGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InforceConfigurationRoutingModule { }
