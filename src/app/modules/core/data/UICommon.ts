import { DeleteOrder } from '@core/models/UIModels/models.model';
import { DeleteObjectTypesEnum } from '@core/models/webModels/DeleteObjectTypesEnum';
import { IUnitAlarm } from '@core/models/UIModels/report.model';

export class UICommon {
    static isBusyWaiting: boolean = false;
    static loadingMssg: string = null;

    static JWT_TOKEN_KEY_NAME = 'AuthToken';
    static JWT_TOKEN_DEFAULT_KEY = 'NULL';
    static JWT_TOKEN_SECRET_KEY = '!dhs@ahjdg#wa*(hsxd7';
    static OPEN_USER_PWD = 'bhiopen';

    static defaultBadValue = -999;

    static OPENUSER_NAME = 'Open';
    static HomeURL: string = "Home";
    static LogInRouteURL: string = "";    // Use this to set next URL action on Login page

    static LOGIN_IDLE_TIMEOUT = 1200;    // in seconds = 20 minutes
    static OPENUSER_IDLE_TIMEOUT = 85500; // in seconds = 23.75 hours, for performance test = 3600 seconds = 1 hour

    static COMPORT_SOURCE = "Source";
    static COMPORT_PUBLISH = "Publish";
    static COMPORT_BOTH = "Both";

    static comPortsInUse: SerialPortInUse[] = [];
    static ipAddressesInUse: IpAddressInUse[] = [];
    static ipPortsInUse: IpPortsInUse[] = [];
    static deletedObjects: DeleteObject[] = [];
    static IsImportConfig: boolean = false;
    static ImportMaxDeviceId: number = -1;
    static IsConfigSaved: boolean = false;
    static isSaveBtnEnabled: boolean = false;

    static CardAppTypes: string[] = ['InCHARGE', 'SureSENS'];
    static PollModes: string[] = ['Burst', 'Continuous'];
    static PublishingConnectionTypes: string[] = ['SCADA', 'DataBase', 'Frac Boat', 'Well Test'];
    static ByteOrderTypes: string[] = ['MSB-LSB', 'LSB-MSB'];
    static WordOrderTypes: string[] = ['MSW-LSW', 'LSW-MSW'];
    // static ProtocolList = { Id: 1, Name: "Modbus RTU" };

    static SHIFT_DEVICE_TYPEID = 999;
    static TOOL_DIAGNOSTICS_CODES = [6, 8, 10, 12, 14, 16, 18, 20, 22]; // For warning
    static CARD_STATUS_DISCONNECT = 'Card Disconnected';
    static SWAMPY_FIRMWARE_VERSION: string = "2.72";
    static LOGGER_LOGGING_RATES = [1, 5, 10, 15, 20, 25, 30];

    static CUSTOMMAP_ID = -1;
    static DIAGNOSTICMAP_ID = -2;
    
    // static CUSTOMMAPTYPE_ID = 2;
    // static DIAGNOSTICMAPTYPE_ID = 3;

    static getRandomInt(max): number {
        return Math.floor(Math.random() * Math.floor(max));
    }

    static getHexValue(value: number): string {
        return '0x' + (value + 0x10000).toString(16).substr(-4).toUpperCase();
    }

    static getValuewithPrecision(value: number, precision: number): number {
        if (precision === 0)
            return value;

        const factor = 10 ** precision;
        return Math.round(value * factor) / factor;
    };

    static GetDeviceTypeId(gaugeType: number): number {
        let ttype = 0;
        switch (gaugeType) {
            case 0:
                ttype = 4;
                break;

            case 1:
                ttype = 5;
                break;

            case 2:
                ttype = 6;
                break;

            case 5:
                ttype = 24;
                break;
        }

        return ttype;
    }

    static convertOADate(oaDate: number): number {
        let date = new Date();
        date.setTime((oaDate - 25569) * 24 * 3600 * 1000);
        return date.getTime();
    }

    static getPanelType(panelTypeId: number, isConfig: boolean = false): IPanelType {
        let panelType: IPanelType = { name: '', displayName: '' };

        switch (panelTypeId) {
            case PanelTypeList.INFORCE:
                if (isConfig)
                    panelType = { name: 'inforce-configuration', displayName: 'InFORCE' };
                else
                    panelType = { name: 'inforce', displayName: 'InFORCE' };
                break;

            case PanelTypeList.SURESENS:
                panelType = { name: 'suresens', displayName: 'SureSENS' };
                break;

            case PanelTypeList.InCHARGE:
                panelType = { name: 'incharge', displayName: 'InCHARGE' };
                break;
            case PanelTypeList.MultiNode:
                panelType = { name: 'multinode', displayName: 'MultiNode' };
                break;
        }

        return panelType;
    }

