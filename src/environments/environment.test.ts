import { Application } from 'h21-be-ui-kit';

import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  debounceTime: 300,
  production: false,
  ssoUri: 'https://horse21pro.com/api/',
  paymentWidgetUri: 'https://test.acaptureservices.com',
  apiOrderUri: 'https://sab-api-test.azurewebsites.net/api/',
  apiPoiUri: 'https://h21-poi-api-test.azurewebsites.net/api/',
  apiHotelUri: 'https://h21-hotels-be-api.azurewebsites.net/api/',
  apiHotelRoomUri: 'https://h21-hotels-be-airclub-api.azurewebsites.net/api/',
  apiGatewayUri: 'https://h21-searching-book-gateway-api.azurewebsites.net/api/',
  iconsUri: 'https://ref21pro-t2.azurewebsites.net/',

  auth: {
    issuer: 'https://id21pro-test2.azurewebsites.net/',
    clientId: 'sab-ui',
    scope: 'openid profile references filestorage identityserver',
    redirectUri: `${window.location.origin}/`,
    postLogoutRedirectUri: `${window.location.origin}/`,
    silentRefreshRedirectUri: `${window.location.origin}/assets/silent-refresh.html`,
  },
  core: {
    application: Application.AGENT_OFFICE,
    profileApi: 'https://profile21pro-t2.azurewebsites.net/api/',
    apiRootUrl: 'https://be-transfer-test.azurewebsites.net/api/',
    connectorApi: 'https://connector21pro-t2.azurewebsites.net/api/',
    signalrUrl: 'https://be-notify.azurewebsites.net/searchandbook',
    fileStorageUrl: 'https://connector21pro-t2.azurewebsites.net/api/FileInfo/',
    referencesUrl: 'https://ref21pro-t2.azurewebsites.net/api/',
    dashboardUrlUri: 'https://agent-office.azurewebsites.net/',
  },
  appInsightsConfig: {
    instrumentationKey: 'd211c3ab-9937-42e8-9412-c8c77da396e0',
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
