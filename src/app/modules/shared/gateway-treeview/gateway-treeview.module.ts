import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatTooltipModule} from '@angular/material/tooltip';

import { GwNotifierModule } from '@shared/gw-notifier/gw-notifier.module';
import { GatewayPipesModule } from '@shared/gateway-pipes/gateway-pipes.module';

import { GatewayTreeViewComponent } from './components/gateway-tree-view/gateway-tree-view.component';
import { GatewayCheckedTreeviewComponent } from './components/gateway-checked-treeview/gateway-checked-treeview.component';


@NgModule({
  declarations: [ GatewayTreeViewComponent, GatewayCheckedTreeviewComponent ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    A11yModule,
    MatTreeModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatIconModule,
    GwNotifierModule,
    GatewayPipesModule
  ],
  exports: [ GatewayTreeViewComponent, GatewayCheckedTreeviewComponent ]
})
export class GatewayTreeviewModule { 
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GatewayTreeviewModule
    };
  }
}
