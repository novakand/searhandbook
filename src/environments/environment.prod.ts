import { Application } from 'h21-be-ui-kit';

import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  debounceTime: 300,
  production: true,
  ssoUri: 'https://horse21pro.com/api/',
  paymentWidgetUri: 'https://acaptureservices.com',
  apiOrderUri: 'https://be-orders-api-prod.azurewebsites.net/api/',
  apiPoiUri: 'https://h21-poi-api-prod.azurewebsites.net/api/',
  apiHotelRoomUri: 'https://h21-hotels-be-airclub-api-prod.azurewebsites.net/api/',
  apiHotelUri: 'https://h21-hotels-be-api-prod.azurewebsites.net/api/',
  apiGatewayUri: 'https://h21-searching-book-gateway-api-prod.azurewebsites.net/api/',
  iconsUri: 'https://ref21api.horse21.nl/',

  auth: {
    issuer: 'https://travelid.pro/',
    clientId: 'sab-ui',
    scope: 'openid profile references filestorage identityserver',
    redirectUri: `${window.location.origin}/`,
    postLogoutRedirectUri: `${window.location.origin}/`,
    silentRefreshRedirectUri: `${window.location.origin}/assets/silent-refresh.html`,
  },
  core: {
    application: Application.AGENT_OFFICE,
    profileApi: 'https://profile21api.horse21.nl/api/',
    apiRootUrl: 'https://be-transfer-api-prod.azurewebsites.net/api/',
    connectorApi: 'https://connector21api.horse21.nl/api/',
    signalrUrl: 'https://Notify21api.horse21.nl/searchandbook',
    fileStorageUrl: 'https://profile21api.horse21.nl/api/FileInfo/',
    referencesUrl: 'https://ref21api.horse21.nl/api/',
    dashboardUrlUri: 'https://dashboard.horse21pro.com/',
  },
  appInsightsConfig: {
    instrumentationKey: '87aef76f-a410-43a9-92e9-77201689a97d',
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
