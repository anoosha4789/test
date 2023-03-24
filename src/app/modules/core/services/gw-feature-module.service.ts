import { Injectable } from '@angular/core';
import { ErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GwFeatureModuleService {

  private _setOperationModeSubject = new Subject<boolean>();

  private IsSetOperationModeIdle: boolean = false;
  private errorNotifierMap: Map<string, ErrorHandlingChanges> = new Map<string, ErrorHandlingChanges>();
  private configDirtyNotifierMap: Map<string, ConfigDirtyChanges> = new Map<string, ConfigDirtyChanges>();

  constructor() { }

  updateOperationMode(operationMode: boolean) {
    this.IsSetOperationModeIdle = operationMode;
    this._setOperationModeSubject.next(this.IsSetOperationModeIdle);
  }

  updateConfigDirtyNotifier(configDirtyNotifier: ConfigDirtyChanges) {
    if (this.configDirtyNotifierMap.has(configDirtyNotifier.sectionName))
      this.configDirtyNotifierMap.delete(configDirtyNotifier.sectionName);

    this.configDirtyNotifierMap.set(configDirtyNotifier.sectionName, configDirtyNotifier);
  }
  updateErrorNotifier(errorNotifier: ErrorHandlingChanges) {
    if (this.errorNotifierMap.has(errorNotifier.sectionName))
      this.errorNotifierMap.delete(errorNotifier.sectionName);

    this.errorNotifierMap.set(errorNotifier.sectionName, errorNotifier);
  }

  clearErrorNotifier(sectionName: string) {
    if (this.errorNotifierMap.has(sectionName))
      this.errorNotifierMap.delete(sectionName);
  }

  subscribeToOperationMode(): Subject<boolean> {
    return this, this._setOperationModeSubject;
  }

  getErrorNotifiers(): Map<string, ErrorHandlingChanges> {
    return this.errorNotifierMap;
  }
  getConfigDirtyNotifiers(): Map<string, ConfigDirtyChanges> {
    return this.configDirtyNotifierMap;
  }
}

export class ErrorHandlingChanges {
  sectionName: string;
  isConfigDirty: boolean;
  isValidState: boolean;
  errorNotifier: ErrorNotifierModel;
}

export class ConfigDirtyChanges {
  sectionName: string;
  isConfigDirty: boolean;
  isValidState: boolean;
}
