
import { PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: 'e0d5238b-6f6a-4a36-badb-671f593255b0',
    authority: 'https://login.microsoftonline.com/a8bb09eb-8699-47bf-ba6b-122458d196e7',
    redirectUri: `${window.location.origin}/auth/callback`,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: true,
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile'],
};

export const msalInstance = new PublicClientApplication(msalConfig);


