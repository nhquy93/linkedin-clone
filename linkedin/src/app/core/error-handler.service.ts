import { Injectable } from "@angular/core";
import { ToastController } from "@ionic/angular";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService {
    constructor(
        private toastController: ToastController
    ) { }

    async presentToast(errorMessage: string) {
        const toast = await this.toastController.create({
            header: 'Error occurred',
            message: errorMessage,
            duration: 3000,
            color: 'danger',
            buttons: [
                {
                    icon: 'bug',
                    text: 'dismiss',
                    role: 'cancel'
                }
            ]
        })
    }

    handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.warn(`${operation} failed: ${error.message}`);
            return of(result as T).pipe(
                tap(() => this.presentToast(error.message))
            );
        }
    }
}