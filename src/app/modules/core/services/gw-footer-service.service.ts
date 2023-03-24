import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GwFooterService {

  private _footerPanelStatusSubject = new Subject<FooterStatus>();
  footerPanelStatus: FooterStatus;
  isLoadApiCalled: boolean = true;
  
  private isOperationInProgress :boolean =false;
  private _isOperationInProgressSubject = new BehaviorSubject<boolean>(false);

  constructor() { }

  updateFooterPanelStatus(footerStatus: FooterStatus): void {
    this.footerPanelStatus = {
      showPanelStatus: footerStatus.showPanelStatus,
      shifting: footerStatus.shifting,
      shiftWell: footerStatus.shiftWell,
      footerProperties: footerStatus.footerProperties
    };
    this._footerPanelStatusSubject.next(this.footerPanelStatus)
  }

  subscribeToFooterPanelStatus(): Subject<FooterStatus> {
    return this._footerPanelStatusSubject;
  }

  updateOperationInProgressStatus(IsOperationInProgress :boolean):void{
    this.isOperationInProgress = IsOperationInProgress;
    this._isOperationInProgressSubject.next(this.isOperationInProgress)
  }

  subscribeToOperationStatus(): BehaviorSubject<boolean> {
    return this._isOperationInProgressSubject;
  }
}

// Footer Panel
export enum footerStatusType {
  OperationMode = 1,
  Normal,
  Input
}

export class ShiftWell {
  wellId: number;
  navigateAddress: string;
}

export class FooterProperties {
  DisplayName: string;
  Status: string;
  statusType: footerStatusType;
  hide?: boolean;
}

export class FooterStatus {
  showPanelStatus: boolean;
  shifting: boolean;
  shiftWell: ShiftWell;
  footerProperties: FooterProperties[];
}
