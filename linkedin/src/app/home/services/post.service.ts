import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, take, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { environment } from 'src/environments/environment';
import { Post } from '../models/Post';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private errorHandlerService: ErrorHandlerService
  ) {
    this.authService
      .getUserImageName()
      .pipe(
        take(1),
        tap(({ imageName }) => {
          const defaultIImagePath = 'blank-profile-user.png';
          this.authService
            .updateUserImagePath(imageName || defaultIImagePath)
            .subscribe();
        })
      ).subscribe();
  }

  getSelectedPosts(params) {
    return this.http.get<Post[]>(
      `${environment.baseApiUrl}/feed` + params).pipe(
        tap((posts: Post[]) => {
          if (posts.length === 0) throw new Error('No posts to retrieve');
        }),
        catchError(
          this.errorHandlerService.handleError<Post[]>('getSelectedPosts', [])
        )
      );
  }

  createPost(body: string) {
    return this.http
      .post<Post>(`${environment.baseApiUrl}/feed`, { body }, this.httpOptions)
      .pipe(take(1));
  }

  updatePost(postId: number, body: string) {
    return this.http
      .put(`${environment.baseApiUrl}/feed/${postId}`, { body }, this.httpOptions)
      .pipe(take(1));
  }

  deletePost(postId: number) {
    return this.http
      .delete(`${environment.baseApiUrl}/feed/${postId}`)
      .pipe(take(1));
  }
}
