import os

html_path = 'c:/Users/namke/OneDrive/Desktop/vendor_reliability/frontend/src/app/management/contracts/contracts.component.html'

content = """<div class="dash-wrapper" [class.sidebar-hidden]="!sidebarService.isSidebarVisible">
  <app-sidebar></app-sidebar>
  <div class="dash-main contracts-container">
    <!-- Top Navbar -->
    <div class="dash-topbar" style="margin-bottom: 2rem;">
      <div style="display:flex;align-items:center;gap:1rem;">
        <button class="hamburger-btn" (click)="sidebarService.toggleSidebar()">☰</button>
        <button (click)="goBack()" style="background:#e2e8f0;border:none;padding:0.5rem 1rem;border-radius:8px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:0.5rem;font-size:0.85rem;color:#475569;transition:all 0.2s;" onmouseover="this.style.background='#cbd5e1'" onmouseout="this.style.background='#e2e8f0'">
          ← Go Back
        </button>
        <span class="dash-topbar-title">Contract & Compliance Repository</span>
      </div>
      <div class="dash-topbar-right">
        <span>🔔 Notifications</span>
        <span class="dash-topbar-user">👤 {{ sidebarService.getCurrentRoleLabel() }}</span>
      </div>
    </div>

    <!-- Create Contract -->
    <div *ngIf="sidebarService.getCurrentRole() !== 'vendor' && sidebarService.getCurrentRole() !== 'auditor' && sidebarService.getCurrentRole() !== 'finance'" class="draft-card">
      <h3 class="section-title">📝 Draft New Contract</h3>
      
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Contract Partner</label>
          <select [(ngModel)]="selectedVendorId" class="form-select">
            <option [value]="null">Choose Vendor...</option>
            <option *ngFor="let v of vendors" [value]="v.vendor_id">{{v.company_name}}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Procurement Request</label>
          <select [(ngModel)]="selectedProcurementId" class="form-select">
            <option [value]="null">Choose Procurement...</option>
            <option *ngFor="let p of procurements" [value]="p.procurement_id">{{p.title}}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Contract Title</label>
          <input type="text" [(ngModel)]="contractTitle" placeholder="e.g. Annual Maintenance" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">Contract Number</label>
          <input type="text" [(ngModel)]="contractNumber" placeholder="CON-2026-XX" class="form-input">
        </div>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Start Date</label>
          <input type="date" [(ngModel)]="startDate" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">End Date</label>
          <input type="date" [(ngModel)]="endDate" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">Contract Value ($)</label>
          <input type="number" [(ngModel)]="contractValue" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select [(ngModel)]="status" class="form-select">
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
          </select>
        </div>
      </div>

      <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
        <div class="form-group">
          <label class="form-label">Scope of Work</label>
          <textarea [(ngModel)]="scopeOfWork" rows="3" class="form-textarea" placeholder="Describe the services..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Payment Terms</label>
          <textarea [(ngModel)]="paymentTerms" rows="3" class="form-textarea" placeholder="e.g. Net 30..."></textarea>
        </div>
      </div>

      <div style="text-align: right; margin-top: 1.5rem;">
        <button class="btn-primary" (click)="createContract()">
          Draft & Generate Contract
        </button>
      </div>
    </div>

    <!-- Contracts Cards -->
    <h3 class="section-title">Established Vendor Contracts</h3>
    <div class="contracts-grid">
      <div *ngFor="let c of contracts" class="contract-card">
        <div class="card-header">
          <div class="contract-number">{{c.contract_number}}</div>
          <span class="status-badge"
                [ngClass]="{
                  'status-active': c.status === 'Active',
                  'status-expiring': c.status === 'Expiring Soon',
                  'status-terminated': c.status === 'Terminated',
                  'status-default': c.status === 'Draft' || c.status === 'Completed'
                }">
            {{c.status}}
          </span>
        </div>
        
        <div class="contract-title">{{c.contract_title}}</div>
        
        <div class="contract-details">
          <div class="detail-item">
            <span class="detail-label">Vendor ID</span>
            <span class="detail-value">{{c.vendor_id}}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Value</span>
            <span class="detail-value">${{c.contract_value}}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Start Date</span>
            <span class="detail-value">{{c.start_date}}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Expiry Date</span>
            <span class="detail-value">{{c.end_date}}</span>
          </div>
        </div>
        
        <div class="card-footer">
          <button class="btn-view" (click)="viewDocument(c)">
            👁️ View Details
          </button>
        </div>
      </div>
    </div>

    <!-- Viewer Modal -->
    <div *ngIf="viewingContract" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15, 23, 42, 0.75);backdrop-filter:blur(4px);z-index:9999;display:flex;justify-content:center;align-items:center;padding:2rem;animation:fadeIn 0.2s ease-out;">
      <div style="background:white;width:100%;max-width:850px;max-height:90vh;border-radius:20px;display:flex;flex-direction:column;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);overflow:hidden;">
        <!-- Header -->
        <div style="padding:1.5rem 2rem;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;background:#f8fafc;">
          <h2 style="margin:0;font-size:1.25rem;font-weight:800;color:#1e293b;">📄 {{viewingContract.contract_number}}</h2>
          <button (click)="closeViewer()" style="background:none;border:none;font-size:1.5rem;font-weight:700;cursor:pointer;color:#94a3b8;transition:color 0.2s;" onmouseover="this.style.color='#1e293b'" onmouseout="this.style.color='#94a3b8'">&times;</button>
        </div>
        
        <!-- Body -->
        <div style="padding:2rem;overflow-y:auto;flex:1;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem;">
            <div class="detail-item"><span class="detail-label">Title</span><span class="detail-value" style="font-size:1.1rem;">{{viewingContract.contract_title}}</span></div>
            <div class="detail-item"><span class="detail-label">Status</span><span class="detail-value" style="font-size:1.1rem;">{{viewingContract.status}}</span></div>
            <div class="detail-item"><span class="detail-label">Value</span><span class="detail-value" style="font-size:1.1rem;">${{viewingContract.contract_value}}</span></div>
            <div class="detail-item"><span class="detail-label">Term</span><span class="detail-value" style="font-size:1.1rem;">{{viewingContract.start_date}} to {{viewingContract.end_date}}</span></div>
          </div>
          
          <div *ngIf="viewingContract.scope_of_work" style="margin-bottom:2rem;">
            <span class="detail-label" style="display:block;margin-bottom:0.75rem;">Scope of Work</span>
            <div style="background:#f1f5f9;padding:1.25rem;border-radius:12px;font-size:0.95rem;color:#334155;line-height:1.6;white-space:pre-wrap;">{{viewingContract.scope_of_work}}</div>
          </div>
          
          <div *ngIf="sidebarService.getCurrentRole() !== 'vendor' && sidebarService.getCurrentRole() !== 'auditor'" style="margin-bottom:2rem;background:#fefce8;padding:1.5rem;border-radius:16px;border:1px solid #fef08a;">
             <strong style="color:#a16207;display:block;margin-bottom:1rem;font-size:1.1rem;">🔄 Renew Contract</strong>
             <div style="display:flex;gap:1rem;align-items:flex-end;">
               <div style="flex:1;" class="form-group">
                 <label class="form-label" style="color:#a16207;">New End Date</label>
                 <input type="date" [(ngModel)]="renewalData.new_end_date" class="form-input" style="border-color:#fde047;background:white;">
               </div>
               <div style="flex:1;" class="form-group">
                 <label class="form-label" style="color:#a16207;">New Value ($)</label>
                 <input type="number" [(ngModel)]="renewalData.new_value" class="form-input" style="border-color:#fde047;background:white;">
               </div>
               <button class="btn-primary" (click)="renewContract()" style="background:#ca8a04;box-shadow:none;">Renew Now</button>
             </div>
          </div>

          <span class="detail-label" style="display:block;margin-bottom:0.75rem;">Document Viewer</span>
          <div *ngIf="isLoadingDoc" style="padding:3rem;text-align:center;color:#64748b;background:#f8fafc;border-radius:12px;border:2px dashed #cbd5e1;font-weight:600;">Loading document... ⏳</div>
          <div *ngIf="!isLoadingDoc && viewingDocUrl" style="border:1px solid #cbd5e1;border-radius:12px;overflow:hidden;height:500px;box-shadow:inset 0 2px 4px rgba(0,0,0,0.05);">
            <iframe [src]="viewingDocUrl" style="width:100%;height:100%;border:none;"></iframe>
          </div>
          <div *ngIf="!isLoadingDoc && !viewingDocUrl" style="padding:3rem;text-align:center;color:#94a3b8;background:#f8fafc;border-radius:12px;border:2px dashed #cbd5e1;font-weight:600;">
            No generated document attached to this contract.
          </div>
        </div>
        
        <!-- Footer -->
        <div style="padding:1.5rem 2rem;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;background:#f8fafc;">
          <button (click)="closeViewer()" class="btn-primary" style="background:#64748b;box-shadow:none;">Close Window</button>
        </div>
      </div>
    </div>
  </div>
</div>
"""

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Overhauled contracts HTML.")
