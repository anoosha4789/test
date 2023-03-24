import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { StateUtilities } from "@store/state/IState";

import * as LOGGER_ACTIONS from '@store/actions/dataLogger.entity.action';
import * as LOGGER_TYPE_ACTIONS from '@store/actions/dataLoggerTypes.action';
import { IDataLoggerEntityState } from "@store/state/dataLogger.entity.state";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { CustomDataLoggerConfiguration } from "@core/models/webModels/DataLogger.model";
import { DataLoggerTypesDataModel } from "@core/models/UIModels/dataLoggerTypes.model";
import { ILoggerTypeState } from "@store/state/dataLoggerTypes.state";
import { selectAllDataLoggers, selectDataLoggerState } from "@store/reducers/dataLogger.entity.reducer";
import * as _ from "lodash";
import { UICommon } from "@core/data/UICommon";
import { DataLoggerUIModel } from '@core/models/UIModels/dataLogger.model';
import { DeleteOrder, GaugeTypeUIModel } from "@core/models/UIModels/models.model";
import { DeleteObjectTypesEnum } from "@core/models/webModels/DeleteObjectTypesEnum";

@Injectable({
    providedIn: 'root',
})
export class DataLoggerFacade {
    private dataLoggerSubject = new BehaviorSubject<CustomDataLoggerConfiguration[]>([]);
    private loggerTypesSubject = new BehaviorSubject<DataLoggerTypesDataModel[]>([]);
    private loggerTypeState$: Observable<ILoggerTypeState>;
    dataLoggers: CustomDataLoggerConfiguration[] = [];
    loggerTypes: DataLoggerTypesDataModel[] = [];

    // State Objects subscriptions variables
    private dataLoggerSubscription: Subscription = null;
    private loggerTypesSubscription: Subscription = null;


    constructor(protected store: Store<any>) {
        this.loggerTypeState$ = this.store.select<ILoggerTypeState>((state: any) => state.loggerTypeState);
    }

    // setup subscriptions
    private subscribeToDataLogger(): void {
        if (this.dataLoggerSubscription == null) {
            this.dataLoggerSubscription = this.store.select<any>(selectDataLoggerState).subscribe((state: IDataLoggerEntityState) => {
                if (state && !state.isLoaded) {
                    this.store.dispatch(LOGGER_ACTIONS.DATALOGGER_LOAD());
                }
                else {
                    this.store.select<any>(selectAllDataLoggers).subscribe(dataLoggers => {
                        this.dataLoggers = _.cloneDeep(dataLoggers);
                        this.dataLoggerSubject.next(this.dataLoggers);
                    });
                }
            }
            );
        }
    }


    private subscribeToDataLoggerTypes(): void {
        if (this.loggerTypesSubscription == null) {
            this.loggerTypesSubscription = this.loggerTypeState$.subscribe(
                (state: ILoggerTypeState) => {
                    if (state !== undefined) {
                        if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
                            this.store.dispatch(LOGGER_TYPE_ACTIONS.LOAD_DATA_LOGGER_TYPES());
                        } else {
                            this.loggerTypes = state.loggerTypes;
                            this.loggerTypesSubject.next(this.loggerTypes);
                        }
                    }
                }
            );
        }
    }

    // initialize subscription methods
    public initDataLogger(): BehaviorSubject<CustomDataLoggerConfiguration[]> {
        if (this.dataLoggers === null || this.dataLoggers.length === 0)
            this.subscribeToDataLogger();
        return this.dataLoggerSubject;
    }

    public initLoggerTypes(): BehaviorSubject<DataLoggerTypesDataModel[]> {
        if (this.loggerTypes === null || this.loggerTypes.length === 0)
            this.subscribeToDataLoggerTypes();
        return this.loggerTypesSubject;
    }
    deleteDataLogger(dataLoggerId: number, dataLoggerUIModel: DataLoggerUIModel) {
        if (dataLoggerId > -1) {
            UICommon.deletedObjects.push({
                deleteOrder: DeleteOrder.DataLogger,
                id: dataLoggerId,
                name: dataLoggerUIModel.Name,
                data: dataLoggerUIModel,
                objectType: DeleteObjectTypesEnum.DataLogger
            });
        }
        this.store.dispatch(LOGGER_ACTIONS.DATALOGGER_DELETE({ id: dataLoggerId }));
    }


    // Unsubscribe subscriptions/Reset subscriptions
    public unSubscribeDataLoggerSubscription(): void {
        if (this.dataLoggerSubscription != null) {
            this.dataLoggerSubscription.unsubscribe();
            this.dataLoggerSubscription = null;
        }
        if (this.loggerTypesSubscription != null) {
            this.loggerTypesSubscription.unsubscribe();
            this.loggerTypesSubscription = null;
        }
        this.dataLoggers = [];
        this.loggerTypes = [];
    }
}