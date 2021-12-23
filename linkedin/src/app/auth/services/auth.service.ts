import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { NewUser } from '../models/new-user.model';
import { UserResponse } from '../models/user-response.model';
import { Role, User } from '../models/user.model';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly _user$ = new BehaviorSubject<User>(null);

  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  }

  get isUserLoggedIn(): Observable<boolean> {
    return this._user$.asObservable().pipe(
      switchMap((user: User) => {
        const isUserAuthenticated = user !== null;
        return of(isUserAuthenticated);
      })
    );
  }

  // get userRole(): Observable<Role> {
  //   return this._user$.asObservable().pipe(
  //     switchMap((user: User) => {
  //       return of(user.role);
  //     })
  //   );
  // }

  // get userId(): Observable<Number> {
  //   return this._user$.asObservable().pipe(
  //     switchMap((user: User) => {
  //       return of(user.id);
  //     })
  //   );
  // }

  // get userStream(): Observable<User> {
  //   return this._user$.asObservable();
  // }

  // get userFullName(): Observable<string> {
  //   return this._user$.asObservable().pipe(
  //     switchMap((user: User) => {
  //       const fullName = user.firstName + ' ' + user.lastName;
  //       return of(fullName);
  //     })
  //   );
  // }

  get userFullImagePath(): Observable<string> {
    return this._user$.asObservable().pipe(
      switchMap((user: User) => {
        const doesAuthorHaveImage = !!user?.imagePath;
        let fullImagePath = doesAuthorHaveImage ?
          this.getFullImagePath(user.imagePath) :
          this.getDefaultFullImageName();

        return of(fullImagePath);
      })
    )
  }

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  getDefaultFullImageName(): string {
    return `${environment.baseApiUrl}/feed/image/blank-profile-user.png`;
  }

  getFullImagePath(imageName: string): string {
    return `${environment.baseApiUrl}/feed/image/${imageName}`;
  }

  getUserImage() {
    return this.http.get(`${environment.baseApiUrl}/user/image`).pipe(take(1));
  }

  getUserImageName(): Observable<{ imageName: string }> {
    return this.http.get<{ imageName: string }>(`${environment.baseApiUrl}/user/image-name`).pipe(take(1));
  }

  updateUserImagePath(imagePath: string): Observable<User> {
    return this._user$.pipe(
      take(1),
      map((user: User) => {
        user.imagePath = imagePath;
        return user;
      }),
      tap((user) => this._user$.next(user))
    )
  }

  uploadUserImage(formData: FormData): Observable<{ modifiedFileName: string }> {
    return this.http.post<{ modifiedFileName: string }>(
      `${environment.baseApiUrl}/user/upload`,
      formData
    )
      .pipe(
        tap(({ modifiedFileName }) => {
          let user = this._user$.value;
          user.imagePath = modifiedFileName;
          this._user$.next(user);
        })
      )
  }

  register(newUser: NewUser): Observable<User> {
    return this.http.post<User>(
      `${environment.baseApiUrl}/auth/register`,
      newUser,
      this.httpOptions
    ).pipe(take(1));
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${environment.baseApiUrl}/auth/login`,
      { email, password },
      this.httpOptions
    )
      .pipe(
        take(1),
        tap((response: { token: string }) => {
          Plugins.Storage.set({
            key: 'token',
            value: response.token
          });
          const decodedToken: UserResponse = jwt_decode(response.token);
          this._user$.next(decodedToken.user);
        })
      );
  }

  isTokenInStorage(): Observable<boolean> {
    return from(Plugins.Storage.get({
      key: 'token'
    }))
      .pipe(map((data: { value: string }) => {
        if (!data || !data.value) return null;

        const decodedToken: UserResponse = jwt_decode(data.value);
        const jwtExpirationInMsSinceUnixEpoch = decodedToken.exp * 1000;
        const isExpired = new Date() > new Date(jwtExpirationInMsSinceUnixEpoch);

        if (isExpired) return;
        if (decodedToken.user) {
          this._user$.next(decodedToken.user);
          return true;
        }
      }));
  }

  logout(): void {
    this._user$.next(null);
    Plugins.Storage.remove({ key: 'token' });
    this.router.navigateByUrl('/auth');
  }
}
