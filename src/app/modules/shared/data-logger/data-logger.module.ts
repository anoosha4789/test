import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
// Angular Material Modules
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRadioModule } from '@angular/material/radio';

// Infragistics
import {
  IgxGridModule,
  IgxFocusModule,
  IgxTooltipModule
} from 'igniteui-angular';

// Custom Module
import { GatewayDirectivesModule } from '@shared/gateway-directives/gateway-directives.module';
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';
import { GatewayTreeviewModule } from '@shared/gateway-treeview/gateway-treeview.module';
import { AddEditDataLoggerDialogComponent } from './add-edit-data-logger-dialog/add-edit-data-logger-dialog.component';
import { LoggerDataPointsDialogComponent } from './logger-data-points-dialog/logger-data-points-dialog.component';
import { LoggerModbusTemplatePointsComponent } from './logger-modbus-template-points/logger-modbus-template-points.component';
import { IfieldDataloggerComponent } from './ifield-datalogger/ifield-datalogger.component';


@NgModule({
  declarations: [AddEditDataLoggerDialogComponent, LoggerDataPointsDialogComponent, LoggerModbusTemplatePointsComponent,IfieldDataloggerComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatRadioModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    IgxGridModule,
    IgxFocusModule,
    IgxTooltipModule,
    ScrollingModule,
    GatewayTreeviewModule,
    GatewayDirectivesModule,
    GatewayPipesModule
  ],
  entryComponents: [AddEditDataLoggerDialogComponent, LoggerDataPointsDialogComponent,IfieldDataloggerComponent]
})
export class DataLoggerModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DataLoggerModule,
      providers: []
    };
  }
}
