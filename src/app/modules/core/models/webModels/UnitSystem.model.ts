export interface UnitSystemModel {
    UnitSystemName: string;
    UnitQuantities: UnitQuantities[];
}

export interface UnitQuantities {
    UnitQuantityDisplayLabel: string;
    UnitQuantityName: string;
    SelectedUnitSymbol: string;
    SelectedDisplayUnitSymbol: string;
    SupportedUnitSymbols: any[];
    ShowSupportedUnitSymbols: boolean;
}
