import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionEngineService } from '../../auth/permission-engine.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionEngine: PermissionEngineService
  ) {}

  @Input() set appHasPermission(permission: string) {
    if (this.permissionEngine.hasPermission(permission) && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!this.permissionEngine.hasPermission(permission) && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
