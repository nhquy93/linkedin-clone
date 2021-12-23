import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NewUser } from './models/new-user.model';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  @ViewChild('form') form: NgForm;
  submissionType: 'login' | 'join' = 'login';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  onSubmit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.value;
    switch (this.submissionType) {
      case 'login':
        this.authService.login(email, password).subscribe(() => {
          this.router.navigateByUrl('/home');
        });
        break;
      case 'join':
        const { firstName, lastName } = this.form.value;
        const newUser: NewUser = {
          firstName, lastName, email, password
        };
        this.authService.register(newUser).subscribe(() => {
          this.toggleText();
        });
        break;
      default: return;
    }
  }

  toggleText() {
    switch (this.submissionType) {
      case 'login':
        this.submissionType = 'join';
        break;
      case 'join':
        this.submissionType = 'login';
        break;
      default: return;
    }
  }
}
