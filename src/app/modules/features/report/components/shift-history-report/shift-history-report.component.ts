import { Component, HostListener, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

import * as ShiftHistory from '@core/models/UIModels/shift-history-report-model';
import { ReportService } from '@core/services/report.service';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { UserService } from '@core/services/user.service';
import { Stimulsoft } from 'stimulsoft-reports-js/Scripts/stimulsoft.viewer'
import { forkJoin, Subscription } from 'rxjs';
import { ConfigurationService } from '@core/services/configurationService.service';

@Component({
  selector: 'app-shift-history-report',
  templateUrl: './shift-history-report.component.html',
  styleUrls: ['./shift-history-report.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ShiftHistoryReportComponent implements OnInit, OnDestroy {
  reportInfo = {
    createdBy: '',
    buildNumber: ''
  };
  private arrSubscriptions: Subscription[] = [];

  constructor(private router: Router, private reportService: ReportService,
    private modalService: GatewayModalService, private userService: UserService,
    private configurationService: ConfigurationService) { }

  ngOnInit(): void {
    const subscription = forkJoin([this.userService.GetCurrentLoginUser(),
    this.configurationService.getBuildNumber()]).subscribe(results => {
      this.reportInfo.createdBy = results[0].Name || null;
      this.reportInfo.buildNumber = results[1];
    });
    this.arrSubscriptions.push(subscription);

    this.getShiftHistory();
  }

  resizeTimer = null;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.getShiftHistory();
    }, 300);
  }

  getShiftHistory() {
    const subscription = this.reportService.getShiftHistoryData().pipe(take(1)).subscribe(res => {
      if (Array.isArray(res) && res.length) {
        let options = new Stimulsoft.Viewer.StiViewerOptions();
        options = this.reportService.setReportViewerOptions(options, Stimulsoft.Viewer);
        const viewer = new Stimulsoft.Viewer.StiViewer(options, 'StiViewer', false);
        Stimulsoft.Base.StiLicense.loadFromFile("assets/stimulsoft/license.key");
        viewer.report = this.getReportData(res);
        viewer.renderHtml("shiftReport");
        this.reportService.appendCustomButton(viewer, this.router);
      } else {
        this.modalService.openDialog(
          "No shift history available.",
          () => this.navToReport(),
          null,
          'Info',
          null,
          false,
          'Ok',
          null
        );
      }
    });
    this.arrSubscriptions.push(subscription);
  };


  navToReport() {

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigateByUrl("/downloads/reports");
    this.modalService.closeModal();
  }
  getReportData(shiftHistoryData: ShiftHistory.IShifttHistory[]) {

    let report = Stimulsoft.Report.StiReport.createNewReport();
    const reportData = this.generateReportData(shiftHistoryData);
    report.loadFile("assets/stimulsoft/templates/shift_history.mrt");
    return this.UpdateReportDataSet(report, reportData);
  }



  UpdateReportDataSet(report, reportData) {

    // Create new DataSet object
    let dataSet = new Stimulsoft.System.Data.DataSet("data");

    // Load JSON data file from specified URL to the DataSet object
    dataSet.readJson(reportData);

    // Remove all connections from the report template
    report.dictionary.databases.clear();

    // Register DataSet object
    report.regData("data", "data", dataSet);

    return report;
  }

  generateReportData(shiftHistoryData: ShiftHistory.IShifttHistory[]): ShiftHistory.ShiftHistoryReportModel {

    //Get current User

    let reportModel: ShiftHistory.ShiftHistoryReportModel = {
      Report: {
        Name: "SureFIELD™ Gateway Shift History Report",
        CreatedBy: this.reportInfo.createdBy,
        Build: this.reportInfo.buildNumber,
        PanelType: "InFORCE"
      },

      ShiftHistory: this.convertReturnsToInt(shiftHistoryData)

    };

    return reportModel;
  }


  //GATE - 875 Round the return Values 
  convertReturnsToInt(shiftHistoryList: ShiftHistory.IShifttHistory[]) {

    for (const shift of shiftHistoryList) {
      shift.ExpectedReturnVolume = Math.round(shift.ExpectedReturnVolume);
      shift.ActualReturnVolume = Math.round(shift.ActualReturnVolume);
    }
    return shiftHistoryList;
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }
    this.arrSubscriptions = [];
  }
}
