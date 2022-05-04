export interface INestedInfra {
  resource_id: string;
  resource_type: string;
  children?: INestedInfra[];
  isExpanded?: boolean;
}
export interface INestedInfraResponse {
  orphan?: INestedInfra[];
  infra: INestedInfra;
}
