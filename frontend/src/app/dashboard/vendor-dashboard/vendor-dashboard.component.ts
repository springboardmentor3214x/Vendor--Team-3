import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, FormsModule],
  templateUrl: './vendor-dashboard.component.html',
  styleUrl: './vendor-dashboard.component.scss'
})
export class VendorDashboardComponent {
  constructor(public sidebarService: SidebarService) {}

  isChatOpen = false;
  newChatMessage = '';
  chatMessages = [
    { sender: 'Auditor', text: 'Hi, we noticed the GST Certificate registration number is blurry. Could you please double check?', time: 'Yesterday' },
    { sender: 'Vendor', text: 'Sure, I will verify the document and re-upload.', time: 'Yesterday' },
    { sender: 'Auditor', text: 'Thanks, please re-upload in the compliance section.', time: 'Today, 10:00 AM' }
  ];

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  sendChatMessage() {
    if (this.newChatMessage.trim()) {
      this.chatMessages.push({
        sender: 'Vendor',
        text: this.newChatMessage,
        time: 'Just now'
      });
      const sentMsg = this.newChatMessage;
      this.newChatMessage = '';

      // Mock auditor automatic reply after 1.5s
      setTimeout(() => {
        if (sentMsg.toLowerCase().includes('uploaded') || sentMsg.toLowerCase().includes('done')) {
          this.chatMessages.push({
            sender: 'Auditor',
            text: 'Got it. I will review it shortly. Thank you!',
            time: 'Just now'
          });
        }
      }, 1500);
    }
  }
}
