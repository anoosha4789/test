import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthCard } from '@core/services/auth-card.service';

import { DataFilesComponent } from './components/data-files/data-files.component';
import { DownloadHomeComponent } from './components/download-home/download-home.component';
import { MultinodeBackupComponent } from './components/multinode-backup/multinode-backup.component';

export const routes: Routes = [
  { path: '', component: DownloadHomeComponent, pathMatch: 'full', canActivate: [AuthCard] },
  {
    path: '',
    component: DownloadHomeComponent,
    children: [
      { path: '', component: DownloadHomeComponent, canActivate: [AuthCard] },
      { path: 'datafiles', component: DataFilesComponent, pathMatch: 'full', canActivate: [AuthCard] },
      { path: 'backup', component: MultinodeBackupComponent, pathMatch: 'full', canActivate: [AuthCard] },
      { path: 'reports', loadChildren: () => import('@features/report/report.module').then(m => m.ReportModule), canActivate: [AuthCard] }
    ],
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DownloadsRoutingModule { }

