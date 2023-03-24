import { TestBed } from "@angular/core/testing";
import { Observable, of, throwError } from 'rxjs';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ConfigurationService } from '@core/services/configurationService.service';
import { unitSystem, IUnitSystemState } from '@store/state/unit-system.state';
import * as ACTIONS from '../actions/unit-system.action';
import { UnitSystemEffects } from './unit-system.effects';
import { UnitSystemModel } from '@core/models/webModels/UnitSystem.model';

const initialState = {
    unitSystem: {
        UnitSystemName: '',
        UnitQuantities: []
    },
    loading: false,
    loaded: true,
    error: ''
};

const mockUnitSystem = {
    UnitSystemName: "Custom",
    UnitQuantities: [
        {
            "UnitQuantityDisplayLabel": "Temperature",
            "UnitQuantityName": "thermodynamic_temperature",
            "SelectedUnitSymbol": "degF",
            "SupportedUnitSymbols": [
                "degF",
                "degC"
            ],
            "SelectedDisplayUnitSymbol": "°F",
            "ShowSupportedUnitSymbols": false
        }]
};

const unitSystemListToUpdate: UnitSystemModel[] = [
    {
        UnitSystemName: "Custom",
        UnitQuantities: [
            {
                "UnitQuantityDisplayLabel": "Temperature",
                "UnitQuantityName": "thermodynamic_temperature",
                "SelectedUnitSymbol": "degC",
                "SupportedUnitSymbols": [
                    "degF",
                    "degC"
                ],
                "SelectedDisplayUnitSymbol": "°C",
                "ShowSupportedUnitSymbols": false
            }]
    }
];

class MockConfigService {
    getUnitSystem() {
        return of(mockUnitSystem);
    };
    saveUnitSystem(unitSystemListToUpdate) {
        mockUnitSystem.UnitQuantities[0].SelectedUnitSymbol = "degC";
        return of(mockUnitSystem);
    }
}

describe('UnitSystem Effects', () => {


    let actions$: Observable<any>;
    let effects: UnitSystemEffects;
    let store: MockStore;
    let configService: ConfigurationService;

    beforeEach(() => {

        TestBed.configureTestingModule({
            providers: [
                UnitSystemEffects,
                provideMockActions(() => actions$),
                provideMockStore({ initialState }),
                { provide: ConfigurationService, useClass: MockConfigService },
            ],
        });
        effects = TestBed.inject(UnitSystemEffects);
        store = TestBed.inject(MockStore);
        configService = TestBed.inject(ConfigurationService);

    });

    it('should be created', () => {
        expect(effects).toBeTruthy();
    });


    // GET - Unit System List
    describe('loadUnitSystem$', () => {
        it('should fire if getUnitSystem API success', (done) => {
            const spy = spyOn(configService, 'getUnitSystem').and.callThrough();
            actions$ = of(ACTIONS.UNITSYSTEM_LOAD);
            effects.loadUnitSystem$.subscribe((res) => {
                expect(res).toEqual(ACTIONS.UNITSYSTEM_LOAD_SUCCESS({ newunitSystem: mockUnitSystem }));
                expect(spy).toHaveBeenCalledTimes(1);
                done();
            });
        });

        it('should return error if getUnitSystem Api fail', (done) => {
            const spy = spyOn(configService, 'getUnitSystem').and.returnValue(throwError("invalid request"));
            actions$ = of(ACTIONS.UNITSYSTEM_LOAD);
            effects.loadUnitSystem$.subscribe((res) => {
                expect(res).toEqual(ACTIONS.UNITSYSTEM_LOAD_FAILURE({ error: 'invalid request' }));
                expect(spy).toHaveBeenCalledTimes(1);
                done();
            });
        });
    });

    //POST - Update Unit System List
    describe('saveUnitSystem$', () => {
        it('should fire to saveUnitSystem Api Success ', (done) => {
            const spy = spyOn(configService, 'saveUnitSystem').and.callThrough();
            actions$ = of(ACTIONS.UNITSYSTEM_SAVE);
            effects.saveUnitSystem$.subscribe((res) => {
                //expect(res.).toEqual(ACTIONS.UNITSYSTEM_SAVE_SUCCESS({ payload:  unitSystemListToUpdate }));
                expect(spy).toHaveBeenCalledTimes(1);
                done();
            });
        });

        it('should return error if saveUnitSystem API fail', (done) => {
            const spy = spyOn(configService, 'saveUnitSystem').and.returnValue(throwError("invalid request"));
            actions$ = of(ACTIONS.UNITSYSTEM_SAVE);
            effects.saveUnitSystem$.subscribe((res) => {
                expect(res).toEqual(ACTIONS.UNITSYSTEM_SAVE_FAILURE({ error: 'invalid request' }));
                expect(spy).toHaveBeenCalledTimes(1);
                done();
            });
        });
    });

});
