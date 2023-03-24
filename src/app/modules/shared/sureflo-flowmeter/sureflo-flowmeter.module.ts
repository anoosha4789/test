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

import { SurefloGaugeDataComponent } from './components/sureflo-gauge-data/sureflo-gauge-data.component';
import { SurefloPvtDataComponent } from './components/sureflo-pvt-data/sureflo-pvt-data.component';
import { SurefloAdditionalParamComponent } from './components/sureflo-additional-param/sureflo-additional-param.component';
import { SurefloCalibrationDialogComponent } from './components/sureflo-calibration-dialog/sureflo-calibration-dialog.component';
import { SurefloWaterPvtDataComponent } from './components/sureflo-water-pvt-data/sureflo-water-pvt-data.component';
import { GatewayDirectivesModule } from '@shared/gateway-directives/gateway-directives.module';


@NgModule({
  declarations: [SurefloGaugeDataComponent, SurefloPvtDataComponent, SurefloAdditionalParamComponent, SurefloCalibrationDialogComponent, SurefloWaterPvtDataComponent],
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
  exports: [SurefloGaugeDataComponent, SurefloPvtDataComponent, SurefloAdditionalParamComponent, SurefloWaterPvtDataComponent],
  entryComponents: [SurefloCalibrationDialogComponent]
})  
export class SurefloFlowmeterModule { }
