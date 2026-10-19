import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StartupLoadingService {
  readonly visible = signal(false);
  readonly error = signal<string | null>(null);
  private pending = 0;
  private revealTimer?: ReturnType<typeof setTimeout>;

  begin() {
    this.error.set(null);
    if (++this.pending === 1) {
      this.revealTimer = setTimeout(() => this.visible.set(true), 200);
    }
    let ended = false;
    return () => {
      if (ended) return;
      ended = true;
      if (--this.pending === 0) {
        clearTimeout(this.revealTimer);
        this.visible.set(false);
      }
    };
  }
}
