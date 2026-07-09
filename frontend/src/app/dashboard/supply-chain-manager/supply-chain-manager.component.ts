import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

@Component({
  selector: 'app-supply-chain-manager',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  templateUrl: './supply-chain-manager.component.html',
  styleUrl: './supply-chain-manager.component.scss'
})
export class SupplyChainManagerComponent {
  constructor(public sidebarService: SidebarService) {}
}
