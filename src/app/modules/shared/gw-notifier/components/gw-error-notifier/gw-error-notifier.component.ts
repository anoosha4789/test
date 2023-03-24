import { Component, Input, OnInit } from '@angular/core';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { GwNotifierDialogComponent, GwNotifierDialogData } from '../gw-notifier-dialog/gw-notifier-dialog.component';

@Component({
  selector: 'gw-error-notifier',
  templateUrl: './gw-error-notifier.component.html',
  styleUrls: ['./gw-error-notifier.component.scss']
})
export class GwErrorNotifierComponent implements OnInit {
  
  @Input() errorsList;

  count: number;
  gwNotifierDialogData: GwNotifierDialogData;
  
  constructor(private gatewayModalService: GatewayModalService) { }

  ngOnInit(): void {
    this.count = this.getErrorCount(this.errorsList);
    this.gwNotifierDialogData = this.errorsList;
  }

  
  // Gate -1237
  getErrorCount(data){
    let count = 0;
    data.forEach(element => {
      count += element.errors.length;
    });
    return count;
  }


  showModal(event) {
    this.gatewayModalService.openAdvancedDialog(
      'Error Messages',
      ButtonActions.None,
      GwNotifierDialogComponent,
      this.gwNotifierDialogData,
      (result) => {
        this.gatewayModalService.closeModal();
      },
      '420px',
      null,
      null,
      null
    );
    // To fix Redirect issue 
    event.stopPropagation()
  
  }

}
