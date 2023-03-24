import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { GatewayBaseService } from './gatewayBase.service';
import { SureFLOFlowMeterUIModel } from '@core/models/UIModels/sureflo.model';
import { SureFLO298EXCalibrationModel, SureFLO298EXGasCalibrationModel, SureFLO298EXWaterCalibrationModel } from '@core/models/UIModels/sureflo-ex-flowmeter-model';
import { WellFlowTypes } from '@core/models/webModels/SureFLODataModel.model';
import { SureFLO298CalibrationModel, SureFLO298GasCalibrationModel, SureFLO298WaterCalibrationModel } from '@core/models/UIModels/sureflo-flowmeter-model';

@Injectable({
  providedIn: 'root'
})
export class SurefloService extends GatewayBaseService {

  private api = environment.webHostURL;

  constructor(protected http: HttpClient) {
    super(http);
  }


  // Get FlowMeters
  getFlowMeterList(): Observable<SureFLOFlowMeterUIModel[]> {
    const results: Observable<SureFLOFlowMeterUIModel[]> = this.http
      .get<SureFLOFlowMeterUIModel[]>(this.api + 'api/SureFLOFlowMeter')
      .pipe(catchError(this.handleError));

    return results;
  }

  // Get FlowMeter
  getFlowMeter(flowMeterId: number): Observable<SureFLOFlowMeterUIModel> {
    const results: Observable<SureFLOFlowMeterUIModel> = this.http
      .get<SureFLOFlowMeterUIModel>(this.api + 'api/SureFLOFlowMeter/' + flowMeterId)
      .pipe(catchError(this.handleError));

    return results;
  }

  // Save FlowMeter
  saveFlowMeter(data: SureFLOFlowMeterUIModel[]): Observable<any> {
    return this.http
      .post<SureFLOFlowMeterUIModel[]>(this.api + 'api/SureFLOFlowMeter', data)
      .pipe(catchError(this.handleError));
  }

  deleteFlowMeter(flowMeterId: number): Observable<any> {
    const params = new HttpParams().set('flowMeterId', flowMeterId.toString());
    return this.http
      .post<any>(this.api + 'api/SureFLOFlowMeter/delete',
        { params }
      )
      .pipe(catchError(this.handleError));
  }

  // Generate 298 FlowMeter Calibration File
  construct298CalFile(calFileData : SureFLO298CalibrationModel, flowTypeId) {
    switch (flowTypeId) {
      case WellFlowTypes.OilProducer:
        this.construct298OilCalFile(calFileData);
        break;
      case WellFlowTypes.WaterInjector:
        this.construct298WaterCalFile(calFileData);
        break;
      default:
        this.construct298GasCalFile(calFileData);
        break;
    }

  }

  // Generate 298EX FlowMeter Calibration File
  construct298EXCalFile(calFileData : SureFLO298EXCalibrationModel, flowTypeId) {
    switch (flowTypeId) {
      case WellFlowTypes.OilProducer:
        this.construct298EXOilCalFile(calFileData);
        break;
      case WellFlowTypes.WaterInjector:
        this.construct298EXWaterCalFile(calFileData);
        break;
      default:
        this.construct298EXGasCalFile(calFileData);
        break;
    }

  }

  // 298 Oil Producer
  construct298OilCalFile(data: SureFLO298CalibrationModel) {
    const {IsValid, IsDirty, ...calibrationFile} = data;
    return calibrationFile;
  }

  // 298 Gas Producer / Injector
  construct298GasCalFile(data: SureFLO298CalibrationModel) {
    let calibrationFile: SureFLO298GasCalibrationModel = {
      fluidType: data.fluidType,
      technology: data.technology,
      calibrationFileName: data.calibrationFileName,
      flowMeterDimensions: {
        InletDiameter: data.flowMeterDimensions.InletDiameter,
        ThroatDiameter: data.flowMeterDimensions.ThroatDiameter,
        StaticCorrection: data.flowMeterDimensions.StaticCorrection
      },
      additionalParameters: {
        DeltaThreshold: data.additionalParameters.DeltaThreshold,
        ProducedGasGravity: data.additionalParameters.ProducedGasGravity
      }

    }
    return calibrationFile;
  }


