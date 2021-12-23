import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { User } from 'src/app/auth/models/user.model';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit, OnDestroy {
  fullName = '';
  userFullImagePath: string;
  private subs: Subscription[];

  constructor(
    private authService: AuthService,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    this.subs = [
      this.authService.userFullImagePath
        .subscribe((fullImagePath: string) => {
          this.userFullImagePath = fullImagePath;
        }),
      this.authService._user$
        .subscribe((user: User) => {
          if (user && user?.firstName && user?.lastName)
            this.fullName = user.firstName + ' ' + user.lastName;
        })
    ];
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  onSignOut() {
    this.authService.logout();
    this.popoverController.dismiss();
  }
}
