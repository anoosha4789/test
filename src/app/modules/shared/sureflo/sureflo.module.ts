import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular material modules
import { A11yModule } from '@angular/cdk/a11y';
import {CdkTableModule} from '@angular/cdk/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import {MatTreeModule} from '@angular/material/tree';
import {MatListModule} from '@angular/material/list';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';

// BH module
import { ThemeLibModule, NavService } from 'bh-theme';

import { SurefloFlowmeterModule } from '@shared/sureflo-flowmeter/sureflo-flowmeter.module';
import { SurefloExFlowmeterModule } from '@shared/sureflo-ex-flowmeter/sureflo-ex-flowmeter.module';

import { SurefloGeneralInformationComponent } from './components/sureflo-general-information/sureflo-general-information.component';
import { SurefloDatapointDialogComponent } from './components/sureflo-datapoint-dialog/sureflo-datapoint-dialog.component';
import { SurefloStepperComponent } from './components/sureflo-stepper/sureflo-stepper.component';
import { SurefloCalibrationApplyDialogComponent } from './components/sureflo-calibration-apply-dialog/sureflo-calibration-apply-dialog.component';
import { SurefloCalibrationResetDialogComponent } from './components/sureflo-calibration-reset-dialog/sureflo-calibration-reset-dialog.component';
import { SurefloStepperGaugeDataComponent } from './components/sureflo-stepper-gauge-data/sureflo-stepper-gauge-data.component';
import { SurefloStepperExGaugeDataComponent } from './components/sureflo-stepper-ex-gauge-data/sureflo-stepper-ex-gauge-data.component';
import { GwNumberFormatterPipe } from '@shared/gateway-pipes/pipes/gw-number-formatter.pipe';


@NgModule({
  declarations: [SurefloStepperComponent, SurefloGeneralInformationComponent,  SurefloDatapointDialogComponent, SurefloCalibrationApplyDialogComponent, SurefloCalibrationResetDialogComponent, SurefloStepperGaugeDataComponent, SurefloStepperExGaugeDataComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    A11yModule,
    CdkTableModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTreeModule,
    MatListModule,
    MatSlideToggleModule,
    MatStepperModule,
    ThemeLibModule,
    SurefloFlowmeterModule,
    SurefloExFlowmeterModule
  ],
  exports: [SurefloStepperComponent],
  entryComponents: [SurefloDatapointDialogComponent, SurefloCalibrationApplyDialogComponent, SurefloCalibrationResetDialogComponent],
  providers: [GwNumberFormatterPipe]
})

export class SurefloModule {}
