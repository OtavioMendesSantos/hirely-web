import { Component } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-register-showcase',
  standalone: true,
  imports: [...HlmCardImports],
  templateUrl: './register-showcase.html',
})
export class RegisterShowcaseComponent {}
