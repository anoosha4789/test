export class YAxes {
  label: string;
  unit: string;
  Min: number;
  Max: number;
}

export class XAxes {
  deviceId: number;
  pointIndex: number;
  label: string;
  unit: string;
  decimalPoints: number;
  brush: string;
  isFixed: boolean;
}

export class SeriesPoints {
  deviceId: number;
  pointIndex: number;
  label: string;
}

export class ChartOptions {
  yAxes: YAxes[];
  dataSeries: XAxes[];
  selectSeries: SeriesPoints[];
  chartStartTime?: any;
  hideCheckbox?: boolean;
}

export class ChartSettings {
  yAxes: YAxes[];
  xAxes: XAxisSetting[];
}

export class XAxisSetting {
  index: number;
  brush: string;
}
