import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { saveAs, FileSaverOptions } from 'file-saver';

import { DownloadFileCriteriaModel } from '@core/models/webModels/DownloadFileCriteria.model';
import { DownloadFilePropertyModel } from '@core/models/webModels/DownloadFileProperty.model';
import { DownloadService } from '@core/services/Download.service';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';

@Component({
  selector: 'app-download-progress-bar',
  templateUrl: './download-progress-bar.component.html',
  styleUrls: ['./download-progress-bar.component.scss']
})
export class DownloadProgressBarComponent implements OnInit, OnChanges, OnDestroy {

  @Input() isDownloadInProgress: boolean;
  @Input() fileList: DownloadFilePropertyModel[];

  @Output() stopDownloadEvent = new EventEmitter();
  @Output() successDownloadEvent = new EventEmitter();

  public isDownLoadComplete: boolean;
  public holdDownloadProgress: boolean = false;
  public isfilesenttobrowserfordownload: boolean = false;
  public currentFileName: string;
  public progressPercentage: number = 0;
  public totalFilesCount: number;
  public downloadedFilesCount: number = 0;
  public validationmessage: string;
  downloadErr: string = "Error downloading"
  public timerverify: number;
  public downloadFailedList: string[];
  downloadFileCriteriaModel: DownloadFileCriteriaModel = new DownloadFileCriteriaModel();

  constructor(private downloadService: DownloadService, private gatewayModalService: GatewayModalService) { }

  verifyDownloadStatus() {
    if (this.isfilesenttobrowserfordownload) {
      this.postDownloadCall();
    }
  }

  public downloadFileContent() {
  
    if (this.fileList && this.fileList.length > 0) {
      this.totalFilesCount = this.fileList.length;
      let array: string[] = new Array();
      array.push(this.fileList[this.downloadedFilesCount].FileFullPath);
      let filenameIndex = array[0].lastIndexOf('\\');//for windows
      if (filenameIndex == -1)
        filenameIndex = array[0].lastIndexOf('/');//for linux
      this.currentFileName = array[0].substr(filenameIndex + 1);
      if (!this.isDownLoadComplete)
        this.downloadService.getdownloadFileData(array).subscribe(
          result => {
            try {
              saveAs(new Blob([result]), array[0].substr(filenameIndex + 1));
              this.isfilesenttobrowserfordownload = true;
            }
            catch (error) {
              this.downloadFailedList.push(this.currentFileName);
              this.validationmessage = this.downloadErr + " " + this.downloadFailedList.length + " file(s).";
              this.isfilesenttobrowserfordownload = true;//to continue next download
            }
          },
          error => {
            this.downloadFailedList.push(this.currentFileName);
            this.validationmessage = this.downloadErr + " " + this.downloadFailedList.length + " file(s).";
            this.isfilesenttobrowserfordownload = true;//to continue next download
          }
        );
    }
  }

  postDownloadCall() {
    this.downloadedFilesCount++;//increment the counter
    this.progressPercentage = (this.downloadedFilesCount / this.fileList.length) * 100;//update progress bar
    if (this.downloadedFilesCount == this.totalFilesCount) {
      this.isDownLoadComplete = true;
     // this.currentFileName = "None"; -- commenting this line for GATE-1957
      setTimeout(() => {
        this.successDownloadEvent.emit(true);
      }, 5000);
      clearInterval(this.timerverify);
    }
    this.isfilesenttobrowserfordownload = false;
    this.resumeFileDownload();
  }

  resumeFileDownload() {
    if (this.downloadedFilesCount < this.totalFilesCount && this.holdDownloadProgress == false) {
      this.downloadFileContent();//download next file until all files are completed
    }
  }
  
  stopDownloadClick() {
    this.holdDownloadProgress = true;
  }

  getprogressPercentage() {
    if(this.downloadedFilesCount === this.totalFilesCount) {

    }
   return this.progressPercentage;
  }
  
  finishDownload() {
    this.successDownloadEvent.emit(true);
  }

  onCancelBtnClick() {
    this.holdDownloadProgress = true;
    this.gatewayModalService.openDownloadConfirmDialog();
    this.gatewayModalService.confirmed().subscribe((result) => {
      if (result && result === true) {
      this.isDownloadInProgress = false;
      this.stopDownloadEvent.emit(true);
      } else if(result && result === 'resume') {
        this.holdDownloadProgress = false;
        this.resumeFileDownload();
      }
    });
  }

  onRefreshBtnClick() {
    this.isDownloadInProgress =false;
    this.stopDownloadEvent.emit(true);
  }

  ngOnChanges() {
    if (this.isDownloadInProgress) {
      //restarts the download process
      this.downloadedFilesCount = 0;
      this.isDownLoadComplete = false;
      this.holdDownloadProgress = false;
      this.progressPercentage = 0;
      this.validationmessage = null;
      this.downloadFailedList = [];
      clearInterval(this.timerverify);
      this.timerverify = window.setInterval(() => this.verifyDownloadStatus(), 1000);
      this.downloadFileContent();
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    clearInterval(this.timerverify);
  }

}
