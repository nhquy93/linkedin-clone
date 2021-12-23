import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { User } from 'src/app/auth/models/user.model';
import { FriendRequest } from 'src/app/home/models/FriendRequest';
import { ConnectionProfileService } from 'src/app/home/services/connection-profile.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-friend-requests-popover',
  templateUrl: './friend-requests-popover.component.html',
  styleUrls: ['./friend-requests-popover.component.scss'],
})
export class FriendRequestsPopoverComponent implements OnInit, OnDestroy {
  friendRequests: FriendRequest[] = [];
  creatorId: number;
  private subs: Subscription[];

  constructor(
    private popoverController: PopoverController,
    private connectionProfileService: ConnectionProfileService,
  ) { }

  ngOnInit() {
    this.subs = [
      this.connectionProfileService._friendRequests$.subscribe((friendRequests) => {
        if (!friendRequests) return;
        this.friendRequests = friendRequests;
        friendRequests.map((friendRequest: FriendRequest) => {
          this.creatorId = (friendRequest as any)?.creator?.id;
          if (friendRequest && this.creatorId) {
            this.connectionProfileService
              .getConnectionUser(this.creatorId)
              .pipe(
                take(1),
                tap((user: User) => {
                  friendRequest['fullImagePath'] = `${environment.baseApiUrl}/feed/image/${user?.imagePath || 'blank-profile-user.png'}`;
                })
              ).subscribe();
          }
        })
      })
    ];
    // this.connectionProfileService.friendRequests.map((friendRequest: FriendRequest) => {
    //   const creatorId = (friendRequest as any)?.creator?.id;
    //   if (friendRequest && creatorId)
    //     this.connectionProfileService
    //       .getConnectionUser(creatorId)
    //       .pipe(
    //         take(1),
    //         tap((user: User) => {
    //           friendRequest['fullImagePath'] = `${environment.baseApiUrl}/feed/image/${user?.imagePath || 'blank-profile-user.png'}`;
    //         })
    //       ).subscribe();
    // })
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  async respondToFriendRequest(id: number, statusResponse: 'accepted' | 'declined') {
    const handledFriendRequest: FriendRequest = this.friendRequests.find((friendRequest) => friendRequest.id === id);
    const unhandledFriendRequests: FriendRequest[] = this.friendRequests.filter((friendRequest) => friendRequest.id !== handledFriendRequest.id);

    this.friendRequests = unhandledFriendRequests;

    if (this.friendRequests.length === 0) {
      await this.popoverController.dismiss();
    }

    return this.connectionProfileService
      .respondToFriendRequest(id, statusResponse)
      .pipe(take(1))
      .subscribe(() => this.connectionProfileService.getFriendRequests().subscribe());
  }
}
