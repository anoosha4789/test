import { DataPointValueModel } from './DataPointValue.model';

// field names need to match the name delivered from the server, such as DeviceId, not deviceId
export class DataPointValue extends DataPointValueModel {
    constructor(public DeviceId: number, public PointIndex: number, public Value: number, public UnitSymbol: string) { 
        super();
    }
}

export class DeviceIdIndexValue {
    public constructor(public deviceId: number, public pointIndex: number, public value: number, public unit: string) {}
    match(source: DataPointValue) {
        
        if (this.deviceId == source.DeviceId && this.pointIndex == source.PointIndex) {
            this.value = source.Value;
            this.unit = source.UnitSymbol;
        }
    }
}
  