    static getImportNextDeviceId(): number {
        this.ImportMaxDeviceId = this.ImportMaxDeviceId + 1;
        return this.ImportMaxDeviceId;
    }


    //validates the float greater than zero but does not display property name in the validation message
    static validatePositiveFloatWithoutProperty(floatValue: number, propertyName: string, roundOffDecimals: number): string {
        if (floatValue == null || floatValue.toString().trim() == "" || isNaN(Number(floatValue.toString().trim()))) {
            return "Please enter a number greater than 0.";
        }
        if (Number(parseFloat(floatValue.toString()).toFixed(roundOffDecimals)) <= 0) {
            return "Please enter a number greater than 0.";
        }
        else
            return null;
    }

}

export class SerialPortInUse {
    portNumber: number;
    purpose: SerialPortPurpose;
}
export class IpAddressInUse {
    ipAddress: string;
    portNumber: number;
    purpose: SerialPortPurpose;
    channelType: number;
    protocol: number;
    id: number;
}
export class IpPortsInUse {
    portNumber: number;
    purpose: SerialPortPurpose;
    channelType: number;
    protocol: number;
    id: number;
}

export enum CommunicationChannelType {
    SERIAL = 0,
    TCPIP
}

export enum GeneralSettingsTabOrder {
    GENERAL = 0,
    ERROR_HANDLING,
    UNIT_SYSTEM,
    USER_ACCOUNT
}

export enum MultinodeGeneralSettingsTabOrder {
    GENERAL = 0,
    ERROR_HANDLING,
    UNIT_SYSTEM,
    EFCV_POSITIONS,
    USER_ACCOUNT
}

export enum InForceGeneralSettingsTabOrder {
    GENERAL = 0,
    ERROR_HANDLING,
    UNIT_SYSTEM,
    SHIFT_DEFAULTS,
    PANEL_DEFAULTS,
    USER_ACCOUNT
}

export enum PageName {
    GENERAL = 0,
    WELLS,
    SOURCES,
    PUBLISHING
}

export enum SerialPortPurpose {
    DATASOURCE = 0,
    PUBLISHING
}

export class DeleteObject {
    deleteOrder: DeleteOrder;
    objectType: DeleteObjectTypesEnum;
    id: number;
    parentId?: number;
    name: string;
    children?: DeleteObject[];
    data?: any;
}

export class WellDataPointIndex {
    static WellOperationMode: number = 3;
}

export class ZoneDataPointIndex {
    static AutoShiftStatus: number = 4;
    static StartPumpCalibration: number = 5;
    static PumpOperationMode: number = 6;
    static MotorControlBoardRunningStatus: number = 7;
    static CurrentValveOpeningPercentage: number = 10;
    static TargetValveOpeiningPercentage: number = 11;
}

export class ToolDataPointIndex {
    static TimeOffset: number = 1;
    static Diagnostics: number = 2;
    static ToolGain: number = 3;
    static ToolVoltage: number = 4;
}

export class SureSENSDataPointIndex {
    static PressureCount: number = 5;
    static PressureReferenceCount: number = 6;
    static TemperatureCount: number = 7;
    static TemperatureReferenceCount: number = 8;
    static PressureFrequency: number = 9;
    static TemperatureFrequency: number = 10;
    static Pressure: number = 11;
    static Temperature: number = 12;
    static DiagnosticsWord: number = 13;
    static AbsoluteVibrationX: number = 14;
    static AbsoluteVibrationY: number = 15;
    static AbsoluteVibrationZ: number = 16;
    static PeakVibrationX: number = 17;
    static PeakVibrationY: number = 18;
    static PeakVibrationZ: number = 19;
    static FirmwareVersion: number = 20;
    static HardVersion: number = 21;
    static LineVoltage: number = 22;
    static VRTD: number = 23;
    static RTDIndegreeC: number = 24;
    static RawVibrationX: number = 25;
    static RawVibrationY: number = 26;
    static RawVibrationZ: number = 27;
}

export class ESPToolDataPointIndex {
    static MotorWindingTemperature = 5;
    static PeakVibrationX: number = 13;
    static PeakVibrationY: number = 14;
    static PeakVibrationZ: number = 15;
}

export class CardDataPointIndex {

