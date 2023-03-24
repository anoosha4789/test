import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Module routes
import { DownloadsRoutingModule } from './downloads-routing.module';

// Angular material modules
import { A11yModule } from '@angular/cdk/a11y';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTreeModule } from '@angular/material/tree';
import { MatTooltipModule } from '@angular/material/tooltip';

import { GwLayoutModule } from '@shared/gw-layout/gw-layout.module';
import { GatewayDialogsModule } from '@shared/gateway-dialogs/gateway-dialogs.module';

import { AuthCard } from '@core/services/auth-card.service';
import { DownloadHomeComponent } from './components/download-home/download-home.component';
import { DataFilesComponent } from './components/data-files/data-files.component';
import { SystemDiagnosticsComponent } from './components/system-diagnostics/system-diagnostics.component';
import { LogFilesComponent } from './components/log-files/log-files.component';
import { DownloadProgressBarComponent } from './components/download-progress-bar/download-progress-bar.component';
import { ToolDataFilesComponent } from './components/tool-data-files/tool-data-files.component';
import { MultinodeBackupComponent } from './components/multinode-backup/multinode-backup.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BackupContentComponent } from './components/multinode-backup/backup-content/backup-content.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';

@NgModule({
  declarations: [
    DownloadHomeComponent,
    DataFilesComponent,
    SystemDiagnosticsComponent,
    LogFilesComponent,
    DownloadProgressBarComponent,
    ToolDataFilesComponent,
    MultinodeBackupComponent,
    BackupContentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    A11yModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTreeModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    DownloadsRoutingModule,
    NgxLoadingModule.forRoot({}),
    GwLayoutModule,
    GatewayDialogsModule
  ],
  providers: [AuthCard]
})
export class DownloadsModule { }
