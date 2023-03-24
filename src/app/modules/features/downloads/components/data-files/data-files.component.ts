import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UICommon } from '@core/data/UICommon';
import { DownloadService } from '@core/services/Download.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-data-files',
  templateUrl: './data-files.component.html',
  styleUrls: ['./data-files.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DataFilesComponent implements OnInit {

  activeTabIndex = 0;
  cardPortList: string[];
  toolTabVisibility = true;

  constructor(private downloadService: DownloadService,  private router: Router) { }

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
            const isConfigSaved = JSON.parse(window.sessionStorage.getItem('isConfigSaved'));
            this.toolTabVisibility =  isConfigSaved && this.cardPortList && this.cardPortList.length > 0 ? true : false;
          }
        }
      });
  }

  ngOnInit(): void {
    this.router.onSameUrlNavigation = "ignore"
    this.getCardPortDropDownvalues();
  }
  
  onTabChanged($event): void {
  }
}
