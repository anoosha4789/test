export class NetworkAddressModel {
    public IpAddress: string;
    public SubnetMask: string;
    public DefaultGateway: string;
    public Name: string;
    public InterfaceCardType: string;
    public Description: string;
    public Network: string;
    public Flag: string;
    public IpAddressList?: string[];
    public SubnetMaskList?: string[];
    public DefaultGatewayList?: string[];
}