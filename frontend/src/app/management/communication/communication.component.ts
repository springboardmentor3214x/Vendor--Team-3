import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

interface Message {
  sender: string;
  roleLabel: string;
  text: string;
  timestamp: string;
  fileName?: string;
}

@Component({
  selector: 'app-communication',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './communication.component.html',
  styleUrl: './communication.component.scss'
})
export class CommunicationComponent {
  messages: Message[] = [];
  newMessage = '';
  selectedFileName = '';

  constructor(public sidebarService: SidebarService, private router: Router) {
    this.loadMessages();
  }

  loadMessages() {
    const cached = localStorage.getItem('vrp_messages');
    if (cached) {
      this.messages = JSON.parse(cached);
    } else {
      this.messages = [
        { sender: 'Maria Smith', roleLabel: 'Procurement Manager', text: 'Hi, please upload the GST invoice file for PO101.', timestamp: '10:15 AM' },
        { sender: 'Peter Parker', roleLabel: 'Vendor (ABC Pvt Ltd)', text: 'Sure, doing it right away. Attached the invoice below.', timestamp: '10:20 AM', fileName: 'Invoice_PO101_ABC.pdf' },
        { sender: 'John Doe', roleLabel: 'Finance Officer', text: 'Thank you, verified. Setting up NEFT transfer schedule.', timestamp: '10:30 AM' }
      ];
      this.saveMessages();
    }
  }

  saveMessages() {
    localStorage.setItem('vrp_messages', JSON.stringify(this.messages));
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  sendMessage() {
    if (!this.newMessage.trim() && !this.selectedFileName) {
      return;
    }
    const currentRole = this.sidebarService.getCurrentRoleLabel();
    const email = localStorage.getItem('userEmail') || 'user@vrp.com';
    const senderName = email.split('@')[0].toUpperCase();

    const msg: Message = {
      sender: senderName,
      roleLabel: currentRole,
      text: this.newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileName: this.selectedFileName || undefined
    };

    this.messages.push(msg);
    this.saveMessages();

    // Reset
    this.newMessage = '';
    this.selectedFileName = '';
  }

  simulateAttach() {
    this.selectedFileName = 'Mock_Contract_Copy.pdf';
    alert('Simulated file attachment: Mock_Contract_Copy.pdf');
  }
}
