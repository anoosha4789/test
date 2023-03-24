import { Component, HostListener, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as AlarmHistory from '@core/models/UIModels/alarm-history-report-model';
import { ReportService } from '@core/services/report.service';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { Stimulsoft } from 'stimulsoft-reports-js/Scripts/stimulsoft.viewer'
import { UserService } from '@core/services/user.service';
import { forkJoin, Subscription } from 'rxjs';
import { ConfigurationService } from '@core/services/configurationService.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { PanelTypeList } from '@core/data/UICommon';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-alarm-history-report',
  templateUrl: './alarm-history-report.component.html',
  styleUrls: ['./alarm-history-report.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AlarmHistoryReportComponent implements OnInit, OnDestroy {
  reportInfo = {
    createdBy: '',
    buildNumber: ''
  };
  private arrSubscriptions: Subscription[] = [];
  private datePipe = new DatePipe('en-US');

  constructor(private router: Router, private reportService: ReportService, private modalService: GatewayModalService,
    private userService: UserService,
    private panelConfigFacade: PanelConfigurationFacade,
    private configurationService: ConfigurationService) { }

  ngOnInit(): void {
    const subscription = forkJoin([this.userService.GetCurrentLoginUser(),
    this.configurationService.getBuildNumber()]).subscribe(results => {
      this.reportInfo.createdBy = results[0].Name || null;
      this.reportInfo.buildNumber = results[1];
    });
    this.arrSubscriptions.push(subscription);
    this.getAlarmHistory();
  }

  resizeTimer = null;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.getAlarmHistory();
    }, 300);
  }

  getAlarmHistory() {
    const subscription = this.reportService.getAlarmHistoryData().pipe(take(1)).subscribe(res => {
      if (Array.isArray(res) && res.length) {
        let options = new Stimulsoft.Viewer.StiViewerOptions();
        options = this.reportService.setReportViewerOptions(options, Stimulsoft.Viewer);
        const viewer = new Stimulsoft.Viewer.StiViewer(options, 'StiViewer', false);
        Stimulsoft.Base.StiLicense.loadFromFile("assets/stimulsoft/license.key");
        viewer.report = this.getReportData(res);
        viewer.renderHtml("alarmReport");
        this.reportService.appendCustomButton(viewer, this.router);
        //  this.appendCustomButton(this.router);

      } else {
        //const modalConfig = {
        //  size: 'sm',
        //  header: "Info",
        //  body: "No alarm history available.",
        //  priamryButtonText: "Ok",
        // route: "/Reports"
        //};
        //this.modalService.init(GwModalComponent, modalConfig, {});

        this.modalService.openDialog(
          'No alarm history available.',
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
  }

  navToReport() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigateByUrl("/downloads/reports");
    this.modalService.closeModal();
  }

  convertUtcToLocalDate(dateString) {
    let date = this.datePipe.transform(dateString, "yyyy-MM-dd HH:mm:ss");
    return new Date(date + " UTC").toString();
  }

  getReportData(shiftHistoryData: any[]) {
    const panelTypeId = this.panelConfigFacade.getPanelTypeId();
    let isMultinode = panelTypeId == PanelTypeList.MultiNode;
    if (isMultinode) {
      shiftHistoryData?.map(data => {
        data.Start_UTC_DateTime = this.convertUtcToLocalDate(data.Start_UTC_DateTime);
        return data;
      });
    }
    let report = Stimulsoft.Report.StiReport.createNewReport();
    const reportData = this.generateReportData(shiftHistoryData, panelTypeId);
    if (isMultinode) {
      report.loadFile("assets/stimulsoft/templates/multinode_alarm_history.mrt");
    } else {
      report.loadFile("assets/stimulsoft/templates/alarm_history.mrt");
    }

    return this.UpdateReportDataSet(report, reportData);
  }

  generateReportData(alarmHistoryData: AlarmHistory.IAlarmtHistory[] | AlarmHistory.IMultiNodeAlarmHistory[], panelTypeId): AlarmHistory.AlarmHistoryReportModel {
    let reportModel: AlarmHistory.AlarmHistoryReportModel = {
      Report: {
        Name: "SureFIELD™ Gateway Alarm History Report",
        CreatedBy: this.reportInfo.createdBy,
        Build: this.reportInfo.buildNumber,
        PanelType: panelTypeId === PanelTypeList.MultiNode ? "MultiNode" : "InFORCE"
      },

      AlarmHistory: alarmHistoryData

    };

    return reportModel;
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
