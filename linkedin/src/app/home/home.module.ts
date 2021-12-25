import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { AdvertisingComponent, AllPostsComponent, HeaderComponent, ProfileSummaryComponent, StartPostComponent, TabsComponent, ConnectionProfileComponent, UserProfileComponent, ChatComponent } from './components';
import { ModalComponent } from './components/modal/modal.component';
import { PopoverComponent } from './components/header/popover/popover.component';
import { FriendRequestsPopoverComponent } from './components/header/friend-requests-popover/friend-requests-popover.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [
    HomePage,
    TabsComponent,
    ChatComponent,
    ModalComponent,
    HeaderComponent,
    PopoverComponent,
    AllPostsComponent,
    StartPostComponent,
    UserProfileComponent,
    AdvertisingComponent,
    ProfileSummaryComponent,
    ConnectionProfileComponent,
    FriendRequestsPopoverComponent,
  ]
})
export class HomePageModule { }
