export class InchargeToolUIModel {
    ValveSize: number;
    Positions: InchargePositionUIModel[];
    FullStokeLength: number;
    DefaultFullShiftVolume: number;
    FullShiftVolume: number;
    ToolId: number;
    ToolType: number;
}

export class InchargePositionUIModel {
    Index: number;
    Description?: string;
    ShiftVolume: number;
    OpenPercent: number;
    InitialPosition?: boolean;
}
