export interface INestedInfra {
  resource_id: string;
  resource_type: string;
  children?: INestedInfra[];
  isExpanded?: boolean;
  state?: string;
}
export interface INestedInfraResponse {
  orphan?: INestedInfra[];
  infra: INestedInfra;
}

export interface IChartProps {
  size?: string;
  resourceId: string;
  costHistory: ICostHistory;
}

export interface ICostHistory {
  data: IDayCost[];
}

export interface TimePeriod {
  Start: Date;
  End: Date;
}

export interface UnblendedCost {
  Amount: number;
  Unit: string;
}

export interface Total {
  UnblendedCost: UnblendedCost;
}

export interface UnblendedCost2 {
  Amount: number;
  Unit: string;
}

export interface Metrics {
  UnblendedCost: UnblendedCost2;
}

export interface Group {
  Keys: string[];
  Metrics: Metrics;
}

export interface IDayCost {
  Estimated: boolean;
  Groups: Group[];
  Total: Total;
  TimePeriod: TimePeriod;
}

export interface Prophet {}
