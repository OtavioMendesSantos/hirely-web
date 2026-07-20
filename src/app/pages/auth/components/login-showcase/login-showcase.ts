import { Component } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-login-showcase',
  standalone: true,
  imports: [...HlmCardImports],
  templateUrl: './login-showcase.html',
})
export class LoginShowcaseComponent {}
