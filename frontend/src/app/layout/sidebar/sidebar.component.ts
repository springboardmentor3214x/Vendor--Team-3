import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '../sidebar.service';
import { LucideAngularModule, LayoutDashboard, Users, UserPlus, FileCheck2, ShieldCheck, ShoppingCart, Activity, ArrowUpRight, BarChart2, Bell, Search, LogOut, Settings, MessageSquare, FileText, Share2, MessageCircle } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrls: []
})
export class SidebarComponent {
  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly UserPlus = UserPlus;
  readonly FileCheck2 = FileCheck2;
  readonly ShieldCheck = ShieldCheck;
  readonly ShoppingCart = ShoppingCart;
  readonly Activity = Activity;
  readonly ArrowUpRight = ArrowUpRight;
  readonly BarChart2 = BarChart2;
  readonly Bell = Bell;
  readonly Search = Search;
  readonly LogOut = LogOut;
  readonly Settings = Settings;
  readonly MessageSquare = MessageSquare;
  readonly FileText = FileText;
  readonly Share2 = Share2;
  readonly MessageCircle = MessageCircle;

  constructor(public sidebarService: SidebarService) {}
}
