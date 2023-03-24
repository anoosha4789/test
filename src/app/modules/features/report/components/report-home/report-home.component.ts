import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ReportService } from '@core/services/report.service';

import { Subscription } from 'rxjs';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { PanelTypeList } from '@core/data/UICommon';
import { Router } from '@angular/router';
@Component({
  selector: 'app-report-home',
  templateUrl: './report-home.component.html',
  styleUrls: ['./report-home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportHomeComponent implements OnInit, OnDestroy {

  reportVisibility = false;
  isInforce = false;
  isMultiNode = false;
  activeTabIndex: number;
  modbusMapList = [];
  private arrSubscriptions: Subscription[] = [];

  constructor(private reportService: ReportService, private panelConfigFacade: PanelConfigurationFacade, private router: Router) { }

  onTabChanged(event): void {
    // console.log(event.tab.textLabel);
  }

  ngOnInit(): void {
    const subsciption = this.reportService.getAllCustomMapNamesfromDB().subscribe((res) => {
      if (res && res.length > 0) this.modbusMapList = res;
    });
    this.arrSubscriptions.push(subsciption);
    this.getPanelType();
    this.reportVisibility = JSON.parse(window.sessionStorage.getItem('isConfigSaved'));
  }

  getPanelType() {
    const panelTypeId = this.panelConfigFacade.getPanelTypeId();
    if (panelTypeId == PanelTypeList.INFORCE) {
      this.isInforce = true;
    } else if (panelTypeId == PanelTypeList.MultiNode) {
      this.isMultiNode = true;
    }

  }
  // Lifecycle methods
  ngOnDestroy(): void {
    if (this.arrSubscriptions && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription)
          subscription.unsubscribe();
      });
    }
    this.arrSubscriptions = [];
  }

}
