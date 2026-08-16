import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<any>();
  private isConnected = false;
  
  constructor() {}

  public connect(userId: number) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `${environment.apiUrl.replace('http', 'ws')}/ws/${userId}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      // console.log('WebSocket connected');
      this.isConnected = true;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messageSubject.next(data);
      } catch (e) {
        // console.error('Error parsing WebSocket message', e);
      }
    };

    this.socket.onclose = () => {
      // console.log('WebSocket disconnected');
      this.isConnected = false;
      // Optionally implement auto-reconnect here
      setTimeout(() => this.connect(userId), 5000);
    };

    this.socket.onerror = (error) => {
      // console.error('WebSocket error:', error);
    };
  }

  public get messages$(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  public sendMessage(msg: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    } else {
      // console.warn('WebSocket is not open. Cannot send message:', msg);
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
