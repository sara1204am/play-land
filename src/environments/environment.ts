import { environmentDefault } from './default';

export const environment = {
  production: false,
  ...environmentDefault,
/*   host: 'http://localhost:3000/api', */
  host: 'https://play-land-backend-9cde6f1ea645.herokuapp.com/api',
  platformSeed: '9qxs2n3k',
  appVersion: 'v2.0.0',
  appName:'play_land',
};