    static CardId: number = 1;
    static FirmwareVersion: number = 2;
    static TotalCableCurrent: number = 3;
    static CableACurrent: number = 4;
    static CableBCurrent: number = 5;
    static CableVoltage: number = 6;
    static SupplyCurrent: number = 7;
    static SupplyVoltage: number = 8;
    static HostTimestamp: number = 9;
    static CardTimestamp: number = 10;
    static CableVoltageAdjustment: number = 11;
    static CableSelect: number = 12;
    static CablePower: number = 13;
    static GaugePollRate: number = 14;
    //static DataBufferConfigurationRequest: number = 15;
    //static DataBufferSkipSelection: number = 16;
    static ParameterA: number = 17;
    static ParameterB: number = 18;
    static ParameterC: number = 19;
    static ParameterD: number = 20;
    static CardReset: number = 21;
    //static EnableCableBCurrentUpdate: number = 22;
    //static EnableCardAddressChange: number = 23;
    static ReadbackCardSlaveAddress: number = 24;
    static BaudRate: number = 25;
    static EnableBadGaugeDataReporting: number = 26;
    static ActualGaugePollRate: number = 27;
    //static EnableModbusActivityTimeout: number = 28;
    //static ModbusActivityTimeoutPeriod: number = 29;
    //static ActionToTakeAfterTimeout: number = 30;
    //static TargetVoltageToGoTo: number = 31;
    static CommStatus: number = 32;
}

export class UIChartColors {
    static CYAN_500: string = "#2FC0CF";
    static PINK_500: string = "#DA127D";
    static TEAL_700: string = "#147D64";
    static PURPLE_500: string = "#653CAD";
    static ORANGE_500: string = "#F35627";
    static GRAY_600: string = "#757575";
    static LIME_GREEN_500: string = "#6CD410";
    static LIGHT_BLUE_500: string = "#3994C1";
    static INDIGO_500: string = "#2251CC";
    static MAGENTA_500: string = "#A23DAD";
    static GREEN_500: string = "#18981D";
    static BLUE_500: string = "#0967D2";
    static EARTH_500: string = "#5C7B74";
    static GREEN_900: string = "#014807";
    static INDIGO_900: string = "#061178";
    static ORANGE_900: string = "#841003";

    static COLORS_LIST = [
        UIChartColors.CYAN_500,
        UIChartColors.PINK_500,
        UIChartColors.TEAL_700,
        UIChartColors.PURPLE_500,
        UIChartColors.ORANGE_500,
        UIChartColors.GRAY_600,
        UIChartColors.LIME_GREEN_500,
        UIChartColors.LIGHT_BLUE_500,
        UIChartColors.INDIGO_500,
        UIChartColors.MAGENTA_500,
        UIChartColors.GREEN_500,
        UIChartColors.BLUE_500,
        UIChartColors.EARTH_500,
        UIChartColors.GREEN_900,
        UIChartColors.INDIGO_900,
        UIChartColors.ORANGE_900];

    public static getChartBrush(index: number): string {
        return UIChartColors.COLORS_LIST[index] ?? UIChartColors.CYAN_500;
    }
}

export class CableSelectConverstion {
    static GetKey(Value: string): number {

        let key: number = -999;

        if (Value == "None") {
            key = 0;
        }
        else if (Value == "A Only") {
            key = 1;
        }
        else if (Value == "B Only") {
            key = 2;
        }
        else if (Value == "A & B") {
            key = 3;
        }

        return key;
    }

    static GetValue(Key: number): string {

        let value: string = "";

        if (Key == 0) {
            value = "None";
        }
        else if (Key == 1) {
            value = "A Only";
        }
        else if (Key == 2) {
            value = "B Only";
        }
        else if (Key == 3) {
            value = "A & B";
        }

        return value;
    }
}

export class CablePowerConverstion {

    static GetKey(Value: string): number {

        let key: number = -999;

        if (Value == "ON") {
            key = 1;
        }

        if (Value == "OFF") {
            key = 0;
        }

        return key;
    }

    static GetValue(Key: number): string {

        let value: string = "";

        if (Key == 1) {
            value = "ON";
        }

        if (Key == 0) {
            value = "OFF";
        }

        return value;
    }
}

export enum PanelTypeList {
    INFORCE = 1,
    SURESENS = 4,
    InCHARGE = 5,
    MultiNode = 6
}

export enum TOOL_STATUS {
    valid = 0,
    warning,
    critical
}

export const PANEL_ROUTES = {
    INFORCE_CONFIGURATION: 'inforce-configuration',
    INFORCE: 'inforce',
    SURESENS: 'suresens',
    InCHARGE: 'incharge',
    MULTINODE: 'multinode'
}

export const WELL_ARCHITECTURE_LIST = [
    { "Id": 1, "ArchitectureName": "SureSENS" },
    { "Id": 2, "ArchitectureName": "N + 1" },
    { "Id": 3, "ArchitectureName": "2N" }
];

export const ZONE_VALVE_TYPE_LIST = [
    { "Id": 0, "ValveName": "Monitoring" },
    { "Id": 1, "ValveName": "HCM-A" },
    { "Id": 2, "ValveName": "HCM+" },
    { "Id": 3, "ValveName": "HCM-S" },
    { "Id": 4, "ValveName": "eHCM-P" }
]

