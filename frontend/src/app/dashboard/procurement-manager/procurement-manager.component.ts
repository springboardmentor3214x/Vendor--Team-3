import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

@Component({
  selector: 'app-procurement-manager',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  templateUrl: './procurement-manager.component.html',
  styleUrl: './procurement-manager.component.scss'
})
export class ProcurementManagerComponent {
  constructor(public sidebarService: SidebarService) {}
}
