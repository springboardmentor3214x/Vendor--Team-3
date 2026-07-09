import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

@Component({
  selector: 'app-auditor',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  templateUrl: './auditor.component.html',
  styleUrl: './auditor.component.scss'
})
export class AuditorComponent {
  constructor(public sidebarService: SidebarService) {}
}
