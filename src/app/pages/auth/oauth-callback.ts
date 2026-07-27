import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [...HlmSpinnerImports],
  template: `
    <div class="bg-surface flex min-h-screen flex-col items-center justify-center">
      <hlm-spinner class="text-primary inline-flex text-[3rem]" />
      <p class="text-on-surface mt-4 font-medium">Authenticating...</p>
    </div>
  `,
})
export class OAuthCallback implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      if (!code) {
        toast.error('No authorization code provided');
        this.router.navigate(['/auth']);
        return;
      }

      const redirectUri = window.location.origin + '/auth/callback';

      this.authService.oauthLogin(code, redirectUri).subscribe({
        next: () => {
          toast.success('Successfully logged in');
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          toast.error('Failed to authenticate with Google');
          this.router.navigate(['/auth']);
        },
      });
    });
  }
}
