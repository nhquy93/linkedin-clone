import { of, throwError } from "rxjs";
import { Router } from "@angular/router";
import { User } from "../models/user.model";
import { AuthService } from "./auth.service";
import { NewUser } from "../models/new-user.model"
import { HttpErrorResponse } from "@angular/common/http";


let httpClientSpy: { post: jasmine.Spy };
let routerSpy: Partial<Router>;
let authService: AuthService;

const mockNewUser: NewUser = {
    firstName: 'user1',
    lastName: 'test',
    email: 'user1@host.domain',
    password: '123123'
}

beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    authService = new AuthService(httpClientSpy as any, routerSpy as any);
})

describe('AuthService', () => {
    describe('register', () => {
        it('should return the user', (done: DoneFn) => {
            const expectedUser: User = {
                id: 2,
                firstName: 'user1',
                lastName: 'test',
                email: 'user1@host.domain',
                role: 'user',
                imagePath: null,
                posts: null
            }

            httpClientSpy.post.and.returnValue(of(expectedUser))

            authService.register(mockNewUser).subscribe((user: User) => {
                expect(typeof user.id).toEqual('number');
                expect(user.firstName).toEqual(mockNewUser.firstName);
                expect(user.lastName).toEqual(mockNewUser.lastName);
                expect(user.email).toEqual(mockNewUser.email);
                expect((user as any).password).toBeUndefined();
                expect(user.role).toEqual('user');
                expect(user.imagePath).toBeNull();
                expect(user.posts).toBeNull();

                done();
            })

            expect(httpClientSpy.post.calls.count()).toBe(1, 'one call');
        });

        it('should return an error if email already exists', (done: DoneFn) => {
            const errorResponse = new HttpErrorResponse({
                error: 'A user has already been created with this email address',
                status: 400
            });

            httpClientSpy.post.and.returnValue(throwError(() => errorResponse));
            authService.register(mockNewUser).subscribe({
                next: () => {
                    done.fail('expected a bad request error');
                },
                error: (httpErrorResponse: HttpErrorResponse) => {
                    expect(httpErrorResponse.error).toBeUndefined();
                    // .toContain('already been created');
                    done();
                }
            });
        });
    })
})