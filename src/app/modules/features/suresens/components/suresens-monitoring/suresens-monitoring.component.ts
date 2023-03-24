import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { WellFacade } from '@core/facade/wellFacade.service';
import { SureSENSWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { UserService } from '@core/services/user.service';
import { PanelTypeList } from '@core/data/UICommon';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { SureSENSPanelModel } from '@core/models/webModels/PanelConfigurationCommon.model';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-suresens-monitoring',
    templateUrl: './suresens-monitoring.component.html',
    styleUrls: ['./suresens-monitoring.component.scss']
})
export class SuresensMonitoringComponent extends GatewayPanelBase implements OnInit, OnDestroy {
    wells: SureSENSWellDataUIModel[];
    wellId: number;
    selectedTabIndex: number = 0;
    selectedWell: string = "";

    showTabAnimation = false;

    animationStepDuration = 0;
    private dataSubscriptions: Subscription[] = [];
    // private intervalSubscriptions: Subscription[] = [];

    constructor(protected store: Store,
        private router: Router,
        private panelConfigFacade: PanelConfigurationFacade,
        private wellDataFacade: WellFacade,
        private elementRef: ElementRef,
        private userService: UserService,
        protected route: ActivatedRoute) {
        super(store, panelConfigFacade, wellDataFacade, null, null, null, null);
    }

    onTabChanged(event): void {
        this.selectedWell = this.wells[this.selectedTabIndex]?.WellName;
        let address = `suresens/monitoring?well=${this.wells[this.selectedTabIndex]?.WellId}`;
        this.router.navigateByUrl("/" + address);
    }

    postCallGetWells(): void {
        this.wells = this.wellEnity.filter(Px=>Px.WellDeviceId > 0) ?? [];
        if (this.wells && this.wells.length > 0) {
            if (this.wellId) {
                this.selectedTabIndex = this.wellEnity.findIndex(w => w.WellId === this.wellId) ?? 0;
            }
            this.selectedWell = this.wells[this.selectedTabIndex]?.WellName;
        }
    }

    postCallGetPanelConfigurationCommon(): void {
        this.getLoginDetails();
    }

    getLoginDetails() {
        this.userService.GetCurrentLoginUser().then(user => {
            if (!user || user.Name === 'Open') {
                const panelConfigaration = this.panelConfigurationCommonState.panelConfigurationCommon as SureSENSPanelModel;
                if (panelConfigaration.PanelTypeId === PanelTypeList.SURESENS && panelConfigaration.ToggleEnabled && panelConfigaration.ToggleIntervalInSec > 0) {
                    this.showTabAnimation = true;
                    this.animationStepDuration = panelConfigaration.ToggleIntervalInSec * 1000;
                } else {
                    this.showTabAnimation = false;
                }
            } else {
                this.showTabAnimation = false;
            }
        });
    }

    /* clearTimeoutCall() {
        if (this.intervalSubscriptions != null && this.intervalSubscriptions.length > 0) {
            this.intervalSubscriptions.forEach(subscription => {
                if (subscription != null) {
                    subscription.unsubscribe();
                    subscription = null;
                }
            });
        }
        this.intervalSubscriptions = [];
    } */

    animateTab() {
        this.selectedTabIndex = ((this.selectedTabIndex + 1) % this.wells.length);
        /* this.clearTimeoutCall();
        let animationSubscription = interval(this.animationStepDuration).pipe(take(1)).subscribe(() => {
            this.selectedTabIndex = ((this.selectedTabIndex + 1) % this.wells.length);
        });
        this.intervalSubscriptions.push(animationSubscription); */
    }

    trackByWellId(index: number, well: any): string {
        return well.WellId;
    }

    getQueryParameters() {
        this.route.queryParams.subscribe(
            params => {
                this.wellId = parseInt(params['well']);
            }
        );
    }
    public onTabAnimationDone(): void {
        const inactiveTabs = this.elementRef.nativeElement.querySelectorAll(
            '.mat-tab-body-active .mat-tab-body-content > .tab-container:not(:first-child)'
        );

        inactiveTabs.forEach(tab => tab.remove());
    }
   /*  @HostListener("window:visibilitychange", ['$event'])
    public onVisibilityChange(event) {
        let visibility = event.target?.visibilityState;
        if (visibility !== "visible") {
            this.clearTimeoutCall();
        }
    } */
    ngOnDestroy(): void {
        // this.clearTimeoutCall();
        if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
            this.dataSubscriptions.forEach(subscription => {
                if (subscription != null) {
                    subscription.unsubscribe();
                    subscription = null;
                }
            });
        }

        this.dataSubscriptions = [];
        this.wells = [];
        super.ngOnDestroy();
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.getQueryParameters();
        this.initWells();
        this.initPanelConfigurationCommon();
        let subscription = this.userService.GetLoginLogoutStatus().subscribe(bIsLoggedIn => {
            this.getLoginDetails();
        });
        this.dataSubscriptions.push(subscription);
    }

}
