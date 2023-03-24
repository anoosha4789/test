import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActuateWellModel, AlarmKeyModel, DiagnosticTest, MultinodeUIActuationModel, OverridePositionModel, RehomeAFCD, TimebasedActuateModel } from '@core/models/webModels/MultiNodeUIDataModel.model';
import { GatewayBaseService } from '@core/services/gatewayBase.service';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PerformActuationZoneModel } from '../components/perform-actuation-dialog/perform-actuation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class MultinodeService extends GatewayBaseService {

  private api = environment.webHostURL;
  public multinodeApiUrl: string = `${this.api}api/multinode`;
  public CurrentActuationWellUrl: string = `${this.api}api/MultiNode/getcurrentactuatewell`;
  public ActuationWellAcknowledgeUrl: string = `${this.api}api/MultiNode/acknowledge`;

  constructor(protected http: HttpClient) {
    super(http);
  }

  sentActuateAcknowledgement(actuateWellModel:ActuateWellModel):Observable<any> {
    var result = this.http.post(this.ActuationWellAcknowledgeUrl, actuateWellModel).pipe(catchError(this.handleError));
    return result;
  }
  getActuationWellObject(): Observable<MultinodeUIActuationModel> {
    return this.http.get<MultinodeUIActuationModel>(this.CurrentActuationWellUrl).pipe(catchError(this.handleError));
  }

  // Multinode Actuate Well
  actuateEFCV(zone: PerformActuationZoneModel): Observable<any> {
    const data = {
      SIUID: zone.SIEGuid,
      WellId: zone.WellId + "",
      ActuationNodes: [{
        AFCDId: zone.eFCVGuid,
        DeviceId: zone.HcmId,
        CurrentStage: zone.CurrentTargetPositionStage,
        PreviousStage: zone.CurrentTargetPositionStage,
        TargetStage: zone.SelectedTargetPositionStage
      }]
    }
    return this.http.post(this.multinodeApiUrl + "/actuatewell", data).pipe(catchError(this.handleError));
  }

  reHomeAFCD(rehomeAFCD: RehomeAFCD): Observable<any> {
    return this.http
      .post(this.api + 'api/multinode/rehome', rehomeAFCD)
      .pipe(catchError(this.handleError));
  }

  stopActuation(siuGuid: string): Observable<any> {
    return this.http
      .post<any>(this.api + 'api/multinode/stopactuation/' + siuGuid, null)
      .pipe(catchError(this.handleError));
  }

  ackNowledgeActuation(actuationWell: ActuateWellModel): Observable<any> {
    return this.http
      .post(this.api + 'api/multinode/acknowledge', actuationWell)
      .pipe(catchError(this.handleError));
  }

  startDiagnosticTest(diagnosticTest: DiagnosticTest) {
    return this.http
      .post(this.api + 'api/multinode/diagnostictest', diagnosticTest)
      .pipe(catchError(this.handleError));
  }

  getEchoStatus(): Observable<DiagnosticTest> {
    const results: Observable<DiagnosticTest> = this.http
      .get<DiagnosticTest>(this.api + 'api/multinode/diagnostictestStatus')
      .pipe(catchError(this.handleError));
    return results;
  }

  onPowerDown(siuId: number) {
    return this.http
      .post(this.api + 'api/multinode/powerdown/' + siuId.toString(), null)
      .pipe(catchError(this.handleError));
  }

  onPowerUp(siuId: number) {
    return this.http
      .post(this.api + 'api/multinode/powerup/' + siuId, null)
      .pipe(catchError(this.handleError));
  }

  overridePosition(overridePosition: OverridePositionModel) {
    return this.http
      .post(this.api + 'api/multinode/setposition', overridePosition)
      .pipe(catchError(this.handleError));
  }

  timebasedActuation(timeBasedActuation: TimebasedActuateModel) {
    return this.http
      .post(this.api + 'api/multinode/timebasedactuation', timeBasedActuation)
      .pipe(catchError(this.handleError));
  }

  changealarmstate(alarmKeyModel: AlarmKeyModel): Observable<any> {
    return this.http
      .post(this.api + 'api/multinode/changealarmstate', alarmKeyModel)
      .pipe(catchError(this.handleError));
  }
}
