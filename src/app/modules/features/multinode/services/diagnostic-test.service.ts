import { Injectable } from '@angular/core';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { MultinodeModule } from '../multinode.module';
import { String } from 'typescript-string-operations';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: MultinodeModule
})
export class DiagnosticTestService {

  private diagnosticTestMessagesMap = new Map<number, string>();
  private datePipe = new DatePipe('en-US');

  constructor(private realTimeService: RealTimeDataSignalRService) { 
    this.subscribeToRealtimeLogMessages();
  }

  private subscribeToRealtimeLogMessages(): void {
    this.realTimeService.GetRealtimeLogMessages().subscribe(message => {
      if (message.Source === "MultiNode InControl Service")
        this.updateDiagnosticMessage(new Date(message.EventDateTime), message.Message);
    });
  }

  updateDiagnosticMessage(dtTimeStamp: Date, message: string): void {
    let timeStamp = dtTimeStamp.getTime();
    if (!this.diagnosticTestMessagesMap.get(timeStamp)) {
      this.diagnosticTestMessagesMap.set(timeStamp, String.Format("{0}: {1}", this.datePipe.transform(new Date(), "MMM d y hh:mm:ss a"), message));
    }
  }

  clearDiagnosticMessages(): void {
    this.diagnosticTestMessagesMap.clear();
  }

  public getLogMessages(): string {
    let logMessages = "";
    this.diagnosticTestMessagesMap.forEach((value, key) => {
      logMessages += "\n" + value;
    });

    return logMessages;
  }
}
