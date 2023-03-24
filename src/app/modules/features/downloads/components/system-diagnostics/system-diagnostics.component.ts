import { Component, OnInit } from '@angular/core';

import { DownloadFileCriteriaModel, LoggerTypeEnum } from '@core/models/webModels/DownloadFileCriteria.model';
import { DownloadFilePropertyModel } from '@core/models/webModels/DownloadFileProperty.model';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { DownloadService } from '@core/services/Download.service';

@Component({
  selector: 'app-system-diagnostics',
  templateUrl: './system-diagnostics.component.html',
  styleUrls: ['./system-diagnostics.component.scss']
})
export class SystemDiagnosticsComponent implements OnInit {

  isDownloadInProgress: boolean = false;
  validationMessage:string;
  currentFileName: string;
  downloadFileCriteriaModel: DownloadFileCriteriaModel;
  fileList: DownloadFilePropertyModel[] = new Array();

  constructor(private gatewayModalService: GatewayModalService, private downloadService: DownloadService) { }

  onDownloadBtnClick() {
   
    this.validationMessage = null;
    this.downloadFileCriteriaModel = new DownloadFileCriteriaModel();
    this.downloadFileCriteriaModel.BeginDateTime = "2001/1/1";
    this.downloadFileCriteriaModel.EndDateTime = "2001/1/1";
    this.downloadFileCriteriaModel.LoggerType = LoggerTypeEnum.Diagnostics;
    this.downloadFileCriteriaModel.LoggerSubType = "";
    this.downloadService.getdownloadFileFullPathBasedOnTimeRange(this.downloadFileCriteriaModel).subscribe(
        result => {
            if (result && result.length > 0) {
                this.fileList = result;
                this.isDownloadInProgress = true;
            }
            else
            {
                this.validationMessage="No files available for download."
            }
        });
  }

  onDownloadCancelEvent(param: boolean) {
    this.isDownloadInProgress = !param;

  }
  onDownloadSuccessEvent(param: boolean) {
    this.isDownloadInProgress = !param;
  }

 

  ngOnInit(): void {
  }

}

