import { BrandComponent } from '../../../../shared/components/brand/brand';
import { Component } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-login-showcase',
  standalone: true,
  imports: [BrandComponent, ...HlmCardImports],
  host: {
    class: 'hidden lg:block w-full',
  },
  templateUrl: './login-showcase.html',
})
export class LoginShowcaseComponent {}
