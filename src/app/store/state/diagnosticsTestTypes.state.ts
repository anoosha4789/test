import { DiagnosticsTestTypesDataModel } from "@core/models/UIModels/diagnosticsTestTypes.model";
import { IState } from "./IState";

export interface IDiagnosticsTestTypesState extends IState {
  diagnosticsTestTypes: DiagnosticsTestTypesDataModel[];
  }
  
  export const initialDiagnosticsTestTypesState: IDiagnosticsTestTypesState = {
    diagnosticsTestTypes: [],
    isLoaded: false,
    isLoading: false,
    isDirty: false,
    isValid: false,
    error: '',
  };