import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FileTypeResult, fromBuffer } from 'file-type';
import { BehaviorSubject, from, of, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Role, User } from 'src/app/auth/models/user.model';
import { AuthService } from 'src/app/auth/services/auth.service';
import { BannerColorService } from '../../services/banner-color.service';

type ValidFileExtensions = 'png' | 'jpg' | 'jpeg';
type ValidMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';


@Component({
  selector: 'app-profile-summary',
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss'],
})
export class ProfileSummaryComponent implements OnInit, OnDestroy {
  fullName = '';
  form: FormGroup;
  userFullImagePath: string;
  bannerColors;

  validFileExtensions: ValidFileExtensions[] = ['png', 'jpg', 'jpeg'];
  validMimeType: ValidMimeType[] = ['image/png', 'image/jpg', 'image/jpeg'];

  private subs: Subscription[];

  constructor(
    private authService: AuthService,
    private bannerColorService: BannerColorService
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      file: new FormControl(null)
    });

    this.subs = [
      this.authService.userFullImagePath
        .subscribe((fullImagePath: string) => {
          this.userFullImagePath = fullImagePath;
        }),
      this.authService._user$.subscribe((user: User) => {
        if (user?.role)
          this.bannerColors = this.bannerColorService.getBannerColors(user.role);
        if (user && user?.firstName && user?.lastName) {
          this.fullName = user.firstName + ' ' + user.lastName;
        }
      })
    ];
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }



  onFileSelect(event: Event): void {
    const file: File = (event.target as HTMLInputElement).files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    from(file.arrayBuffer())
      .pipe(
        switchMap((buffer: Buffer) => {
          return from(fromBuffer(buffer)).pipe(
            switchMap((fileTypeResult: FileTypeResult) => {
              if (!fileTypeResult) {
                console.log({ error: 'File format not supported!' })
                return of();
              }
              const { ext, mime } = fileTypeResult;
              const isFileTypeLegit = this.validFileExtensions.includes(ext as any);
              const isMimeTypeLegit = this.validMimeType.includes(mime as any);
              const isFileLegit = isFileTypeLegit && isMimeTypeLegit;
              if (!isFileLegit) {
                console.log({ error: 'File format not supported!' })
                return of();
              }
              return this.authService.uploadUserImage(formData);
            })
          );
        })
      ).subscribe();

    this.form.reset();
  }
}
