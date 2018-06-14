import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators/tap';

import { AppUserAuth } from './app-user-auth';
import { AppUser } from './app-user';

const API_URL = 'http://localhost:5000/api/security/';

const httpOptions = {
  headers: {
    'Content-Type': 'application/json'
  }
};

@Injectable()
export class SecurityService {

  securityObject = new AppUserAuth();

  constructor(private http: HttpClient) { }

  resetSecurityObject() {
    Object.assign(this.securityObject, {
      userName: '',
      bearerToken: '',
      isAuthenticated: false,
      claims: []
    });

    localStorage.removeItem('bearerToken');
  }

  private isClaimValid(claimType: string, claimValue?: string) {
    const auth = this.securityObject;
    if (!auth) {
      return false;
    }

    // Separate 'claimType:value', if present
    const parts = claimType.split(':');
    if (parts.length > 1) {
      claimType = parts[0].toLowerCase();
      claimValue = parts[1];
    } else {
      claimType = claimType.toLowerCase();
      // Either get the claim value, or assume 'true'
      claimValue = claimValue ? claimValue : 'true';
    }

    // Lookup the claim
    return auth.claims.find(c =>
      c.claimType.toLowerCase() === claimType &&
      c.claimValue === claimValue) != null;
  }

  // This method can be called a couple of different ways
  // *hasClaim="'claimType'" = Check if claim is present
  // *hasClaim="'claimType:value'" = Check if claim is present and claimValue=value
  // *hasClaim="['claimType1','claimType2:value','claimType3']" = -OR- check
  hasClaim(claimType: any, claimValue?: any) {
    // See if an array of values was passed in.
    if (typeof claimType === 'string') {
      return this.isClaimValid(claimType, claimValue);
    } else {
      for (const claim of claimType) {
        if (this.isClaimValid(claim)) {
          return true;
        }
      }
      return false;
    }
  }

  login(entity: AppUser): Observable<AppUserAuth> {

    // reset security object
    this.resetSecurityObject();

    return this.http.post<AppUserAuth>(API_URL + 'login', entity, httpOptions)
      .pipe(
        tap(resp => {
          // use object assign to update current object
          // NOTE: don't create a new AppUserAuth instance
          //  because that would destroy all references to that object
          //  for example, all bindings alrerady set to the properties of that object
          Object.assign(this.securityObject, resp);

          // store token in local storage
          localStorage.setItem('bearerToken', this.securityObject.bearerToken);
        })
      );
  }

  logout() {
    this.resetSecurityObject();
  }
}
