import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular material modules
import { A11yModule } from '@angular/cdk/a11y';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';

// Custom Pipes Module
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';

import { BrowseFileDialogComponent } from './components/browse-file-dialog/browse-file-dialog.component';
import { ConfigurationResetDialogComponent } from './components/configuration-reset-dialog/configuration-reset-dialog.component';
import { GatewayModalService } from './services/gatewayModal.service';
import { GatewayDialogComponent, GatewayDialogDataService } from './components/gateway-dialog/gateway-dialog.component';
import { GatewayAdvancedDialogComponent } from './components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayInsertionDirective } from './directives/insertion.directive';
import { GatewayDialogInModalComponent } from './components/gateway-dialog-in-modal/gateway-dialog-in-modal.component';
import { DownloadConfirmDialogComponent } from './components/download-confirm-dialog/download-confirm-dialog.component';
import { GatewayBrowseFileDialogComponent } from './components/gateway-browse-file-dialog/gateway-browse-file-dialog.component';
import { AlarmsDialogComponent } from './components/alarms-dialog/alarms-dialog.component';

// Infragistics
import { IgxGridModule,IgxTooltipModule } from 'igniteui-angular';
import { IgxIconModule } from 'igniteui-angular';
import { EFVCComponent } from '@features/multinode/components/e-fvc/e-fvc.component';
import { EfcvPositionsDialogComponent } from '@features/multinode/components/efcv-positions-dialog/efcv-positions-dialog.component';
import { GatewayAlarmsDialogComponent } from './components/gateway-alarms-dialog/gateway-alarms-dialog.component';
import { SatPopoverModule } from '@ncstate/sat-popover';

@NgModule({
  declarations: [
    BrowseFileDialogComponent,
    ConfigurationResetDialogComponent,
    GatewayDialogComponent,
    GatewayAdvancedDialogComponent,
    GatewayInsertionDirective,
    GatewayDialogInModalComponent,
    DownloadConfirmDialogComponent,
    GatewayBrowseFileDialogComponent,
    AlarmsDialogComponent,
    GatewayAlarmsDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    A11yModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    GatewayPipesModule,
    IgxGridModule,
    IgxTooltipModule,
    IgxIconModule,
    SatPopoverModule
  ],
  exports: [
    BrowseFileDialogComponent,
    ConfigurationResetDialogComponent,
    GatewayDialogComponent,
    GatewayAdvancedDialogComponent
  ],
  entryComponents: [
    BrowseFileDialogComponent, 
    ConfigurationResetDialogComponent, 
    GatewayDialogComponent, 
    GatewayAdvancedDialogComponent, 
    GatewayDialogInModalComponent, 
    DownloadConfirmDialogComponent, 
    GatewayBrowseFileDialogComponent,
    AlarmsDialogComponent,
    GatewayAlarmsDialogComponent,
    EFVCComponent,
    EfcvPositionsDialogComponent
  ],
  providers: [GatewayModalService]
})
export class GatewayDialogsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GatewayDialogsModule
    };
  }
}
