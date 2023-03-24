import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular material modules
import { A11yModule } from '@angular/cdk/a11y';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import {MatRadioModule} from '@angular/material/radio';
import {MatCheckboxModule} from '@angular/material/checkbox';

import { SurefloExGaugeDataComponent } from './components/sureflo-ex-gauge-data/sureflo-ex-gauge-data.component';
import { SurefloExPvtDataComponent } from './components/sureflo-ex-pvt-data/sureflo-ex-pvt-data.component';
import { SurefloExAdditionalParamComponent } from './components/sureflo-ex-additional-param/sureflo-ex-additional-param.component';
import { SurefloExCalibrationDialogComponent } from './components/sureflo-ex-calibration-dialog/sureflo-ex-calibration-dialog.component';
import { SurefloExFilterParmComponent } from './components/sureflo-ex-filter-parm/sureflo-ex-filter-parm.component';
import { SurefloExGasPvtDataComponent } from './components/sureflo-ex-gas-pvt-data/sureflo-ex-gas-pvt-data.component';
import { SurefloExWaterPvtDataComponent } from './components/sureflo-ex-water-pvt-data/sureflo-ex-water-pvt-data.component';
import { GatewayDirectivesModule } from '@shared/gateway-directives/gateway-directives.module';


@NgModule({
  declarations: [SurefloExGaugeDataComponent, SurefloExPvtDataComponent, SurefloExAdditionalParamComponent, SurefloExCalibrationDialogComponent, SurefloExFilterParmComponent, SurefloExGasPvtDataComponent, SurefloExWaterPvtDataComponent],
  imports: [
    CommonModule,
    A11yModule,
    FormsModule,
    ReactiveFormsModule,
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
    MatRadioModule,
    MatCheckboxModule,
    GatewayDirectivesModule
  ],
  exports: [SurefloExGaugeDataComponent, SurefloExPvtDataComponent, SurefloExAdditionalParamComponent, SurefloExPvtDataComponent, SurefloExGasPvtDataComponent, SurefloExWaterPvtDataComponent],
  entryComponents: [SurefloExCalibrationDialogComponent]
})
export class SurefloExFlowmeterModule { }
