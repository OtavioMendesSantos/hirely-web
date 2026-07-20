import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { LoginFormComponent } from './components/login-form/login-form';
import { RegisterFormComponent } from './components/register-form/register-form';
import { LoginShowcaseComponent } from './components/login-showcase/login-showcase';
import { RegisterShowcaseComponent } from './components/register-showcase/register-showcase';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    LoginFormComponent,
    RegisterFormComponent,
    LoginShowcaseComponent,
    RegisterShowcaseComponent,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {
  private route = inject(ActivatedRoute);

  isLoginMode = signal(true);

  constructor() {
    this.route.queryParams.subscribe((params) => {
      if (params['mode'] === 'register') {
        this.isLoginMode.set(false);
      } else if (params['mode'] === 'login') {
        this.isLoginMode.set(true);
      }
    });
  }

  toggleMode() {
    this.isLoginMode.update((value) => !value);
  }

  onInProgress(feature: string) {
    toast.info(`In progress: "${feature}" estará disponível em breve!`, { duration: 3500 });
  }
}
