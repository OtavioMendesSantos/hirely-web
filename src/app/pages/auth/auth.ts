import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { AuthService } from '../../core/services/auth';
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
export class Auth implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoginMode = signal(true);
  isLoggedIn = computed(() => {
    const user = this.authService.currentUser();
    const token = this.authService.getToken();
    return user !== null || !!token;
  });

  constructor() {
    effect(() => {
      if (this.isLoggedIn()) {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
    });

    this.route.queryParams.subscribe((params) => {
      if (params['mode'] === 'register') {
        this.isLoginMode.set(false);
      } else if (params['mode'] === 'login') {
        this.isLoginMode.set(true);
      }
    });
  }

  ngOnInit() {
    if (this.isLoggedIn()) {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }

  toggleMode() {
    this.isLoginMode.update((value) => !value);
  }

  onInProgress(feature: string) {
    toast.info(`In progress: "${feature}" estará disponível em breve!`, { duration: 3500 });
  }
}
