import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

@Component({
  selector: 'app-finance-officer',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  templateUrl: './finance-officer.component.html',
  styleUrl: './finance-officer.component.scss'
})
export class FinanceOfficerComponent {
  constructor(public sidebarService: SidebarService) {}
}
