import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GwErrorNotifierComponent } from './components/gw-error-notifier/gw-error-notifier.component';

// Angular material modules
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { GwNotifierDialogComponent } from './components/gw-notifier-dialog/gw-notifier-dialog.component';

@NgModule({
  declarations: [GwErrorNotifierComponent, GwNotifierDialogComponent],
  imports: [
    CommonModule,
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule
  ],
  exports: [ GwErrorNotifierComponent ],
  entryComponents: [GwNotifierDialogComponent]
})
export class GwNotifierModule {}
