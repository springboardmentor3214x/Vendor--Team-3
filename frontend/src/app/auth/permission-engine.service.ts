import { Injectable } from '@angular/core';
import { SidebarService } from '../layout/sidebar.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionEngineService {
  
  // Matrix defining what each role can do
  private rolePermissions: { [role: string]: string[] } = {
    'admin': [
      'user.view', 'user.create', 'user.edit', 'user.delete',
      'role.view', 'role.manage',
      'vendor.view', 'vendor.create', 'vendor.edit', 'vendor.approve', 'vendor.delete', 'vendor.evaluate', 'vendor.compare',
      'rfq.view', 'rfq.manage',
      'purchase_order.view', 'purchase_order.create', 'purchase_order.approve',
      'delivery.view', 'delivery.track', 'delivery.receipt',
      'performance.view', 'performance.configure',
      'reliability.view', 'reliability.configure',
      'risk.view', 'risk.configure',
      'invoice.view', 'payment.view',
      'contract.view', 'contract.manage', 'compliance.configure',
      'audit.view'
    ],
    'procurement': [
      'vendor.view', 'vendor.create', 'vendor.edit', 'vendor.approve', 'vendor.evaluate', 'vendor.compare', 'vendor.archive',
      'rfq.view', 'rfq.create', 'rfq.edit', 'rfq.send', 'rfq.cancel',
      'quotation.view', 'quotation.approve', 'quotation.reject',
      'purchase_order.view', 'purchase_order.create', 'purchase_order.edit', 'purchase_order.submit', 'purchase_order.approve',
      'delivery.view',
      'performance.evaluate',
      'reliability.view', 'risk.manage',
      'contract.manage', 'compliance.review',
      'invoice.view', 'payment.view'
    ],
    'supply': [
      'vendor.view', 'vendor.compare',
      'purchase_order.view',
      'rfq.view',
      'delivery.view', 'delivery.track', 'delivery.update', 'delivery.receipt', 'delivery.reject',
      'performance.record',
      'reliability.input', 'risk.input',
      'contract.view',
      'invoice.view'
    ],
    'finance': [
      'vendor.view', 'vendor.edit_financial',
      'purchase_order.view', 'purchase_order.approve_financial',
      'delivery.view', 'delivery.receipt_view',
      'performance.financial',
      'reliability.view', 'risk.financial',
      'contract.view', 'compliance.financial',
      'invoice.view', 'invoice.approve', 'invoice.reject',
      'payment.view', 'payment.process', 'payment.hold', 'payment.release',
      'audit.financial'
    ],
    'vendor': [
      'vendor.view_own', 'vendor.edit_own',
      'rfq.view', 'quotation.create', 'quotation.submit',
      'purchase_order.view_own', 'purchase_order.accept', 'purchase_order.reject',
      'delivery.update_own',
      'performance.view_own', 'reliability.view_own', 'risk.view_own',
      'contract.view_own', 'compliance.submit',
      'invoice.create', 'invoice.submit', 'payment.view_own'
    ],
    'auditor': [
      'user.view', 'role.view',
      'vendor.view', 'vendor.evaluate_view', 'vendor.compare_view',
      'rfq.view', 'quotation.view',
      'purchase_order.view',
      'delivery.view', 'delivery.receipt_view',
      'performance.view', 'reliability.view', 'risk.view',
      'contract.view', 'compliance.view',
      'invoice.view', 'payment.view',
      'audit.view', 'audit.note', 'audit.flag', 'audit.export'
    ]
  };

  // Data scope tracking
  private roleDataScopes: { [role: string]: string } = {
    'admin': 'GLOBAL',
    'procurement': 'DEPARTMENT',
    'supply': 'REGION',
    'finance': 'ORGANIZATION',
    'vendor': 'SELF',
    'auditor': 'GLOBAL'
  };

  constructor(private sidebarService: SidebarService) {}

  /**
   * Check if the current user has a specific granular permission
   */
  hasPermission(permission: string): boolean {
    const role = this.sidebarService.getCurrentRole();
    const permissions = this.rolePermissions[role] || [];
    return permissions.includes(permission);
  }

  /**
   * Check if the current user has access to a specific data scope
   */
  hasDataScope(requiredScope: string): boolean {
    const role = this.sidebarService.getCurrentRole();
    const userScope = this.roleDataScopes[role] || 'SELF';
    
    // Simple hierarchy: GLOBAL > ORGANIZATION > REGION > DEPARTMENT > ASSIGNED > SELF
    const scopeHierarchy = ['GLOBAL', 'ORGANIZATION', 'REGION', 'DEPARTMENT', 'ASSIGNED', 'SELF'];
    const userScopeLevel = scopeHierarchy.indexOf(userScope.toUpperCase());
    const requiredScopeLevel = scopeHierarchy.indexOf(requiredScope.toUpperCase());
    
    // If user's scope is higher or equal to the required scope (lower index = higher privilege)
    if (userScopeLevel !== -1 && requiredScopeLevel !== -1 && userScopeLevel <= requiredScopeLevel) {
      return true;
    }
    
    return false;
  }
}
