import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';

import { IUnitSystemState } from '@store/state/unit-system.state';
import * as ACTIONS from '@store/actions/unit-system.action';
import { PANELCONFIG_COMMON_LOAD } from '@store/actions/panelConfigurationCommon.action';
import { UnitSystemUIModel } from '@core/models/UIModels/unit-system.model';
import { StateUtilities } from '@store/state/IState';
import { UnitSystemModel } from '@core/models/webModels/UnitSystem.model';
import { PanelTypeList } from '@core/data/UICommon';
import { IPanelConfigurationCommonState } from '@store/state/panelConfigurationCommon.state';

@Component({
  selector: 'app-unit-system',
  templateUrl: './unit-system.component.html',
  styleUrls: ['./unit-system.component.scss'],
})
export class UnitSystemComponent implements OnInit, OnDestroy {
  @Output()
  unitSystemStateEmmiter = new EventEmitter<IUnitSystemState>();

  // State observables
  unitSystemModel$: Observable<IUnitSystemState>;
  private panelConfigurationCommon$: Observable<IPanelConfigurationCommonState>;

  // State Objects
  error$: Observable<any>;
  unitSystem: UnitSystemModel;
  private panelConfigurationCommonState: IPanelConfigurationCommonState;

  private arrSubscriptions: Subscription[] = [];

  constructor(private store: Store<{ panelConfigCommonState : IPanelConfigurationCommonState, unitSystemState: IUnitSystemState }>) {
    this.panelConfigurationCommon$ = this.store.select<any>((state: any) => state.panelConfigCommonState);
    this.unitSystemModel$ = this.store.select<IUnitSystemState>((state: any) => state.unitSystemState);
  }

  private subscribeToPanelConfigurationCommon(): void {
    const panelConfigSubscription = this.panelConfigurationCommon$.subscribe(
      (state: IPanelConfigurationCommonState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            // Dispatch Action if not loaded
            this.store.dispatch(PANELCONFIG_COMMON_LOAD());
          } else {
            this.panelConfigurationCommonState = state;
            this.subscribeToUnitSystems();
          }
        }
      }
    );

    this.arrSubscriptions.push(panelConfigSubscription);
  }

  private subscribeToUnitSystems() {
    const subscription = this.unitSystemModel$.subscribe(
      (state: IUnitSystemState) => {
        if (state !== undefined) {
          if (state.isLoaded === false || StateUtilities.hasErrors(state)) {
            // Dispatch Action if not loaded
            this.store.dispatch(ACTIONS.UNITSYSTEM_LOAD());
          } else {
            this.unitSystem = _.cloneDeep(state.unitSystem);
            if (this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE)
              this.setUpInFORCEDefaultUnits(state.isDirty);
          }
        }
      }
    );

    this.arrSubscriptions.push(subscription);
  }

  private setUpInFORCEDefaultUnits(isDirty: boolean): void {
    if (!isDirty && this.panelConfigurationCommonState.panelConfigurationCommon.Id < 0) {
      // Volume Flow Rate
      let unitIndex = this.unitSystem.UnitQuantities.findIndex(u => u.UnitQuantityName === "volume_flow_rate") ?? -1;
      if (unitIndex != -1) {
        this.unitSystem.UnitQuantities[unitIndex].SelectedUnitSymbol = "mL/min";

        const inxDisplay = this.unitSystem.UnitQuantities[unitIndex].SupportedUnitSymbols.findIndex(u => u.Key === "mL/min");
        if (inxDisplay != -1) {
          this.unitSystem.UnitQuantities[unitIndex].SelectedDisplayUnitSymbol = this.unitSystem.UnitQuantities[unitIndex].SupportedUnitSymbols[inxDisplay].Value;
        }
      }

      // Pressure
      unitIndex = this.unitSystem.UnitQuantities.findIndex(u => u.UnitQuantityName === "pressure") ?? -1;
      if (unitIndex != -1) {
        this.unitSystem.UnitQuantities[unitIndex].SelectedUnitSymbol = "psig";
        
        const inxDisplay = this.unitSystem.UnitQuantities[unitIndex].SupportedUnitSymbols.findIndex(u => u.Key === "psig");
        if (inxDisplay != -1) {
          this.unitSystem.UnitQuantities[unitIndex].SelectedDisplayUnitSymbol = this.unitSystem.UnitQuantities[unitIndex].SupportedUnitSymbols[inxDisplay].Value;
        }
      }

      const unitSystemState: IUnitSystemState = {
        isLoaded: true,
        isLoading: false,
        isValid: true,
        isDirty: true,
        unitSystem: this.unitSystem,
        error: '',
      };
      this.unitSystemStateEmmiter.emit(unitSystemState);
    }
  }

  // Unit System Dropdown Selection change
  onDropdownChange(unitQuantityName, symbol) {
    const unitIndex = this.unitSystem.UnitQuantities.findIndex(
      (u) => u.UnitQuantityName === unitQuantityName
    );
    if (unitIndex !== -1) {
      this.unitSystem.UnitQuantities[unitIndex].SelectedUnitSymbol = symbol;
      let inxDisplay = this.unitSystem.UnitQuantities[unitIndex].SupportedUnitSymbols.findIndex(u => u.Key === symbol);
      if (inxDisplay != -1) {
        this.unitSystem.UnitQuantities[unitIndex].SelectedDisplayUnitSymbol = this.unitSystem.UnitQuantities[unitIndex].SupportedUnitSymbols[inxDisplay].Value;
      }
    }

    const unitSystemState: IUnitSystemState = {
      isLoaded: true,
      isLoading: false,
      isValid: true,
      isDirty: true,
      unitSystem: this.unitSystem,
      error: '',
    };
    this.unitSystemStateEmmiter.emit(unitSystemState);
  }

  mapUnitSystemObj(unitQuantityName, symbol, dispalySymbol): UnitSystemUIModel {
    const unitSystem: UnitSystemUIModel = {
      UnitQuantityName: unitQuantityName,
      SelectedUnitSymbol: symbol,
      SelectedDisplayUnitSymbol: dispalySymbol
    };
    return unitSystem;
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }

    this.arrSubscriptions = [];
  }

  ngOnInit(): void {
    this.subscribeToPanelConfigurationCommon();
  }
}
