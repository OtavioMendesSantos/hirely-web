import { Component } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-register-showcase',
  standalone: true,
  imports: [...HlmCardImports],
  host: {
    class: 'hidden lg:block w-full lg:order-1',
  },
  templateUrl: './register-showcase.html',
})
export class RegisterShowcaseComponent {}
