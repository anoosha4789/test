import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { WellFacade } from '@core/facade/wellFacade.service';
import { InchargeWellUIModel } from '@core/models/UIModels/Incharge.well.model';
import { Store } from '@ngrx/store';

@Component({
  selector: 'incharge-monitoring',
  templateUrl: './incharge-monitoring.component.html',
  styleUrls: ['./incharge-monitoring.component.scss']
})
export class InChargeMonitoringComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  wells: InchargeWellUIModel[];
  wellId: number;
  selectedTabIndex: number = 0;
  selectedWell: string = "";
  
  constructor(protected store: Store,
    private router: Router,
    private wellDataFacade: WellFacade,
    protected route: ActivatedRoute) { 
      super(store, null, wellDataFacade, null, null, null, null);
  }

  onTabChanged(event): void {
    //this.selectedWell = event.tab.textLabel;
    this.selectedWell = this.wells[this.selectedTabIndex]?.WellName;
    let address = `incharge/monitoring?well=${this.wells[this.selectedTabIndex]?.WellId}`;
    this.router.navigateByUrl("/" + address);
  }

  postCallGetWells(): void {
    this.wells = this.wellEnity??[];
    if (this.wells && this.wells.length > 0) {
      if (this.wellId) {
        this.selectedTabIndex = this.wellEnity.findIndex(w => w.WellId === this.wellId)??0;
      }
      this.selectedWell = this.wells[this.selectedTabIndex].WellName;
    }
  }

  getQueryParameters() {
    this.route.queryParams.subscribe( 
      params => { 
        this.wellId = parseInt(params['well']);
      } 
    );
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.route.queryParams.subscribe( 
      params => { 
        this.wellId = parseInt(params['well']);
        this.wells = this.wellEnity??[];
        if (this.wells && this.wells.length > 0) {
          if (this.wellId) {
            this.selectedTabIndex = this.wellEnity.findIndex(w => w.WellId === this.wellId)??0;
          } else this.selectedTabIndex = 0;
          this.selectedWell = this.wells[this.selectedTabIndex].WellName;
        }    
      } 
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.getQueryParameters();
    this.initWells();
  }

}
