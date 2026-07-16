import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHome } from '@ng-icons/lucide';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, ...HlmCardImports, ...HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucideHome })],
  templateUrl: './not-found.html',
  styleUrl: './not-found.sass',
})
export class NotFound {}
