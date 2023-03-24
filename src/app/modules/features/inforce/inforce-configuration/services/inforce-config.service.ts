import { Injectable } from '@angular/core';
import { GwFeatureModuleService } from '@core/services/gw-feature-module.service';
import { Store } from '@ngrx/store';
import { IPanelDefaultState } from '@store/state/panel-default.state';
import { IShiftDefaultState } from '@store/state/shift-default.state';
import { Observable, Subscription } from 'rxjs';
import { InforceConfigurationModule } from '../inforce-configuration.module';

@Injectable({
  providedIn: InforceConfigurationModule
})
export class InforceConfigService {

  shiftDefaultState$: Observable<IShiftDefaultState>;
  panelDefaultState$: Observable<IPanelDefaultState>;

  private arrSubscriptions: Subscription[] = [];

  constructor(protected store: Store, private gwFeatureModuleService: GwFeatureModuleService) {
    this.shiftDefaultState$ = this.store.select<IShiftDefaultState>((state: any) => state.shiftDefaultState);
    this.panelDefaultState$ = this.store.select<IPanelDefaultState>((state: any) => state.panelDefaultState);

    this.subscribeToShiftDefault();
    this.subscribeToPanelDefault();
  }

  private subscribeToShiftDefault() {
    const subscription = this.shiftDefaultState$.subscribe(
      (state: IShiftDefaultState) => {
        if (state !== undefined) {
          this.gwFeatureModuleService.updateConfigDirtyNotifier(
            {
              sectionName: "ShiftDefaults",
              isConfigDirty: state.isDirty,
              isValidState: state.isValid
            }
          );
          if (state.shiftDefaults.returnBasedError) {
            this.gwFeatureModuleService.updateErrorNotifier(
              {
                sectionName: "ReturnsBased",
                isConfigDirty: state.isDirty,
                isValidState: state.isValid,
                errorNotifier: state.shiftDefaults.returnBasedError
              }
            );
          }
          else {
            this.gwFeatureModuleService.clearErrorNotifier("ReturnsBased");
          }
          if (state.shiftDefaults.timeBasedError) {
            this.gwFeatureModuleService.updateErrorNotifier(
              {
                sectionName: "TimeBased",
                isConfigDirty: state.isDirty,
                isValidState: state.isValid,
                errorNotifier: state.shiftDefaults.timeBasedError
              }
            );
          }
          else {
            this.gwFeatureModuleService.clearErrorNotifier("TimeBased");
          }
        }
      }
    );

    this.arrSubscriptions.push(subscription);
  }

  private subscribeToPanelDefault() {
    const subscription = this.panelDefaultState$.subscribe(
      (state: IPanelDefaultState) => {
        if (state !== undefined) {
          this.gwFeatureModuleService.updateConfigDirtyNotifier(
            {
              sectionName: "PanelDefaults",
              isConfigDirty: state.isDirty,
              isValidState: state.isValid
            }
          );
          if (state.panelDefaults.error) {
            this.gwFeatureModuleService.updateErrorNotifier(
              {
                sectionName: "PanelDefaults",
                isConfigDirty: state.isDirty,
                isValidState: state.isValid,
                errorNotifier: state.panelDefaults.error
              }
            );
          }
          else {
            this.gwFeatureModuleService.clearErrorNotifier("PanelDefaults");
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }
}
