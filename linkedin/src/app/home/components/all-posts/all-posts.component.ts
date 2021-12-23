import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { BehaviorSubject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { User } from 'src/app/auth/models/user.model';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Post } from '../../models/Post';
import { PostService } from '../../services/post.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.scss'],
})
export class AllPostsComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @Input() postBody?: string;

  queryParams: string;
  userId: number;
  allLoadedPosts: Post[] = [];
  numberOfPosts = 5;
  skipPosts = 0;

  private sub: Subscription;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private modalController: ModalController
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    const postBody = changes.postBody.currentValue;
    if (!postBody) return;
    this.postService.createPost(postBody).subscribe((post: Post) => {
      this.authService.userFullImagePath
        .pipe(take(1))
        .subscribe((fullImagePath: string) => {
          post['fullImagePath'] = fullImagePath;
          this.allLoadedPosts.unshift(post);
        })
    });
  }

  ngOnInit() {
    this.sub = this.authService._user$.subscribe((user: User) => {
      if (!user) return;
      this.userId = user.id;

      this.allLoadedPosts.forEach((post: Post, idx: number) => {
        if (user?.imagePath && post.author.id === user.id) {
          this.allLoadedPosts[idx]['fullImagePath'] =
            this.authService.getFullImagePath(user.imagePath);
        }
      });
    });

    this.getPosts(false, '');
    // this.authService.userId.pipe(take(1)).subscribe((userId: number) => {
    //   this._userId$.next(userId);
    // })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getPosts(isInitialLoad: boolean, event) {
    if (this.skipPosts === 20) {
      event.target.disabled = true;
    }
    this.queryParams = `?take=${this.numberOfPosts}&skip=${this.skipPosts}`;

    this.postService.getSelectedPosts(this.queryParams).subscribe((posts: Post[]) => {
      for (let postIdx = 0; postIdx < posts.length; ++postIdx) {
        const doesAuthorHaveImage = !!posts[postIdx].author.imagePath && posts[postIdx].author.imagePath !== 'null';
        let fullImagePath = doesAuthorHaveImage ?
          this.authService.getFullImagePath(posts[postIdx].author.imagePath) :
          this.authService.getDefaultFullImageName();
        posts[postIdx]['fullImagePath'] = fullImagePath;

        this.allLoadedPosts.push(posts[postIdx]);
      }
      if (isInitialLoad) event.target.complete();
      this.skipPosts = this.skipPosts + 5;
    })
  }

  loadData(event: any) {
    this.getPosts(true, event);
  }

  async presentUpdateModal(postId: number) {
    console.log('EDIT POST: ', postId);
    const postBody = this.allLoadedPosts[this.allLoadedPosts.findIndex((post: Post) => post.id === postId)].body;
    const modal = await this.modalController.create({
      component: ModalComponent,
      cssClass: 'modal-post-wrapper',
      componentProps: {
        postBody: postBody,
        edit: true
      }
    })
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (!data) return;
    const updatedPostBody = data.post.body;
    this.postService.updatePost(postId, updatedPostBody).subscribe(() => {
      const postIdx = this.allLoadedPosts.findIndex((post: Post) => post.id === postId);
      this.allLoadedPosts[postIdx].body = updatedPostBody;
    });
  }

  deletePost(postId: number) {
    console.log('DELETE POST: ', postId);
    this.postService.deletePost(postId).subscribe(() => {
      this.allLoadedPosts = this.allLoadedPosts.filter((post: Post) => post.id !== postId);
    });
  }
}
