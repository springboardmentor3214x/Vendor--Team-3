import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../../management/performance.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, FormsModule, BaseChartDirective],
  templateUrl: './vendor-dashboard.component.html',
  styleUrl: './vendor-dashboard.component.scss'
})
export class VendorDashboardComponent implements OnInit {
  vendorScore = 0;
  vendorCategory = '';
  activeOrdersCount = 0;
  contractsStatus = '';
  unreadMessagesCount = 0;
  
  recentOrders: any[] = [];
  contractsList: any[] = [];
  performanceMetrics: any = {};

  totalOrders = 0;
  totalContracts = 0;

  // Chart data
  public scoreChartType: ChartType = 'doughnut';
  public scoreChartData: any = {
    labels: ['Reliability Score', 'Remaining'],
    datasets: [{ data: [0, 100], backgroundColor: ['#10b981', '#e2e8f0'] }]
  };
  public scoreChartOptions: ChartOptions = { responsive: true, maintainAspectRatio: false };

  public contractChartData: any = {
    labels: ['Active', 'Pending', 'Expired'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }]
  };
  public contractChartOptions: ChartOptions = { responsive: true, maintainAspectRatio: false };

  isChatOpen = false;
  newChatMessage = '';
  chatMessages = [
    { sender: 'Auditor', text: 'Hi, we noticed the GST Certificate registration number is blurry. Could you please double check?', time: 'Yesterday' },
    { sender: 'Vendor', text: 'Sure, I will verify the document and re-upload.', time: 'Yesterday' },
    { sender: 'Auditor', text: 'Thanks, please re-upload in the compliance section.', time: 'Today, 10:00 AM' }
  ];

  totalPaymentsStr = '₹0.00';
  ratingStars = '⭐⭐⭐⭐☆';
  ratingPercent = '—';

  pendingContracts: any[] = [];
  
  paidAmount = 0;
  pendingAmount = 0;
  rejectedAmount = 0;
  totalReceivedStr = '₹0.00';

  procurementMessages: any[] = [];
  upcomingDeliveries: any[] = [];
  notifications: any[] = [];
  searchTerm = '';

  public radarChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(99, 102, 241, 0.2)' },
        grid: { color: 'rgba(99, 102, 241, 0.2)' },
        pointLabels: { color: '#475569', font: { size: 12 } },
        ticks: { backdropColor: 'transparent', color: '#64748b' }
      }
    }
  };
  public radarChartData: any = {
    labels: ['Delivery Speed', 'Product Quality', 'Communication', 'Compliance', 'Cost Efficiency'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0],
        label: 'Your Performance',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
        fill: true,
      }
    ]
  };
  public radarChartType: ChartType = 'radar';

  constructor(
    public sidebarService: SidebarService,
    private performanceService: PerformanceService
  ) {}

  ngOnInit() {
    this.loadVendorData();
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      this.recentOrders = this.recentOrders.filter(o =>
        o.id.toLowerCase().includes(term) || o.status.toLowerCase().includes(term)
      );
    } else {
      this.loadVendorData();
    }
  }

  loadVendorData() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    // Find the vendor matching logged-in user email
    this.performanceService.getVendors().subscribe({
      next: (vendors) => {
        const currentVendor = vendors.find(v => v.email.toLowerCase() === userEmail.toLowerCase());
        if (currentVendor) {
          const vId = currentVendor.vendor_id;

          // 1. Fetch Reliability Details
          this.performanceService.getReliabilityDetails(vId).subscribe({
            next: (rel) => {
              const score = rel.reliability_score || 0;
              this.ratingPercent = `${score.toFixed(1)}/100`;
              this.ratingStars = score >= 90 ? '⭐⭐⭐⭐⭐' : (score >= 75 ? '⭐⭐⭐⭐☆' : '⭐⭐⭐☆☆');
            },
            error: (err) => console.error('Error fetching vendor reliability', err)
          });

          // 2. Fetch Purchase Orders for this Vendor
          this.performanceService.getPurchaseOrders().subscribe({
            next: (pos) => {
              const vendorPOs = pos.filter(po => po.vendor_id === vId);
              this.totalOrders = vendorPOs.length;

              this.paidAmount = 0;
              this.pendingAmount = 0;
              this.rejectedAmount = 0;

              vendorPOs.forEach(po => {
                if (po.status === 'Completed') {
                  this.paidAmount += po.total_amount;
                } else if (po.status === 'Cancelled' || po.status === 'Rejected') {
                  this.rejectedAmount += po.total_amount;
                } else {
                  this.pendingAmount += po.total_amount;
                }
              });

              this.totalPaymentsStr = `₹${(this.paidAmount).toLocaleString()}`;
              this.totalReceivedStr = `₹${(this.paidAmount / 100000).toFixed(1)}L Received`;

              // Recent orders list
              this.recentOrders = vendorPOs.slice().sort((a, b) => b.order_id - a.order_id).slice(0, 3).map(po => ({
                id: 'PO' + po.order_id,
                status: po.status
              }));

              // Upcoming Deliveries
              this.upcomingDeliveries = vendorPOs.filter(po => po.status !== 'Completed' && po.status !== 'Cancelled').slice(0, 3).map(po => {
                const dateVal = po.delivery_date ? new Date(po.delivery_date).toLocaleDateString() : 'Scheduled';
                return {
                  title: `PO${po.order_id}`,
                  date: dateVal
                };
              });

              // Messages list
              this.procurementMessages = vendorPOs.slice(0, 3).map((po, index) => {
                const subjects = ['Submit Invoice Details', 'Shipment Status Update', 'Delivery Instructions'];
                const priorities = ['High', 'Medium', 'Low'];
                return {
                  from: 'Procurement',
                  subject: subjects[index % subjects.length],
                  orderId: `PO${po.order_id}`,
                  priority: priorities[index % priorities.length],
                  date: po.order_date,
                  status: po.status === 'Completed' ? 'Read' : 'Unread'
                };
              });

              // Dynamic Notifications
              this.notifications = [];
              if (vendorPOs.length > 0) {
                this.notifications.push(`• New Order PO${vendorPOs[0].order_id} assigned`);
              }
              const completedPO = vendorPOs.find(po => po.status === 'Completed');
              if (completedPO) {
                this.notifications.push(`• Payment Released for PO${completedPO.order_id}`);
              }
            },
            error: (err) => console.error('Error fetching vendor purchase orders', err)
          });

          // 3. Fetch Contracts for this Vendor
          this.performanceService.getContracts().subscribe({
            next: (contracts) => {
              const vendorContracts = contracts.filter(c => c.vendor_id === vId);
              this.totalContracts = vendorContracts.length;

              const active = vendorContracts.filter(c => c.status === 'Active').length;
              const pending = vendorContracts.filter(c => c.status === 'Pending').length;
              const expired = vendorContracts.filter(c => c.status === 'Expired' || c.status === 'Terminated').length;

              this.contractChartData = {
                labels: ['Active', 'Pending', 'Expired/Terminated'],
                datasets: [{ data: [active, pending, expired], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }]
              };

              this.pendingContracts = vendorContracts.filter(c => c.status === 'Pending').map((c, index) => ({
                name: c.contract_name || `Contract Agreement ${index + 1}`
              }));

              if (vendorContracts.length > 0) {
                this.notifications.push(`• Contract ${vendorContracts[0].contract_id} status: ${vendorContracts[0].status}`);
              }
            },
            error: (err) => console.error('Error fetching vendor contracts', err)
          });
          
          this.performanceService.getVendorPerformanceView().subscribe({
            next: (perf) => {
              if(perf.overall_score !== undefined) {
                const score = perf.overall_score || 0;
                this.ratingPercent = `${score.toFixed(1)}/100`;
                this.ratingStars = score >= 90 ? '⭐⭐⭐⭐⭐' : (score >= 75 ? '⭐⭐⭐⭐☆' : '⭐⭐⭐☆☆');
                this.scoreChartData = {
                  labels: ['Reliability Score', 'Remaining'],
                  datasets: [{ data: [score, 100 - score], backgroundColor: ['#10b981', '#e2e8f0'] }]
                };
                
                // Populate radar chart
                const delivery = perf.delivery_score || score;
                const quality = perf.quality_score || score;
                const communication = score - Math.random() * 5;
                const compliance = score + Math.random() * 5;
                const cost = score;
                
                this.radarChartData.datasets[0].data = [
                  Math.min(100, Math.max(0, delivery)),
                  Math.min(100, Math.max(0, quality)),
                  Math.min(100, Math.max(0, communication)),
                  Math.min(100, Math.max(0, compliance)),
                  Math.min(100, Math.max(0, cost))
                ];
                // Force update
                this.radarChartData = {...this.radarChartData};
              }
            }
          });

          this.performanceService.getVendorCommunicationSummary().subscribe({
            next: (summary) => {
              this.unreadMessagesCount = summary.unread_messages || 0;
              if (this.unreadMessagesCount > 0) {
                 this.notifications.push(`• You have ${this.unreadMessagesCount} unread messages.`);
              }
            }
          });

          this.performanceService.getVendorPendingDeliveries().subscribe({
            next: (deliveries) => {
              this.upcomingDeliveries = deliveries.map((d: any) => ({
                 title: d.order_number,
                 date: d.expected_delivery_date ? new Date(d.expected_delivery_date).toLocaleDateString() : 'Scheduled'
              }));
            }
          });

        }
      },
      error: (err) => console.error('Error identifying logged-in vendor', err)
    });
  }

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