// GATE-1397 => Delete Dialog Text
export const deleteUIModal = {
    title: 'Delete',
    primaryBtnText: 'Delete',
    secondaryBtnText: 'Cancel'
}

export enum SHIFT_DEFAULTS {
    RETURN_BASED = 0,
    TIME_BASED
}

export function isFloat(num) {
    return Number(num) === num && num % 1 !== 0;
}

export interface IPanelType {
    name: string;
    displayName: string;
}

export enum ZONE_VALVE_TYPE {
    Monitoring = 0,
    HCM_A,
    HCM_Plus,
    HCM_S,
    eHCM_P
}

export enum FLOWMETER_TRASMITTER_TYPE {
    PrecisionDigital = 0,
    Fluidwell,
    None
}

export enum DATA_LOGGER_TYPE {
    Custom = 4,
    Saudi_Aramco_iField = 3
}

export class UIReportUnits {
    static _UnitC: IUnitAlarm = { Id: 1, Name: "°C" };
    static _UnitMPA: IUnitAlarm = { Id: 2, Name: "MPa" };
    static _UnitML: IUnitAlarm = { Id: 3, Name: "mL" };
    static _UnitG: IUnitAlarm = { Id: 4, Name: "g" };
    static _UnitMLS: IUnitAlarm = { Id: 5, Name: "mL/min" };
    static _UnitBBLDAY: IUnitAlarm = { Id: 6, Name: "bbl/day" };
    static _UnitM: IUnitAlarm = { Id: 7, Name: "m" };
    static _UnitKGM3: IUnitAlarm = { Id: 8, Name: "kg/m^3" };
    static _UnitPercent: IUnitAlarm = { Id: 9, Name: "%" };
    static _UnitSec: IUnitAlarm = { Id: 10, Name: "s" };
    static _UnitPSIA: IUnitAlarm = { Id: 11, Name: "psia" };
    static _UnitFlowmeter: IUnitAlarm = { Id: 12, Name: "pulses/mL" };
    static _UnitF: IUnitAlarm = { Id: 13, Name: "°F" };
    static _UnitPSIG: IUnitAlarm = { Id: 14, Name: "psig" };
    static _UnitKPA: IUnitAlarm = { Id: 15, Name: "kPa" };
    static _Unitbara: IUnitAlarm = { Id: 16, Name: "bar" };
    static _Unitgrms: IUnitAlarm = { Id: 17, Name: "gn" };
    static _Unitgpk: IUnitAlarm = { Id: 18, Name: "gpk-pk" };
    static _UnitmsSquare: IUnitAlarm = { Id: 19, Name: "m/s2" };
    static _Unitft: IUnitAlarm = { Id: 20, Name: "ft" };
    static _UnitV: IUnitAlarm = { Id: 21, Name: "V" };
    static _UnitA: IUnitAlarm = { Id: 22, Name: "mA" };
    static _Unitbarg: IUnitAlarm = { Id: 23, Name: "barg" };
}

export class UITemperatureUnits {
    static degF: string = "°F";
    static degC: string = "°C";
}

export class MultiNodeDefaults {
    static SIU_MAX_LIMIT: number = 3;
}
export enum DEFAULT_eFCV_POSITIONS {
    OPEN = "OPEN",
    STAGE_1 = "CHOKE_1",
    STAGE_2 = "CHOKE_2",
    STAGE_3 = "CHOKE_3",
    STAGE_4 = "CHOKE_4",
    CLOSED = "CLOSED",
    NOTSET = "UNKNOWN POSITION"
}

export enum DEFAULT_eFCV_POSITIONS_STAGES {
    STAGE_OPEN = "STAGE_OPEN",
    STAGE_1 = "STAGE_1",
    STAGE_2 = "STAGE_2",
    STAGE_3 = "STAGE_3",
    STAGE_4 = "STAGE_4",
    STAGE_CLOSE = "STAGE_CLOSE",
    STAGE_NOTSET = "STAGE_NOTSET"
}

export enum eFCV_POSITION_POSITION_OWNERS {
    PANEL = 1,
    WELL = 2,
    eFCV = 3
}

export const DEFAULT_eFCV_POSITIONS_ARRAY = [
    { Id: 1, Description: "OPEN" },
    { Id: 2, Description: "CHOKE_1" },
    { Id: 3, Description: "CHOKE_2" },
    { Id: 4, Description: "CHOKE_3" },
    { Id: 5, Description: "CHOKE_4" },
    { Id: 6, Description: "CLOSED" },
    { Id: 7, Description: "UNKNOWN POSITION" },

]

export class CHART_DEFAULTS {
    static MAX_DATA_POINTS_SIZE: number = 16;
    static MAX_Y_AXIS_SIZE: number = 4;
}