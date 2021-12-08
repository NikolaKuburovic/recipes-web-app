import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, tap } from "rxjs/operators";
import { BehaviorSubject, Subject, throwError } from "rxjs";
import { User } from "./user.model";

export interface AuthResponseData {
    kind: string; 
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Injectable({providedIn: 'root'})
export class AuthService {

    user = new BehaviorSubject<User>(null); 
    
    constructor(private http: HttpClient) {}

    signup(email: string, password: string){
        return this.http.post<AuthResponseData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=111',
        {
            email: email,
            password: password,
            returnSecureToken: true
        }
        ).pipe(catchError(this.errorHandle), tap(resData => {
            this.handleAuthenctication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
        }));

    }

    login(email: string, password: string){
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=111',
        {
            email: email,
            password: password,
            returnSecureToken: true 
        }).pipe(catchError(this.errorHandle),
        tap(resData => {
            this.handleAuthenctication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
        }));
    }
    
    private handleAuthenctication(email: string, userId: string, token: string, expiresIn: number){
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
            const user = new User(email, userId, token, expirationDate);
            this.user.next(user);
    }

    private errorHandle(errorResponse: HttpErrorResponse){
        let errorMessage = "An unknown message occurred";
        if(!errorResponse.error || !errorResponse.error.error){
            return throwError(errorMessage);
        }
        switch(errorResponse.error.error.message){
            case 'EMAIL_EXISTS':
                errorMessage = 'This email exists already';
                break;
            case 'EMAIL_NOT_FOUND':
                errorMessage = 'This email is not found';
                break;
            case 'INVALID_PASSWORD':
                errorMessage = 'This password is not correct';
                break;
            }
            return throwError(errorMessage);
    }

}