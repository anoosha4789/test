import { Component, Input, OnInit } from '@angular/core';

import { DownloadService } from '@core/services/Download.service';
import { DownloadFileCriteriaModel, LoggerTypeEnum } from '@core/models/webModels/DownloadFileCriteria.model';
import { DownloadFilePropertyModel } from '@core/models/webModels/DownloadFileProperty.model';

@Component({
  selector: 'app-tool-data-files',
  templateUrl: './tool-data-files.component.html',
  styleUrls: ['./tool-data-files.component.scss']
})
export class ToolDataFilesComponent implements OnInit {

  @Input() cardPortList;
  
  isDownloadInProgress: boolean = false;
  validationMessage:string;
  selectedReportType: string;
  selectedTimeFrame: string;
  downloadStartDate: Date;
  downloadEndDate: Date;
  displayStartDate: string;
  displayEndDate: string;
  // cardPortList: string[];
  timeFrames: string[]= ['1 day', '7 days', '30 days', '60 days', '90 days', 'All'];
  downloadFileCriteriaModel: DownloadFileCriteriaModel = new DownloadFileCriteriaModel();
  fileList: DownloadFilePropertyModel[] = new Array();

  constructor(private downloadService: DownloadService) { }

  onDownloadBtnClick() {
    this.validationMessage=null;
        this.downloadFileCriteriaModel.BeginDateTime = this.displayStartDate;
        this.downloadFileCriteriaModel.EndDateTime = this.displayEndDate;
        this.downloadFileCriteriaModel.LoggerType = LoggerTypeEnum.GaugeData;
        this.downloadFileCriteriaModel.LoggerSubType = this.selectedReportType;
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

  getCardPortDropDownvalues() {
    this.downloadService.getcardFolderNames().subscribe(
      result => {
        if (result) {
          this.cardPortList = [];
          const cardFolderNames = result;
          if (cardFolderNames) {
            let filenameIndex;
            for (let i = 0; i < cardFolderNames.length; i++) {
              filenameIndex = cardFolderNames[i].lastIndexOf('\\');//for windows
              if (filenameIndex == -1) {
                filenameIndex = cardFolderNames[i].lastIndexOf('/');//for linux
              }
              this.cardPortList.push(cardFolderNames[i].substr(filenameIndex + 1));
            }
            this.selectedReportType = this.cardPortList[0];
          }
        }
      });
  }

  // On Data Dropdown Chnage
  onDataSelChange(event) {
    this.validationMessage = null;
    this.selectedReportType = event.value;
  }

  // On Time Frame Dropdown change
  onTimeFrameSelChange(event) {
    this.setTimeFrame(event.value);
  }

  setTimeFrame(timeFrame: string) {
    this.validationMessage = null;
    this.selectedTimeFrame = timeFrame;
    this.downloadStartDate = new Date((new Date().getMonth() + 1) + "/" + new Date().getDate() + "/" + new Date().getFullYear());
    this.downloadEndDate = new Date((new Date().getMonth() + 1) + "/" + new Date().getDate() + "/" + new Date().getFullYear());
    this.setDownloadStartDate(timeFrame);
    this.displayStartDate = this.downloadStartDate.getFullYear() + "/" + (this.downloadStartDate.getMonth() + 1) + "/" + this.downloadStartDate.getDate();
    this.displayEndDate = this.downloadEndDate.getFullYear() + "/" + (this.downloadEndDate.getMonth() + 1) + "/" + this.downloadEndDate.getDate();

    if (timeFrame == 'All') {
      this.displayStartDate = "2001/1/1";
      this.displayEndDate = this.downloadEndDate.getFullYear() + "/" + (this.downloadEndDate.getMonth() + 1) + "/" + this.downloadEndDate.getDate();
    }
  }

  // Set Download Start Date
  setDownloadStartDate(timeFrame: string) {
     switch (timeFrame) {
       case '1 day':
        this.downloadStartDate.setDate(this.downloadStartDate.getDate() - 1);
        break;

      case '7 days':
        this.downloadStartDate.setDate(this.downloadStartDate.getDate() - 7);
        break;
        case '30 days':
        this.downloadStartDate.setDate(this.downloadStartDate.getDate() - 30);
        break;

      case '60 days':
        this.downloadStartDate.setDate(this.downloadStartDate.getDate() - 60);
        break;
      
        case '90 days':
          this.downloadStartDate.setDate(this.downloadStartDate.getDate() - 90);
          break;
     }
  }

  onDownloadCancelEvent(status: boolean) {
    this.isDownloadInProgress = !status;
  }

  onDownloadSuccessEvent(status: boolean) {
    this.isDownloadInProgress = !status;
  }

  ngOnInit(): void {
    // this.getCardPortDropDownvalues();
    this.selectedReportType = this.cardPortList ? this.cardPortList[0] : null;
    this.selectedTimeFrame = this.timeFrames[0];
    this.setTimeFrame(this.selectedTimeFrame);
  }

}

