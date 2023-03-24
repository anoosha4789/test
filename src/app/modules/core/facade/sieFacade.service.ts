import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { StateUtilities } from "@store/state/IState";

import * as ACTIONS from '@store/actions/sie.entity.action';
import * as DIAGONSTICS_ACTIONS from '@store/actions/diagnosticsTestTypes.action';
import { ISieEntityState } from "@store/state/sie.state";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { selectAllSie, selectSieState } from "@store/reducers/sie.entity.reducer";
import * as _ from "lodash";
import { UICommon } from "@core/data/UICommon";
import { SieUIModel } from '@core/models/UIModels/sie.model';
import { DeleteOrder, GaugeTypeUIModel } from "@core/models/UIModels/models.model";
import { DeleteObjectTypesEnum } from "@core/models/webModels/DeleteObjectTypesEnum";
import { String } from 'typescript-string-operations';
import { Validator } from "jsonschema";
import { SIEConfigCommonSchema } from "@core/models/schemaModels/SIECongfigurationUIModel.schema";
import { AbstractControl, ValidatorFn } from "@angular/forms";
import { DiagnosticsTestTypesDataModel } from "@core/models/UIModels/diagnosticsTestTypes.model";
import { IDiagnosticsTestTypesState } from "@store/state/diagnosticsTestTypes.state";

@Injectable({
    providedIn: 'root',
})
export class SieFacade {
    private sieSubject = new BehaviorSubject<SieUIModel[]>([]);
    private diagonsticsTestTypeSubject = new BehaviorSubject<DiagnosticsTestTypesDataModel[]>([]);

    sies: SieUIModel[] = [];
    diagnosticsTestTypes: DiagnosticsTestTypesDataModel[] =[];
    newSie: SieUIModel;
    private iDiagnosticsTestTypesState$: Observable<IDiagnosticsTestTypesState>;
    
    // State Objects subscriptions variables
    private sieSubscription: Subscription = null;
    private diagonsticsTestTypeSubscription: Subscription = null;



    constructor(protected store: Store<any>) {
        this.iDiagnosticsTestTypesState$ = this.store.select<IDiagnosticsTestTypesState>((state: any) => state.diagnosticsTestTypeState);
    }

    // setup subscriptions
    private subscribeToSie(): void {
        if (this.sieSubscription == null) {
            this.sieSubscription = this.store.select<any>(selectSieState).subscribe((state: ISieEntityState) => {
                if (state && !state.isLoaded) {
                    this.store.dispatch(ACTIONS.SIE_LOAD());
                }
                else {
                    this.store.select<any>(selectAllSie).subscribe(sies => {
                        this.sies = _.cloneDeep(sies);
                        if(this.sies && this.sies.length>0){
                            this.mapSieName()
                        }
                        this.sieSubject.next(this.sies);
                    });
                }
            }
            );
        }
    }

 // Hold Database Value of Well Name
 mapSieName() {
    this.sies.forEach((sie) => {
        sie.currentSieName = sie.currentSieName ? sie.currentSieName : sie.Name
    });
    return this.sies;
  }    

    private subscribeToDiagnosticsTestTypes(): void {
        if (this.diagonsticsTestTypeSubscription == null) {           
            this.diagonsticsTestTypeSubscription = this.iDiagnosticsTestTypesState$.subscribe(
            (state: IDiagnosticsTestTypesState) => {
                if (state !== undefined) {
                    if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
                        this.store.dispatch(DIAGONSTICS_ACTIONS.LOAD_DIAGNOSTICS_TEST_TYPES());
                    } else {
                        this.diagnosticsTestTypes = state.diagnosticsTestTypes;
                        this.diagonsticsTestTypeSubject.next(this.diagnosticsTestTypes);
                    }
                }
            }
        );
        }
    }

    // initialize subscription methods
    public initSie(): BehaviorSubject<SieUIModel[]> {
        if (this.sies === null || this.sies.length === 0)
            this.subscribeToSie();
        return this.sieSubject;
    }

    public initDiagnosticsTestTypes(): BehaviorSubject<DiagnosticsTestTypesDataModel[]> {
        if (this.diagnosticsTestTypes === null || this.diagnosticsTestTypes.length === 0)
            this.subscribeToDiagnosticsTestTypes();
        return this.diagonsticsTestTypeSubject;
    }

    deleteSie(sieId: number, sieUIModel: SieUIModel) {
        if (sieId > -1) {
            UICommon.deletedObjects.push({
                deleteOrder: DeleteOrder.Sie,
                id: sieId,
                name: sieUIModel.Name,
                data: sieUIModel,
                objectType: DeleteObjectTypesEnum.Sie
            });
        }
        this.store.dispatch(ACTIONS.SIE_DELETE({ sieId }));
    }

    getNewSie(Id: number): SieUIModel {
        this.newSie = {
            Id: -Id,
            SIEGuid: "",
            Name: "SIU " + Id,
            NetworkType: "UDP",
            IpAddress: "192.168.0.101",
            PortNumber: 18888,
            MacAddress: "00.06.03.20.00.00",
            SIEWellLinks: [],
            IsValid: true,
            IsDirty: true,
        };
        return this.newSie;
    }


    saveSie(sieToAdd: SieUIModel): void {
        const action = { sie: sieToAdd };
        if (this.newSie && this.newSie.Id === sieToAdd.Id) {
            this.store.dispatch(ACTIONS.SIE_ADD(action));
        } else {
            this.store.dispatch(ACTIONS.SIE_UPDATE(action));
        }
        this.newSie = null;
    }

    validateSie(sie: SieUIModel): string {
        let errMssg = null;

        let validator = new Validator();
        let result = validator.validate(
            sie,
            SIEConfigCommonSchema
        );
        if (!result.valid) {
            errMssg = String.Format("{0} - {1}", result.errors[0].property.replace("instance.", ""), result.errors[0].message);
            return errMssg;
        }

        if (sie.SIEWellLinks?.length == 0) { // No Wells added yet
            errMssg = "No Wells added to the SIU";
            return errMssg;
        }


        return errMssg;
    }

    validateSies(sies: SieUIModel[]): boolean {
        let bIsValid = true;
        for (let i = 0; i < sies.length; i++) {
            if (this.validateSie(sies[i]) != null) {
                bIsValid = false;
                break;
            }
        }

        return bIsValid;
    }

    public sieNameValidator(sieId: number): ValidatorFn {
        return (c: AbstractControl): { [key: string]: any } | null => {
          if (c.value === undefined || c.value == null || c.value == '')
            return null;
    
          if (!this.isValidSieName(sieId, c.value))
            return { customError: 'Name already exists.' };
    
          return null;
        };
      }
    
      isValidSieName(sieId: number, sieName: string): boolean {
        // this.initWells();
        let bIsValid = true;
        if (this.sies && this.sies.length > 0) {
          bIsValid = this.sies.findIndex(sie => sie.Id !== sieId && sie.Name.toUpperCase().trim() === sieName.toUpperCase().trim()) !== -1 ? false : true;
        }
    
        return bIsValid;
      }
      
    // Unsubscribe subscriptions/Reset subscriptions
    public unSubscribeSieSubscription(): void {
        if (this.sieSubscription != null) {
            this.sieSubscription.unsubscribe();
            this.sieSubscription = null;
        }

        this.sies = [];
    }
}