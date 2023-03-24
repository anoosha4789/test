import * as Reducer from './unit-system.reducer';
import * as Actions from '../actions/unit-system.action';
import { unitSystem as unitSystemState } from '@store/state/unit-system.state';
import { UnitSystemModel } from '@core/models/webModels/UnitSystem.model';

describe('UnitSystem Reducer', () => {

  afterEach(() => {
        
  });

  describe('UNITSYSTEM_LOAD_SUCCESS action', () => {

    it('should populate unitsystem from the object', () => {

        const data = {
            newunitSystem: {
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
                        "SelectedDisplayUnitSymbol":"°F",
                        "ShowSupportedUnitSymbols":false
                    }]
            },
            loading: false,
            loaded: true,
            error: ''
        };

        const unitSystemObj: UnitSystemModel = {
            UnitSystemName: data.newunitSystem.UnitSystemName,
            UnitQuantities: data.newunitSystem.UnitQuantities,
        }

        const action = Actions.UNITSYSTEM_LOAD_SUCCESS(data);
        const state = Reducer.unitSystemReducer(unitSystemState, action);
        expect(state.isLoaded).toEqual(true);
        expect(state.unitSystem).toEqual(unitSystemObj);
      
    });

  });


  describe('UNITSYSTEM_LOAD_FAILURE action', () => {

    it('should return error message', () => {

        const data =  { error: "Invalid request" };
        const action = Actions.UNITSYSTEM_LOAD_FAILURE(data);
        const state = Reducer.unitSystemReducer(unitSystemState, action);
        expect(state.error).toEqual(data.error);      
    });

  });


  describe('UNITSYSTEM_SAVE_SUCCESS action', () => {

    it('should update unitsystem value on success', () => {

        const payload:any = [
            {
                UnitQuantityDisplayLabel: "Temperature",
                SelectedUnitSymbol: "degC",
            }
        ];

        const action = Actions.UNITSYSTEM_SAVE_SUCCESS(payload);
        const state = Reducer.unitSystemReducer(unitSystemState, action);
        expect(state.isLoaded).toEqual(true);
       //expect(state.unitSystem.UnitQuantities[0].SelectedUnitSymbol).toEqual(payload[0].SelectedUnitSymbol);
      
    });

  });


  describe('UNITSYSTEM_SAVE_FAILURE action', () => {

    it('should return error message', () => {

        const data =  { error: "Invalid request" };
        const action = Actions.UNITSYSTEM_SAVE_FAILURE(data);
        const state = Reducer.unitSystemReducer(unitSystemState, action);
        expect(state.error).toEqual(data.error);       
    });

  });
  

});