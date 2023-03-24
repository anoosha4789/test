import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ThemeLibModule, NavService } from 'bh-theme';

// Material/ Baker Design Components
import { A11yModule } from '@angular/cdk/a11y';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';

// Infragistics
import {
  IgxGridModule,
  IgxFocusModule,
  IgxTooltipModule
} from 'igniteui-angular';


import { GwNotifierModule } from '@shared/gw-notifier/gw-notifier.module';
// Custom Pipes Module
import { GatewayDirectivesModule } from '@shared/gateway-directives/gateway-directives.module';
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';

// Module Components
import { GeneralSettingsComponent } from './components/generalsettings/generalsettings.component';
import { UnitSystemComponent } from './components/unit-system/unit-system.component';
import { UserAccountsComponent } from './components/useraccounts/useraccounts.component';
import { ErrorHandlingSettingsComponent } from './components/error-handling-settings/error-handling-settings.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClockSettingsComponent } from './components/clock-settings/clock-settings.component';
import { NetworkSettingsComponent } from './components/network-settings/network-settings.component';
import { UserInfoComponent } from './components/user-info/user-info.component';
import { GatewayTreeviewModule } from '@shared/gateway-treeview/gateway-treeview.module';
import { SaveConfigurationComponent } from './components/save-configuration/save-configuration.component';
import { ConfigurationSummaryService } from './services/configuration-summary.service';
import { SatPopoverModule } from '@ncstate/sat-popover';


@NgModule({
  declarations: [
    GeneralSettingsComponent,
    UnitSystemComponent,
    UserAccountsComponent,
    ErrorHandlingSettingsComponent,
    DashboardComponent,
    ClockSettingsComponent,
    NetworkSettingsComponent,
    UserInfoComponent,
    SaveConfigurationComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ThemeLibModule,
    A11yModule,
    MatListModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDividerModule,
    IgxGridModule,
    IgxFocusModule,
    IgxTooltipModule,
    MatIconModule,
    ScrollingModule,
    GwNotifierModule,
    GatewayTreeviewModule,
    GatewayDirectivesModule,
    GatewayPipesModule,
    SatPopoverModule
  ],
  exports: [
    GeneralSettingsComponent,
    UnitSystemComponent,
    UserAccountsComponent,
    UserInfoComponent,
    ErrorHandlingSettingsComponent
  ],
  entryComponents: [
    UserInfoComponent,
    SaveConfigurationComponent
  ],
  providers: [ ConfigurationSummaryService, TitleCasePipe ]
})
export class ConfigurationModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ConfigurationModule,
      providers: [NavService],
    };
  }
}
