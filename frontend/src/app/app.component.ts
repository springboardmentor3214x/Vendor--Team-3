import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarService } from './layout/sidebar.service';
import { trigger, transition, style, query, animate, group } from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            opacity: 0
          })
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0, transform: 'scale(0.99) translateY(4px)' })
        ], { optional: true }),
        group([
          query(':leave', [
            animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.99) translateY(-4px)' }))
          ], { optional: true }),
          query(':enter', [
            animate('200ms 50ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
          ], { optional: true })
        ])
      ])
    ])
  ]
})
export class AppComponent {
  title = 'frontend';

  constructor(public sidebarService: SidebarService) {}

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.isActivated ? outlet.activatedRoute : '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target) return;

    // Strictly match only the notifications button or label, avoiding parent containers/wrappers
    const isNotificationClick = 
      target.classList.contains('notifications-bell') ||
      target.classList.contains('bell-span') ||
      ((target.tagName === 'SPAN' || target.tagName === 'A') && target.textContent?.trim().includes('🔔 Notification'));

    if (isNotificationClick) {
      // If the clicked element already has a local component handler (marked by class 'bell-span'),
      // we do not call toggleNotifications here to prevent a double-toggle.
      if (!target.classList.contains('bell-span')) {
        event.preventDefault();
        event.stopPropagation();
        this.sidebarService.toggleNotifications();
      }
    }
  }
}
