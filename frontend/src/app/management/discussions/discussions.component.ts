import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-discussions',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './discussions.component.html',
  styleUrls: ['./discussions.component.scss']
})
export class DiscussionsComponent implements OnInit {
  discussions: any[] = [];
  selectedDiscussion: any = null;
  newDiscussionTitle: string = '';
  newDiscussionEntityId: number = 0;
  newDiscussionEntityType: string = 'PurchaseOrder';
  
  messages: any[] = [];
  newMessageContent: string = '';
  loading = false;

  selectedFile: File | null = null;
  sendingMessage: boolean = false;

  constructor(
    public sidebarService: SidebarService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Mocked for demonstration since dashboard doesn't fetch all. In a full app, we'd add an endpoint.
    this.discussions = [
      { discussion_id: 1, title: 'Delivery Delay on PO-102', entity_type: 'PurchaseOrder', entity_id: 102, created_at: new Date() },
      { discussion_id: 2, title: 'Contract Renewal Discussion', entity_type: 'Contract', entity_id: 5, created_at: new Date() }
    ];
  }

  selectDiscussion(discussion: any) {
    this.selectedDiscussion = discussion;
    this.loadMessages(discussion.discussion_id);
  }

  loadMessages(discussionId: number) {
    this.loading = true;
    setTimeout(() => {
      this.messages = [
        { message_id: 1, sender_id: 1, content: 'When can we expect this?', sent_at: new Date(), isOwn: true, senderName: 'Me', attachment_path: null, time: '10:00 AM' },
        { message_id: 2, sender_id: 2, content: 'We are looking at Friday.', sent_at: new Date(), isOwn: false, senderName: 'Vendor', attachment_path: null, time: '10:05 AM' }
      ];
      this.loading = false;
    }, 500);
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  sendMessage() {
    if ((!this.newMessageContent.trim() && !this.selectedFile) || !this.selectedDiscussion) return;
    
    this.sendingMessage = true;
    const msg = {
      content: this.newMessageContent.trim() || 'Attached a file',
      discussion_id: this.selectedDiscussion.discussion_id
    };
    
    this.apiService.post(`/discussions/${msg.discussion_id}/messages`, msg).subscribe({
      next: (res: any) => {
        const newMsg = {
          message_id: res.message_id,
          sender_id: res.sender_id,
          content: res.content,
          sent_at: new Date(),
          isOwn: true,
          senderName: 'Me',
          attachment_path: null,
          time: 'Just now'
        };

        if (this.selectedFile) {
          const formData = new FormData();
          formData.append('file', this.selectedFile);
          this.apiService.post(`/discussions/${res.message_id}/upload`, formData).subscribe({
            next: (uploadRes: any) => {
              newMsg.attachment_path = uploadRes.attachment_path;
              this.messages.push(newMsg);
              this.selectedFile = null;
              this.newMessageContent = '';
              this.sendingMessage = false;
            },
            error: (err: any) => {
              console.error('File upload failed', err);
              this.messages.push(newMsg);
              this.selectedFile = null;
              this.newMessageContent = '';
              this.sendingMessage = false;
            }
          });
        } else {
          this.messages.push(newMsg);
          this.newMessageContent = '';
          this.sendingMessage = false;
        }
      },
      error: (err: any) => {
        console.error(err);
        this.sendingMessage = false;
      }
    });
  }

  downloadAttachment(messageId: number) {
    if (!messageId) return;
    this.apiService.getBlob(`/discussions/${messageId}/download`).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attachment_${messageId}`; // basic fallback naming
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => console.error('Download failed', err)
    });
  }

  createNewDiscussion() {
    if(!this.newDiscussionTitle.trim() || !this.newDiscussionEntityId) return;
    const disc = {
      title: this.newDiscussionTitle,
      entity_type: this.newDiscussionEntityType,
      entity_id: this.newDiscussionEntityId
    };
    this.apiService.post('/discussions/', disc).subscribe({
      next: (res: any) => {
        this.discussions.unshift(res);
        this.newDiscussionTitle = '';
      },
      error: (err: any) => console.error(err)
    });
  }
}
