import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { StateUtilities } from "@store/state/IState";
import { initialPanelConfigurationCommon, IPanelConfigurationCommonState } from "@store/state/panelConfigurationCommon.state";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

import * as PANELCONFIG_COMMON_ACTIONS from '@store/actions/panelConfigurationCommon.action';

@Injectable({
    providedIn: 'root',
})
export class PanelConfigurationFacade {
    // State observables
    private panelConfigurationCommon$: Observable<IPanelConfigurationCommonState>;
    
    // State objects
    private panelConfigurationCommonState: IPanelConfigurationCommonState = initialPanelConfigurationCommon;

    // State Objects BehaviorSubject variables
    private panelConfigurationSubject = new BehaviorSubject<IPanelConfigurationCommonState>(initialPanelConfigurationCommon);

    // State Objects subscriptions variables
    private panelConfigSubscription: Subscription = null;
    
    constructor(protected store: Store<any>) {
        this.panelConfigurationCommon$ = this.store.select<any>((state: any) => state.panelConfigCommonState);
    }

    public getPanelTypeId(): number {
        if (this.panelConfigurationCommonState && this.panelConfigurationCommonState.panelConfigurationCommon)
            return this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId;
        
        return -1;
    }

    // setup subscriptions
    private subscribeToPanelConfigurationCommon(): void {
        if (this.panelConfigSubscription == null) {
            this.panelConfigSubscription = this.panelConfigurationCommon$.subscribe(
                (state: IPanelConfigurationCommonState) => {
                        if (state !== undefined) {
                            if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
                                // Dispatch Action if not loaded
                                this.store.dispatch(PANELCONFIG_COMMON_ACTIONS.PANELCONFIG_COMMON_LOAD());
                            } else {
                                this.panelConfigurationCommonState = state;
                                this.panelConfigurationSubject.next(this.panelConfigurationCommonState);
                            }
                        }
                    }
                );
        }
    }

    // initialize subscription methods
    public initPanelConfigurationCommon(): BehaviorSubject<IPanelConfigurationCommonState>{
        this.subscribeToPanelConfigurationCommon();
        return this.panelConfigurationSubject;
    }

    // Unsubscribe subscriptions/Reset subscriptions
    public unSubscribePanelConfigSubscription(): void {
      if (this.panelConfigSubscription != null) {
        this.panelConfigSubscription.unsubscribe();
        this.panelConfigSubscription = null;
      }


      // Reset state/entity objects here
      this.store.dispatch(PANELCONFIG_COMMON_ACTIONS.PANELCONFIG_COMMON_UPDATE({panelState: initialPanelConfigurationCommon}));
      this.panelConfigurationSubject.next(initialPanelConfigurationCommon);
    }
}