  // 298 Water Injector
  construct298WaterCalFile(data: SureFLO298CalibrationModel) {
    let calibrationFile: SureFLO298WaterCalibrationModel = {
      fluidType: data.fluidType,
      technology: data.technology,
      calibrationFileName: data.calibrationFileName,
      flowMeterDimensions: {
        InletDiameter: data.flowMeterDimensions.InletDiameter,
        ThroatDiameter: data.flowMeterDimensions.ThroatDiameter,
        StaticCorrection: data.flowMeterDimensions.StaticCorrection
      },
      fluidPVTData: {
        WaterFVF: data.fluidPVTData.WaterFVF,
        WaterDensity: data.fluidPVTData.WaterDensity,
        WaterViscosity: data.fluidPVTData.WaterViscosity,
        WaterSpecificGravity: data.fluidPVTData.WaterSpecificGravity,
        UseCustomWaterProperties: data.fluidPVTData.UseCustomWaterProperties,
        WaterVolumeFactorCalibration: data.fluidPVTData.WaterVolumeFactorCalibration,
        WaterDensityCalibration: data.fluidPVTData.WaterDensityCalibration,
        WaterViscosityCalibration: data.fluidPVTData.WaterViscosityCalibration
      },
      additionalParameters: {
        DeltaThreshold: data.additionalParameters.DeltaThreshold,
        CD: data.additionalParameters.CD
      },

    }
    return calibrationFile;
  }

  // 298EX Oil Producer
  construct298EXOilCalFile(data: SureFLO298EXCalibrationModel) {
    const {IsValid, IsDirty, ...calibrationFile} = data;
    return calibrationFile;

  }

  // 298EX Gas Producer / Injector
  construct298EXGasCalFile(data: SureFLO298EXCalibrationModel) {
    let calibrationFile: SureFLO298EXGasCalibrationModel = {
      fluidType: data.fluidType,
      technology: data.technology,
      calibrationFileName: data.calibrationFileName,
      flowMeterDimensions: {
        InletDiameter: data.flowMeterDimensions.InletDiameter,
        OutletDiameter: data.flowMeterDimensions.OutletDiameter,
        InletTolerance: data.flowMeterDimensions.InletTolerance,
        OutletTolerance: data.flowMeterDimensions.OutletTolerance,
        StaticCorrection: data.flowMeterDimensions.StaticCorrection
      },
      fluidPVTData: {
        SpecificGravityGas: data.fluidPVTData.SpecificGravityGas,
        UseCustomGasProperties: data.fluidPVTData.UseCustomGasProperties,
        GasDensityCalibration: data.fluidPVTData.GasDensityCalibration,
        GasViscosityCalibration: data.fluidPVTData.GasViscosityCalibration,
        GasVolumeFactorCalibration: data.fluidPVTData.GasVolumeFactorCalibration
      },
      additionalParameters: {
        CoefficientExpansion: data.additionalParameters.CoefficientExpansion,
        MeasuredDepth: data.additionalParameters.MeasuredDepth
      },
      filterParameters: data.filterParameters

    }
    return calibrationFile;
  }


  // 298EX Water Injector
  construct298EXWaterCalFile(data: SureFLO298EXCalibrationModel) {
    let calibrationFile: SureFLO298EXWaterCalibrationModel = {
      fluidType: data.fluidType,
      technology: data.technology,
      calibrationFileName: data.calibrationFileName,
      flowMeterDimensions: {
        InletDiameter: data.flowMeterDimensions.InletDiameter,
        OutletDiameter: data.flowMeterDimensions.OutletDiameter,
        InletTolerance: data.flowMeterDimensions.InletTolerance,
        OutletTolerance: data.flowMeterDimensions.OutletTolerance,
        StaticCorrection: data.flowMeterDimensions.StaticCorrection
      },
      fluidPVTData: {
        SpecificGravityWater: data.fluidPVTData.SpecificGravityWater,
        UseCustomWaterProperties: data.fluidPVTData.UseCustomWaterProperties,
        WaterVolumeFactorCalibration: data.fluidPVTData.WaterVolumeFactorCalibration,
        WaterDensityCalibration: data.fluidPVTData.WaterDensityCalibration,
        WaterViscosityCalibration: data.fluidPVTData.WaterViscosityCalibration
      },
      additionalParameters: {
        CoefficientExpansion: data.additionalParameters.CoefficientExpansion,
        SurfaceWaterCut: data.additionalParameters.SurfaceWaterCut,
        MeasuredDepth: data.additionalParameters.MeasuredDepth
      },
      filterParameters: data.filterParameters

    }
    return calibrationFile;
  }

}
