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
