import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { User } from 'src/app/auth/models/user.model';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy {
  @ViewChild('form') form: NgForm;
  @Input() postBody?: string = '';
  @Input() edit: boolean = false;

  fullName = '';
  userFullImagePath: string;
  private subs: Subscription[];

  constructor(
    private authService: AuthService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.subs = [
      this.authService.userFullImagePath
        .subscribe((fullImagePath: string) => {
          this.userFullImagePath = fullImagePath;
        }),
      this.authService._user$
        .pipe(take(1))
        .subscribe((user: User) => {
          if (user && user?.firstName && user?.lastName)
            this.fullName = user.firstName + ' ' + user.lastName;
        })
    ];
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  onDismiss() {
    this.modalController.dismiss(null, 'dismiss');
  }

  onPost() {
    if (this.form.invalid) return;
    const body = this.form.value['body'];
    this.modalController.dismiss({
      post: {
        body,
        createdAt: new Date()
      }
    })
  }
}
