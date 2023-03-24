import { Injectable } from '@angular/core';
import { FooterStatus, GwFooterService } from '@core/services/gw-footer-service.service';
import { SuresensModule } from '../suresens.module';

@Injectable({
  providedIn: SuresensModule
})
export class SureSENSFooterService {
  footerPanelStatus: FooterStatus = null;

  constructor( private gwFooterService: GwFooterService) {
      this.initializeFooter();
  }

  initializeFooter(): void {
    this.footerPanelStatus = {
      showPanelStatus: false,
      shiftWell: null,
      shifting: false,
      footerProperties: []
    };
    this.gwFooterService.updateFooterPanelStatus(this.footerPanelStatus);
  }
}
