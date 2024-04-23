import { Application } from 'h21-be-ui-kit';

import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  debounceTime: 300,
  production: false,
  ssoUri: 'https://horse21pro.com/api/',
  paymentWidgetUri: 'https://test.acaptureservices.com',
  apiOrderUri: 'https://be-orders-api-prod-qa.azurewebsites.net/api/',
  apiPoiUri: 'https://h21-poi-api-qa.azurewebsites.net/api/',
  apiHotelUri: 'https://h21-hotels-be-api-qa.azurewebsites.net/api/',
  apiHotelRoomUri: 'https://h21-hotels-be-airclub-api-qa.azurewebsites.net/api/',
  apiGatewayUri: 'https://h21-searching-book-gateway-api-qa.azurewebsites.net/api/',
  iconsUri: 'https://ref21pro-prod-qa.azurewebsites.net/',

  auth: {
    issuer: 'https://id21pro-prod-qa.azurewebsites.net/',
    clientId: 'sab-ui',
    scope: 'openid profile references filestorage identityserver',
    redirectUri: `${window.location.origin}/`,
    postLogoutRedirectUri: `${window.location.origin}/`,
    silentRefreshRedirectUri: `${window.location.origin}/assets/silent-refresh.html`,
  },
  core: {
    application: Application.AGENT_OFFICE,
    profileApi: 'https://profile21pro-prod-qa.azurewebsites.net/api/',
    apiRootUrl: 'https://be-transfer-api-prod-qa.azurewebsites.net/api/',
    connectorApi: 'https://connector21pro-prod-qa.azurewebsites.net/api/',
    signalrUrl: 'https://notify-prod-qa.azurewebsites.net/searchandbook',
    fileStorageUrl: 'https://connector21pro-prod-qa.azurewebsites.net/api/FileInfo/',
    referencesUrl: 'https://ref21pro-prod-qa.azurewebsites.net/api/',
    dashboardUrlUri: 'https://agent-office-prod-qa.azurewebsites.net/',
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
