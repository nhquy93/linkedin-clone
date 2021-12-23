import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-start-post',
  templateUrl: './start-post.component.html',
  styleUrls: ['./start-post.component.scss'],
})
export class StartPostComponent implements OnInit, OnDestroy {
  @Output() create$ = new EventEmitter<any>();

  userFullImagePath: string;
  private sub: Subscription;

  constructor(
    private authService: AuthService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.sub = this.authService.userFullImagePath
      .subscribe((fullImagePath: string) => {
        this.userFullImagePath = fullImagePath;
      });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  async presentModal() {
    console.log('CREATE POST');
    const modal = await this.modalController.create({
      component: ModalComponent,
      cssClass: 'modal-post-wrapper',
      componentProps: {
        edit: false
      }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (!data) return;
    this.create$.emit(data.post.body);
  }
}
