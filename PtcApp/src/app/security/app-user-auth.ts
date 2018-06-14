import { AppUserClaim } from './app-user-claim';

export class AppUserAuth {
    userName = '';
    bearerToken = '';
    isAuthenticated = false;
    claims = <Array<AppUserClaim>>[];
}
