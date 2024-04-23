export interface ICompanyReference {
  companyProfileId?: number;
  name?: string;
  enable?: boolean;
  mandatory?: boolean;
  isIncludeForAnonymousTraveler?: boolean;
  isShowInIndividualInvoice?: boolean;
  isShowInMyBookings?: boolean;
  valuesActual?: IReferenceValue[];
  editable?: boolean;
  id?: number;
}

export interface IReferenceValue {
  companyReferenceId: number;
  value: string;
  id: number;
}
