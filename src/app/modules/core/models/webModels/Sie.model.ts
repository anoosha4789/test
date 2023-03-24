export class SieModel {
    public Id: number;
    public SIEGuid: string;
    public Name: string;
    public NetworkType: string;
    public IpAddress: string;
    public PortNumber: number;
    public MacAddress: string;
    public SIEDeviceId?: number;
    public SIEWellLinks: SIEWellLinkModel[];
}
export class SIEWellLinkModel {
    public Id: number;
    public SIEId: number;
    public WellId: number;
    public SIEName: string;
    public WellName: string;
}