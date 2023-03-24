import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminGuard } from '@core/services/adminGaurd.service';

import { InforceMonitoringComponent } from './components/inforce-monitoring/inforce-monitoring.component';
import { SensorCalibrationComponent } from './components/sensor-calibration/sensor-calibration.component';
import { ManualModeComponent } from './components/manual-mode/manual-mode.component';
import { VentOutputComponent } from './components/vent-output/vent-output.component';
import { RecirculateComponent } from './components/recirculate/recirculate.component';
import { ToolboxComponent } from '@shared/monitoring/components/toolbox/toolbox.component';
import { CardDetailsComponent } from '@shared/monitoring/components/carddetails/card-details.component';
import { ToolDetailsComponent } from '@shared/monitoring/components/tooldetails/tooldetails.component';
import { AuthCard } from '@core/services/auth-card.service';
import { InforceViewShiftComponent } from './components/inforce-view-shift/inforce-view-shift.component';

export const routes: Routes = [
    // {
    //     path: '', component: InforceHomeComponent, children: [
            
    //         { path: 'general', component: GeneralSettingsComponent, canActivate: [AdminGuard], canDeactivate: [DirtyCheckGuard] },
    //         { path: 'clocksetting', component: ClockSettingsComponent, canActivate: [AdminGuard] },
    //         { path: 'networksetting', component: NetworkSettingsComponent, canActivate: [AdminGuard]},
    //         { path: 'well', component: InforceWellComponent, canActivate: [AdminGuard] },
    //         { path: 'well/:Id', component: InforceWellComponent, pathMatch: 'full'},
    //         { path: 'datasource', component: DatasourceComponent, canActivate: [AdminGuard], canDeactivate: [DirtyCheckGuard] },
    //         { path: 'datasource/:Id', component: DatasourceComponent, pathMatch: 'full' },
    //         { path: 'publishing', component: PublishingComponent, canActivate: [AdminGuard], canDeactivate: [DirtyCheckGuard] },
    //         { path: 'publishing/:Id', component: PublishingComponent, pathMatch: 'full' }
    //     ],
    // },
    // { path: 'dashboard', component: DashboardComponent, pathMatch: 'full', canActivate: [AdminGuard] },
    { 
        path: 'monitoring', children: [
            {path: '', component: InforceMonitoringComponent, pathMatch: 'full'},
            {path: ':welId', component: InforceMonitoringComponent, pathMatch: 'full'},
            { path: 'tool/:Id', component: ToolDetailsComponent, pathMatch: 'full', canActivate: [AuthCard] },
            { path: 'well/:wellId/viewshift', component: InforceViewShiftComponent, pathMatch: 'full', canActivate: [AuthCard] }
        ] 
    },
    { 
        path: 'toolbox', children: [
            {path: '', component: ToolboxComponent, pathMatch: 'full', canActivate: [AdminGuard] },
            { path: 'sensorcalibration', component: SensorCalibrationComponent, pathMatch: 'full', canActivate: [AdminGuard] },
            { path: 'manualmode', component: ManualModeComponent, pathMatch: 'full', canActivate: [AdminGuard] },
            { path: 'ventoutput', component: VentOutputComponent, pathMatch: 'full', canActivate: [AdminGuard] },
            { path: 'recirculate', component: RecirculateComponent, pathMatch: 'full', canActivate: [AdminGuard] }
        ] 
    },
    { path: 'card/:Id', component: CardDetailsComponent, pathMatch: 'full', canActivate: [AdminGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InforceRoutingModule { }
