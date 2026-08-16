import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { ApiService } from '../../services/api.service';
import { PerformanceService } from '../performance.service';
import { HttpClient } from '@angular/common/http';
import { WebsocketService } from '../../services/websocket.service';

interface Contact {
  id: string;
  name: string;
  role: string;
  lastMessage?: string;
  unread?: number;
  avatar: string;
}

interface ChatMessage {
  id?: number;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  isOwn: boolean;
  procurement_id?: number;
  attachment_path?: string;
}

interface MessageGroup {
  date: string;
  messages: ChatMessage[];
}

@Component({
  selector: 'app-communication',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './communication.component.html',
  styleUrl: './communication.component.scss'
})
export class CommunicationComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  // Current user info
  currentUserEmail = '';
  currentUserRole = '';
  currentUserName = '';

  // Contacts list (people this user can message based on working relationships)
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  contactSearch = '';
  selectedContact: Contact | null = null;

  // Messages in the current thread
  messageGroups: MessageGroup[] = [];
  newMessage = '';
  selectedMessageFile: File | null = null;
  loading = false;
  sendingMessage = false;
  contactsLoading = true;
  shouldScroll = false;

  // System notifications
  systemMessages: any[] = [];
  showSystemMessages = false;
  unreadCount = 0;

  private pollInterval: any;
  private apiUrl = environment.apiUrl;
  private wsSubscription: any;

  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private api: ApiService,
    private performanceService: PerformanceService,
    private http: HttpClient,
    private ws: WebsocketService
  ) {}

  ngOnInit() {
    this.currentUserEmail = localStorage.getItem('userEmail') || '';
    this.currentUserRole = this.sidebarService.getCurrentRole();
    this.currentUserName = this.sidebarService.getCurrentRoleLabel();
    this.loadContacts();
    this.loadSystemMessages();
    
    // Set up WebSocket
    const myIdStr = localStorage.getItem('userId') || '1';
    this.ws.connect(parseInt(myIdStr, 10));
    
    this.wsSubscription = this.ws.messages$.subscribe(data => {
      if (data.type === 'new_message') {
        const msg = data.message;
        // If the message is from our currently selected contact, reload thread
        if (this.selectedContact && (msg.sender_id.toString() === this.selectedContact.id.toString() || msg.receiver_id.toString() === this.selectedContact.id.toString())) {
          this.loadThread(this.selectedContact);
        } else {
          // Play sound or show badge, for now just reload contacts to update unread counts
          this.loadContacts();
        }
        this.loadSystemMessages();
      } else if (data.type === 'messages_read' || data.type === 'notification_read') {
        this.loadSystemMessages();
      }
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  loadContacts() {
    this.contactsLoading = true;
    const role = this.currentUserRole;

    this.api.getAllUsers().subscribe({
      next: (users) => {
        if (role === 'vendor') {
          this.performanceService.getVendors().subscribe({
            next: (vendors) => {
              const myVendor = vendors.find((v: any) =>
                v.email && v.email.toLowerCase() === this.currentUserEmail.toLowerCase()
              );
              if (!myVendor) {
                this.contacts = this.getDefaultProcurementContacts(users);
                this.filteredContacts = [...this.contacts];
                this.contactsLoading = false;
                return;
              }
              this.performanceService.getPurchaseOrders().subscribe({
                next: (pos) => {
                  const myPOs = pos.filter((po: any) => po.vendor_id === myVendor.vendor_id);
                  if (myPOs.length === 0) {
                    this.contacts = this.getDefaultProcurementContacts(users);
                  } else {
                    this.buildContactsFromPOs(myPOs, 'procurement', users);
                  }
                  this.filteredContacts = [...this.contacts];
                  this.contactsLoading = false;
                },
                error: () => {
                  this.contacts = this.getDefaultProcurementContacts(users);
                  this.filteredContacts = [...this.contacts];
                  this.contactsLoading = false;
                }
              });
            },
            error: () => {
              this.contacts = this.getDefaultProcurementContacts(users);
              this.filteredContacts = [...this.contacts];
              this.contactsLoading = false;
            }
          });

        } else if (role === 'procurement' || role === 'admin') {
          this.performanceService.getPurchaseOrders().subscribe({
            next: (pos) => {
              this.performanceService.getVendors().subscribe({
                next: (vendors) => {
                  const vendorIds = [...new Set(pos.map((po: any) => po.vendor_id))] as number[];
                  this.contacts = vendorIds.slice(0, 10).map((vid: number) => {
                    const vendor = vendors.find((v: any) => v.vendor_id === vid);
                    const vendorUser = vendor ? users.find((u: any) => u.email === vendor.email) : null;
                    const userId = vendorUser ? vendorUser.user_id : vid;
                    return {
                      id: userId.toString(),
                      name: vendor ? vendor.company_name : `Vendor #${vid}`,
                      role: 'Vendor',
                      avatar: '🏢',
                      unread: 0
                    };
                  });
                  this.filteredContacts = [...this.contacts];
                  this.contactsLoading = false;
                },
                error: () => { this.contactsLoading = false; }
              });
            },
            error: () => { this.contactsLoading = false; }
          });

        } else if (role === 'supply') {
          this.contacts = this.getDefaultProcurementContacts(users);
          this.filteredContacts = [...this.contacts];
          this.contactsLoading = false;

        } else if (role === 'finance') {
          const pm = users.find(u => u.role_id === 2);
          const sm = users.find(u => u.role_id === 3);
          this.contacts = [];
          if (pm) this.contacts.push({ id: pm.user_id.toString(), name: pm.full_name, role: 'Procurement Manager', avatar: '🛒', unread: 0 });
          if (sm) this.contacts.push({ id: sm.user_id.toString(), name: sm.full_name, role: 'Supply Chain Manager', avatar: '🚚', unread: 0 });
          this.filteredContacts = [...this.contacts];
          this.contactsLoading = false;
        } else {
          this.contacts = [];
          this.filteredContacts = [];
          this.contactsLoading = false;
        }
      },
      error: () => {
        // Fallback if users fail to load
        this.contacts = [];
        this.filteredContacts = [];
        this.contactsLoading = false;
      }
    });
  }

  buildContactsFromPOs(pos: any[], targetRole: string, users: any[]) {
    const pms = users.filter(u => u.role_id === 2);
    this.contacts = pms.map(pm => ({
      id: pm.user_id.toString(),
      name: pm.full_name || 'Procurement Manager',
      role: 'Procurement',
      avatar: '🛒',
      unread: 0,
      lastMessage: `RE: PO${pos[0]?.order_id}`
    }));
    
    if (pos.length > 1) {
      const sms = users.filter(u => u.role_id === 3);
      sms.forEach(sm => {
        this.contacts.push({ id: sm.user_id.toString(), name: sm.full_name || 'Supply Chain Manager', role: 'Supply', avatar: '🚚', unread: 0 });
      });
    }
  }

  getDefaultProcurementContacts(users: any[]): Contact[] {
    const pms = users.filter(u => u.role_id === 2);
    return pms.map(pm => ({
      id: pm.user_id.toString(),
      name: pm.full_name || 'Procurement Manager',
      role: 'Procurement Manager',
      avatar: '🛒',
      unread: 0
    }));
  }

  filterContacts() {
    const term = this.contactSearch.toLowerCase();
    this.filteredContacts = this.contacts.filter(c =>
      c.name.toLowerCase().includes(term) || c.role.toLowerCase().includes(term)
    );
  }

  selectContact(contact: Contact) {
    this.selectedContact = contact;
    this.messageGroups = [];
    this.loadThread(contact);
  }

  getSafeDate(dt: string): Date {
    if (!dt) return new Date();
    return new Date(dt.endsWith('Z') ? dt : dt + 'Z');
  }

  loadThread(contact: Contact) {
    this.loading = true;
    const myIdStr = localStorage.getItem('userId') || '1';
    
    // Fetch all messages (the backend now filters to only our messages)
    this.api.getAllMessages().subscribe({
      next: (allMsgs) => {
        const threadMsgs = allMsgs.filter(m => 
          (m.sender_id.toString() === contact.id.toString() && m.receiver_id.toString() === myIdStr) || 
          (m.receiver_id.toString() === contact.id.toString() && m.sender_id.toString() === myIdStr)
        );

        // Sort by time
        threadMsgs.sort((a, b) => this.getSafeDate(a.sent_at).getTime() - this.getSafeDate(b.sent_at).getTime());

        const groups: { [date: string]: ChatMessage[] } = {};
        
        threadMsgs.forEach(m => {
          const mDate = this.getSafeDate(m.sent_at);
          const dateStr = mDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
          const msg: ChatMessage = {
            id: m.message_id,
            senderId: m.sender_id.toString(),
            senderName: m.sender_id.toString() === contact.id.toString() ? contact.name : 'You',
            text: m.message,
            time: mDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            isOwn: m.sender_id.toString() === myIdStr,
            attachment_path: m.attachment_path
          };
          if (!groups[dateStr]) groups[dateStr] = [];
          groups[dateStr].push(msg);
        });

        this.messageGroups = Object.keys(groups).map(date => ({
          date,
          messages: groups[date]
        }));

        this.loading = false;
        this.shouldScroll = true;
      },
      error: () => {
        this.messageGroups = [];
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedMessageFile = event.target.files[0] || null;
  }

  sendMessage() {
    if ((!this.newMessage.trim() && !this.selectedMessageFile) || !this.selectedContact) return;
    this.sendingMessage = true;

    // Use current user's actual ID if possible, otherwise default to a number
    // We can extract user ID from profile or use 1 for now if not available
    const myIdStr = localStorage.getItem('userId') || '1';
    
    const payload = {
      sender_id: parseInt(myIdStr, 10),
      receiver_id: parseInt(this.selectedContact.id.replace('vendor_', ''), 10),
      procurement_id: 1, // Default fallback
      message: this.newMessage.trim() || 'Attached a file'
    };

    this.api.sendMessage(payload).subscribe({
      next: (res: any) => {
        if (this.selectedMessageFile && res.message_id) {
          this.api.uploadMessageAttachment(res.message_id, this.selectedMessageFile).subscribe({
            next: () => {
              this.finishSendMessage();
            },
            error: () => {
              console.error('File upload failed');
              this.finishSendMessage();
            }
          });
        } else {
          this.finishSendMessage();
        }
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.sendingMessage = false;
      }
    });
  }

  finishSendMessage() {
    this.newMessage = '';
    this.selectedMessageFile = null;
    this.sendingMessage = false;
    this.loadThread(this.selectedContact!);
  }

  downloadAttachment(messageId: number | undefined) {
    if (!messageId) return;
    this.api.downloadMessageAttachment(messageId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attachment_${messageId}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: (err) => {
        console.error('Download failed', err);
        alert('Could not download attachment.');
      }
    });
  }

  getStoredMessages(contactId: string): ChatMessage[] {
    return [];
  }

  loadSystemMessages() {
    this.api.getMyMessages().subscribe({
      next: (data) => {
        this.systemMessages = data;
        this.unreadCount = data.filter((m: any) => !m.is_read).length;
      },
      error: () => {}
    });
  }

  markAllRead() {
    this.api.markAllRead().subscribe({
      next: () => {
        this.systemMessages.forEach(m => m.is_read = true);
        this.unreadCount = 0;
      }
    });
  }

  scrollToBottom() {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (e) {}
  }

  getRelativeTime(dateStr: string): string {
    if (!dateStr) return '';
    const now = new Date();
    const then = this.getSafeDate(dateStr);
    const diff = Math.floor((now.getTime() - then.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
    return then.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }

  formatTime(sentAt: string): string {
    if (!sentAt) return '';
    return this.getSafeDate(sentAt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }

  isSystemMessage(msg: any): boolean {
    return msg.message?.startsWith('📦') || msg.message?.startsWith('✅') ||
           msg.message?.startsWith('📬') || msg.message?.startsWith('🎉') ||
           msg.message?.startsWith('❌') || msg.message?.startsWith('ℹ️');
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  onKeydown(event: any) {
    if (!event.shiftKey) {
      this.sendMessage();
      event.preventDefault();
    }
  }
}
