import { Application } from 'h21-be-ui-kit';

import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  debounceTime: 300,
  production: false,
  ssoUri: 'https://horse21pro.com/api/',
  paymentWidgetUri: 'https://test.acaptureservices.com',
  apiOrderUri: 'https://h21-order-api.stable.travelid.pro/api/',
  apiPoiUri: 'https://h21-poi-api.stable.travelid.pro/api/',
  apiHotelRoomUri: 'https://h21-hotels-be-airclub-api.azurewebsites.net/api/',
  apiHotelUri: 'https://h21-hotels-be-api.stable.travelid.pro/api/',
  apiGatewayUri: 'https://h21-searching-book-gateway-api.azurewebsites.net/api/',

  auth: {
    issuer: 'https://stable.travelid.pro/',
    clientId: 'sab-ui',
    scope: 'openid profile references filestorage identityserver',
    redirectUri: `${window.location.origin}/`,
    postLogoutRedirectUri: `${window.location.origin}/`,
    silentRefreshRedirectUri: `${window.location.origin}/assets/silent-refresh.html`,
  },
  core: {
    application: Application.AGENT_OFFICE,
    profileApi: 'https://h21-profile-api.stable.travelid.pro/api/',
    apiRootUrl: 'https://h21-transfer-be-api.stable.travelid.pro/api/',
    connectorApi: 'https://h21-agent-office-api.stable.travelid.pro/api/',
    signalrUrl: 'https://notify-prod-qa.azurewebsites.net/searchandbook',
    fileStorageUrl: 'https://h21-agent-office-api.stable.travelid.pro/api/FileInfo/',
    referencesUrl: 'https://h21-references-api.stable.travelid.pro/api/',
    dashboardUrlUri: 'https://agent-office.azurewebsites.net/',
  },
  appInsightsConfig: {
    instrumentationKey: 'e92b7f0e-7744-43ce-a1a1-45cb9c98b278',
  },
  freshChat: {
    token: '95660b66-e121-4571-a445-64c85dded5b6',
    host: 'https://wchat.freshchat.com',
    config: {
      headerProperty: {
        backgroundColor: '#27334d',
      },
    },
  },
};
