import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular material modules
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

// Custom Pipes Module
import { GatewayDirectivesModule } from '@shared/gateway-directives/gateway-directives.module';
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';

import { DatasourceComponent } from './components/datasource/datasource.component';
import { SerialPortChannelComponent } from './components/channel/serialPortChannel.component';
import { CardComponent } from './components/card/card.component';

// Infragistics
import {
  IgxGridModule,
  IgxFocusModule,
  IgxTooltipModule
} from 'igniteui-angular';
import { GatewayDialogsModule } from '@shared/gateway-dialogs/gateway-dialogs.module';
import { GaugeDetailsComponent } from './components/gauge-details/gauge-details.component';
import { MultiProtocolChannelComponent } from './components/multi-protocol-channel/multiProtocolChannel.component';

@NgModule({
  declarations: [DatasourceComponent, SerialPortChannelComponent, CardComponent, GaugeDetailsComponent, MultiProtocolChannelComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonModule,
    MatTabsModule,
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
    GatewayDirectivesModule,
    GatewayPipesModule,
    GatewayDialogsModule.forRoot()
  ],
  exports: [ DatasourceComponent, SerialPortChannelComponent, CardComponent, MultiProtocolChannelComponent ],
  entryComponents: [
    GaugeDetailsComponent
  ]
})
export class CommunicationModule { 
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CommunicationModule,
      providers: []
    };
  }
}
