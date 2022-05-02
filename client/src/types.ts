export interface INestedInfra {
  [key: string]: vpc;
}

export interface vpc {
  CidrBlock: string;
  DhcpOptionsId: string;
  State: string;
  VpcId: string;
  OwnerId: string;
  InstanceTenancy: string;
  CidrBlockAssociationSet: CidrBlockAssociationSet[];
  IsDefault: boolean;
  resource_id: string;
  resource_type: string;
  children: Children;
  parent: any;
}

export interface CidrBlockAssociationSet {
  AssociationId: string;
  CidrBlock: string;
  CidrBlockState: CidrBlockState;
}

export interface CidrBlockState {
  State: string;
}

export interface Children {
  [key: string]: subnet;
}

export interface subnet {
  AvailabilityZone: string;
  AvailabilityZoneId: string;
  AvailableIpAddressCount: number;
  CidrBlock: string;
  DefaultForAz: boolean;
  MapPublicIpOnLaunch: boolean;
  MapCustomerOwnedIpOnLaunch: boolean;
  State: string;
  SubnetId: string;
  VpcId: string;
  OwnerId: string;
  AssignIpv6AddressOnCreation: boolean;
  Ipv6CidrBlockAssociationSet: any[];
  SubnetArn: string;
  EnableDns64: boolean;
  Ipv6Native: boolean;
  PrivateDnsNameOptionsOnLaunch: PrivateDnsNameOptionsOnLaunch;
  resource_id: string;
  resource_type: string;
  parent: string;
  children: Instance;
}

export interface PrivateDnsNameOptionsOnLaunch {
  HostnameType: string;
  EnableResourceNameDnsARecord: boolean;
  EnableResourceNameDnsAAAARecord: boolean;
}

export interface Instance {
  [key: string]: instance;
}

export interface instance {
  AmiLaunchIndex: number;
  ImageId: string;
  InstanceId: string;
  InstanceType: string;
  LaunchTime: string;
  Monitoring: Monitoring;
  Placement: Placement;
  PrivateDnsName: string;
  PrivateIpAddress: string;
  ProductCodes: any[];
  PublicDnsName: string;
  PublicIpAddress: string;
  State: State;
  StateTransitionReason: string;
  SubnetId: string;
  VpcId: string;
  Architecture: string;
  BlockDeviceMappings: BlockDeviceMapping[];
  ClientToken: string;
  EbsOptimized: boolean;
  EnaSupport: boolean;
  Hypervisor: string;
  NetworkInterfaces: NetworkInterface[];
  RootDeviceName: string;
  RootDeviceType: string;
  SecurityGroups: SecurityGroup[];
  SourceDestCheck: boolean;
  VirtualizationType: string;
  CpuOptions: CpuOptions;
  CapacityReservationSpecification: CapacityReservationSpecification;
  HibernationOptions: HibernationOptions;
  MetadataOptions: MetadataOptions;
  EnclaveOptions: EnclaveOptions;
  PlatformDetails: string;
  UsageOperation: string;
  UsageOperationUpdateTime: string;
  PrivateDnsNameOptions: PrivateDnsNameOptions;
  resource_id: string;
  resource_type: string;
  parent: string;
}

export interface Monitoring {
  State: string;
}

export interface Placement {
  AvailabilityZone: string;
  GroupName: string;
  Tenancy: string;
}

export interface State {
  Code: number;
  Name: string;
}

export interface BlockDeviceMapping {
  DeviceName: string;
  Ebs: Ebs;
}

export interface Ebs {
  AttachTime: string;
  DeleteOnTermination: boolean;
  Status: string;
  VolumeId: string;
}

export interface NetworkInterface {
  Association: Association;
  Attachment: Attachment;
  Description: string;
  Groups: Group[];
  Ipv6Addresses: any[];
  MacAddress: string;
  NetworkInterfaceId: string;
  OwnerId: string;
  PrivateDnsName: string;
  PrivateIpAddress: string;
  PrivateIpAddresses: PrivateIpAddress[];
  SourceDestCheck: boolean;
  Status: string;
  SubnetId: string;
  VpcId: string;
  InterfaceType: string;
}

export interface Association {
  IpOwnerId: string;
  PublicDnsName: string;
  PublicIp: string;
}

export interface Attachment {
  AttachTime: string;
  AttachmentId: string;
  DeleteOnTermination: boolean;
  DeviceIndex: number;
  Status: string;
  NetworkCardIndex: number;
}

export interface Group {
  GroupName: string;
  GroupId: string;
}

export interface PrivateIpAddress {
  Association: Association2;
  Primary: boolean;
  PrivateDnsName: string;
  PrivateIpAddress: string;
}

export interface Association2 {
  IpOwnerId: string;
  PublicDnsName: string;
  PublicIp: string;
}

export interface SecurityGroup {
  GroupName: string;
  GroupId: string;
}

export interface CpuOptions {
  CoreCount: number;
  ThreadsPerCore: number;
}

export interface CapacityReservationSpecification {
  CapacityReservationPreference: string;
}

export interface HibernationOptions {
  Configured: boolean;
}

export interface MetadataOptions {
  State: string;
  HttpTokens: string;
  HttpPutResponseHopLimit: number;
  HttpEndpoint: string;
  HttpProtocolIpv6: string;
  InstanceMetadataTags: string;
}

export interface EnclaveOptions {
  Enabled: boolean;
}

export interface PrivateDnsNameOptions {
  HostnameType: string;
  EnableResourceNameDnsARecord: boolean;
  EnableResourceNameDnsAAAARecord: boolean;
}
