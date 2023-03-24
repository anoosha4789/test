import { Routes } from '@angular/router';

import { DiagnosticsHomeComponent } from './components/diagnostics-home/diagnostics-home.component';
import { DataPointTrendComponent } from './components/data-point-trend/data-point-trend.component';
import { HistorianTrendComponent } from './components/historian-trend/historian-trend.component';
import { DatapointtableComponent } from './components/datapointtable/datapointtable.component';

export const routes: Routes = [
  {
    path: '',
    component: DiagnosticsHomeComponent,
    children: [
      { path: '', component: DatapointtableComponent },
      { path: 'PointViewer', component: DatapointtableComponent },
      { path: 'PointViewer/:deviceId', component: DatapointtableComponent,  pathMatch: 'full' },
      { path: 'PointTrend', component: DataPointTrendComponent },
      { path: 'HistorianTrend', component: HistorianTrendComponent },
      { path: 'LogMessagesViewer', component: DatapointtableComponent },
    ],
  },
  {
    path: 'PointViewer',
    component: DatapointtableComponent,
    pathMatch: 'full',
  },
  // { path: 'Diagnostics/PointViewer', component: DatapointviewerComponent},
  // { path: 'Diagnostics/PointTrend', component: DataPointTrendComponent},
  // { path: 'Diagnostics/HistorianTrend', component: HistorianTrendComponent },
  // { path: 'Diagnostics/LogMessagesViewer', component: DatapointviewerComponent },
];
