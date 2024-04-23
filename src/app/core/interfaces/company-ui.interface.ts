export interface ICompanyUi {
  settings: ICompanyUiSetting[];
  services: ICompanyUiService[];
}

export interface ICompanyUiSetting {
  companyProfileId: number;
  settingId: number;
  settingCode: string;
  settingName: string;
  settingIsForSearchAndBook: boolean;
  settingIsReadonly: boolean;
  isShow: boolean;
  id: number;
}

export interface ICompanyUiService {
  serviceTypeId: number;
  isShow: boolean;
  serviceName: string;
  id: number;
}
