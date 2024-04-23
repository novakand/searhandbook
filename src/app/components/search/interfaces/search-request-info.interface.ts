export interface ISearchRequestInfo {
  requestId: string;
  surveyedProviderQuantity: number;
  filterInitialization: {
    distanceGreaterEqual: number;
    distanceLessEqual: number;
    distanceCalculation: number;
  };
}
