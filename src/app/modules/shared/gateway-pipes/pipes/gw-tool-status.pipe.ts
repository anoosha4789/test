import { Pipe, PipeTransform } from '@angular/core';
import { UICommon } from '@core/data/UICommon';
import { InChargeMonitoringTool } from '@core/models/UIModels/monitoring.model';
import { UtilityService } from '@core/services/utility.service';

@Pipe({
  name: 'gwToolStatus',
  pure: false
})
export class GwToolStatusPipe implements PipeTransform {

  constructor(private utilityService: UtilityService) {}

  transform(tool: any, pageIdx: number) {
    let tooltipText = null;
    switch (pageIdx) {
      case PAGE.TOOL_DETAILS:
        tooltipText = this.utilityService.getToolStatus(tool); // Tool Details Page
        break;

      case PAGE.CARD_DETAILS:
        tooltipText = this.getCardDetailToolStatus(tool); // Card Detail Page
        break;

      case PAGE.MONITORING:
        tooltipText = this.getMonitoringToolStatus(tool); // Monitoring Page
        break;
    }
    return tooltipText;
  }

  getMonitoringToolStatus(tool: InChargeMonitoringTool) {
    let toolStatus = null;
    if (tool.diagnosticsDevice.RawValue === -999 && tool.pressureDevice.RawValue === -999 && tool.temperatureDevice.RawValue === -999) {
      toolStatus = UICommon.CARD_STATUS_DISCONNECT;
    } else {
      toolStatus = this.utilityService.getToolStatus(tool.diagnosticsDevice.RawValue);
    }
    return toolStatus;
  }

  getCardDetailToolStatus(tool: any) {
    return this.utilityService.getToolStatus(tool.toolDiagnosticCode);
  }

  
}

enum PAGE {
  TOOL_DETAILS = 0,
  CARD_DETAILS = 1,
  MONITORING = 2
}
