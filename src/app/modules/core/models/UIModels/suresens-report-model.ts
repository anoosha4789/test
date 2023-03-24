import { ErrorHandlingUIModel } from "../webModels/ErrorHandlingUI.model";
import { IReport, IDataSource, IPanelConfiguration, IUnit, IWell, IDataPublishing, IDataLogger } from "./report.model";

export interface SuresensReportModel {
    Report: IReport,
    PanelConfiguration?: ISuresensPanlConfiguration,
    UnitSystem?: Array<IUnit>,
    ErrorHandling?: ErrorHandlingUIModel,
    Wells?: Array<IWell>,
    DataSource?: Array<IDataSource>,
    DataPublishing?: Array<IDataPublishing>
    DataLogger?: Array<IDataLogger>
}

export interface ISuresensPanlConfiguration extends IPanelConfiguration {

    ToggleWells: string,
    ToggleInterval: number
}
