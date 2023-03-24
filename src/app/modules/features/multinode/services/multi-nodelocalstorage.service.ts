import { Injectable } from '@angular/core';
import { MultiNodeLocalStorage } from '../common/MultiNodeUICommon';
import { MultinodeModule } from '../multinode.module';

@Injectable({
  providedIn: MultinodeModule
})
export class MultiNodelocalstorageService {

  constructor() { }

  clearLocalStorage() {
    if (window.localStorage.getItem(MultiNodeLocalStorage.IsActuating))
      window.localStorage.removeItem(MultiNodeLocalStorage.IsActuating);
    if (window.localStorage.getItem(MultiNodeLocalStorage.ActuationEndTime))
      window.localStorage.removeItem(MultiNodeLocalStorage.ActuationEndTime);
    if (window.localStorage.getItem(MultiNodeLocalStorage.IsStopActuating))
      window.localStorage.removeItem(MultiNodeLocalStorage.IsStopActuating);
    if (localStorage.getItem(MultiNodeLocalStorage.ActuationRotationCount))
      window.localStorage.removeItem(MultiNodeLocalStorage.ActuationRotationCount);
  }

  removeItem(key: string): void {
    if (window.localStorage.getItem(key))
        window.localStorage.removeItem(key);
  }
}
