export class PanelConfigurationCommonModel {
        Id: number;
        PanelTypeId: number;
        SerialNumber: string;
        CustomerName: string;
        FieldName: string;
}

export class InChargePanelModel extends PanelConfigurationCommonModel {

}

export class SureSENSPanelModel extends PanelConfigurationCommonModel {
        ToggleEnabled: boolean;
        ToggleIntervalInSec: number;
}

export class InFORCEPanelModel extends PanelConfigurationCommonModel {
        HydraulicOutputs: number;
}

export class MultiNodePanelModel extends PanelConfigurationCommonModel {
}