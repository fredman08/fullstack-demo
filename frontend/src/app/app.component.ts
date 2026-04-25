import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="navbar">
      <a routerLink="/" class="brand">⚡ FullStack Demo</a>
      <a routerLink="/customers">Customers</a>
    </nav>
    <router-outlet />
  `,
})
export class AppComponent {}
