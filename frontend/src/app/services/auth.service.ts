import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

interface AuthPayload {
    token: string;
    user: {
        _id: string;
        username: string;
        email: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private tokenKey = 'auth_token';

    constructor(
        private apollo: Apollo,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    login(username: string, password: string): Observable<AuthPayload> {
        console.log('Login request sent with variables:', { username, password });
        return this.apollo
            .mutate({
                mutation: gql`
          mutation LoginUser($username: String!, $password: String!) {
            loginUser(username: $username, password: $password) {
              token
              user {
                _id
                username
                email
              }
            }
          }
        `,
                variables: {
                    username,
                    password
                }
            })
            .pipe(
                map((result: any) => {
                    console.log('Login response from server:', result);
                    return result.data.loginUser;
                }),
                catchError((error) => {
                    console.error('Login GraphQL error:', error);
                    throw error; // Re-throw to let the subscriber handle it
                })
            );
    }

    signup(username: string, email: string, password: string): Observable<AuthPayload> {
        console.log('Signup request sent with variables:', { username, email, password });
        return this.apollo
            .mutate({
                mutation: gql`
          mutation SignUpUser($username: String!, $email: String!, $password: String!) {
            signUpUser(username: $username, email: $email, password: $password) {
              token
              user {
                _id
                username
                email
              }
            }
          }
        `,
                variables: {
                    username,
                    email,
                    password
                }
            })
            .pipe(
                map((result: any) => {
                    console.log('Signup response from server:', result);
                    return result.data.signUpUser;
                }),
                catchError((error) => {
                    console.error('Signup GraphQL error:', error);
                    throw error;
                })
            );
    }

    setToken(token: string): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.tokenKey, token);
            console.log('Token set in localStorage:', token);
        }
    }

    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            const token = localStorage.getItem(this.tokenKey);
            console.log('Retrieved token from localStorage:', token);
            return token;
        }
        return null;
    }

    isLoggedIn(): boolean {
        if (!isPlatformBrowser(this.platformId)) {
            console.log('Not in browser, isLoggedIn returning false');
            return false;
        }
        const token = this.getToken();
        if (!token) {
            console.log('No token found, isLoggedIn returning false');
            return false;
        }
        try {
            const decoded: any = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            console.log('Token decoded:', decoded, 'Current time:', currentTime);
            return decoded.exp > currentTime;
        } catch (error) {
            console.error('Error decoding token:', error);
            return false;
        }
    }

    logout(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(this.tokenKey);
            console.log('Token removed from localStorage');
        }
    }
}