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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { PublishingComponent } from './components/publishing/publishing.component';
import { DataPublishingComponent } from './components/data-publishing/data-publishing.component';
import { MapTemplateDetailsComponent } from './components/map-template-details/map-template-details.component';

// Custom Pipes Module
import { GatewayDirectivesModule } from '@shared/gateway-directives/gateway-directives.module';
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';

// Infragistics
import {
  IgxGridModule,
  IgxFocusModule,
  IgxTooltipModule
} from 'igniteui-angular';
import { ModbusTemplatePointsComponent } from './components/modbus-template-points/modbus-template-points.component';
import { AddCustomModbusMapComponent } from './components/add-custom-modbus-map/add-custom-modbus-map.component';
import { AddEditCustomModbusMapComponent } from './components/create-custom-modbus-map/addEdit-custom-modbus-map.component';
import { GatewayTreeviewModule } from '@shared/gateway-treeview/gateway-treeview.module';
import { CustomMapsComponent } from './components/custom-maps/custom-maps.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AddDatapointsToCustomMapComponent } from './components/add-datapoints-to-custom-map/add-datapoints-to-custom-map.component';


@NgModule({
  declarations: [PublishingComponent, DataPublishingComponent, MapTemplateDetailsComponent, ModbusTemplatePointsComponent, AddCustomModbusMapComponent, AddEditCustomModbusMapComponent, CustomMapsComponent, AddDatapointsToCustomMapComponent],
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
    MatCheckboxModule,
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
  exports: [PublishingComponent, DataPublishingComponent, MapTemplateDetailsComponent],
  entryComponents: [
    AddCustomModbusMapComponent,
    CustomMapsComponent,
    AddDatapointsToCustomMapComponent
  ]
})
export class PublishingModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PublishingModule,
      providers: []
    };
  }
}
