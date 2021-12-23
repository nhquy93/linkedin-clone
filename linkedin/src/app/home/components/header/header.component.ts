import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { FriendRequest } from '../../models/FriendRequest';
import { ConnectionProfileService } from '../../services/connection-profile.service';
import { FriendRequestsPopoverComponent } from './friend-requests-popover/friend-requests-popover.component';
import { PopoverComponent } from './popover/popover.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userFullImagePath: string;
  friendRequests: FriendRequest[] = [];
  private subs: Subscription[];

  constructor(
    private authService: AuthService,
    private popoverController: PopoverController,
    private connectionProfileService: ConnectionProfileService
  ) { }

  ngOnInit() {
    this.connectionProfileService.getFriendRequests().subscribe();
    this.subs =
      [
        this.authService.userFullImagePath
          .subscribe((fullImagePath: string) => {
            this.userFullImagePath = fullImagePath;
          }),
        this.connectionProfileService._friendRequests$.subscribe((friendRequests: FriendRequest[]) => {
          if (!friendRequests) return;
          this.friendRequests = friendRequests.filter((friendRequest: FriendRequest) => friendRequest.status === 'pending');
        }),
        // this.connectionProfileService.getFriendRequests().subscribe(
        //   (friendRequests: FriendRequest[]) => {
        //     this.friendRequests = this.connectionProfileService.friendRequests = friendRequests.filter((friendRequest: FriendRequest) => friendRequest.status === 'pending');
        //   }
        // )
      ];
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      cssClass: 'profile-popover-wrapper',
      event: ev,
      showBackdrop: false
    });
    await popover.present();
  }

  async presentFriendRequestPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: FriendRequestsPopoverComponent,
      cssClass: 'friend-request-popover-wrapper',
      event: ev,
      showBackdrop: false
    });
    await popover.present();
  }
}
