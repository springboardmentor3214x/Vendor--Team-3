import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-core-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './core-layout.component.html',
  styleUrl: './core-layout.component.scss'
})
export class CoreLayoutComponent {
}
