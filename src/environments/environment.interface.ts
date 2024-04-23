import { AuthConfig } from 'angular-oauth2-oidc';

import { ICoreEnvironment, IFreshChatInitOptions } from 'h21-be-ui-kit';

export interface IEnvironment extends ICoreEnvironment {
  production: boolean;

  ssoUri: string;

  apiOrderUri: string;

  paymentWidgetUri: string;

  apiGatewayUri: string;

  apiPoiUri: string;

  apiHotelRoomUri?: string;

  apiHotelUri: string;

  debounceTime: number;

  appInsightsConfig: Microsoft.ApplicationInsights.IConfig;

  auth: AuthConfig;

  core: ICoreEnvironment;

  freshChat: IFreshChatInitOptions;

  iconsUri?: string;
}
