import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-goods-receipt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './goods-receipt.component.html',
  styleUrls: ['./goods-receipt.component.scss']
})
export class GoodsReceiptComponent {
  poNumber: string = '';
  receivedQuantity: number = 0;
  damagedQuantity: number = 0;
  deliveryProof: File | null = null;

  recentGrns = [
    { id: 'GRN-001', poNumber: 'PO-1029', received: 100, damaged: 2, date: '2026-07-20' },
    { id: 'GRN-002', poNumber: 'PO-1030', received: 50, damaged: 0, date: '2026-07-21' }
  ];

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.deliveryProof = event.target.files[0];
    }
  }

  submitGrn() {
    if (!this.poNumber || this.receivedQuantity <= 0) {
      alert('Please fill out all required fields.');
      return;
    }
    
    const newGrn = {
      id: 'GRN-00' + (this.recentGrns.length + 1),
      poNumber: this.poNumber,
      received: this.receivedQuantity,
      damaged: this.damagedQuantity,
      date: new Date().toISOString().split('T')[0]
    };
    
    this.recentGrns.unshift(newGrn);
    
    // Reset form
    this.poNumber = '';
    this.receivedQuantity = 0;
    this.damagedQuantity = 0;
    this.deliveryProof = null;
    
    alert('GRN submitted successfully!');
  }
}
