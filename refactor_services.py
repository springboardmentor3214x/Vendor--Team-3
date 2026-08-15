import os
import re

services_dir = 'frontend/src/app/services'
management_dir = 'frontend/src/app/management'

with open(os.path.join(services_dir, 'api.service.ts'), 'r', encoding='utf-8') as f:
    api_content = f.read()

# Extract the generic methods
generic_methods = re.search(r'(// ─── Generic Methods ───.*?)(?=(// ───|$))', api_content, flags=re.DOTALL | re.IGNORECASE)
generic_str = generic_methods.group(1) if generic_methods else ''

service_template = '''import {{ Injectable }} from '@angular/core';
import {{ HttpClient, HttpHeaders }} from '@angular/common/http';
import {{ Observable }} from 'rxjs';

@Injectable({{
  providedIn: 'root'
}})
export class {ClassName} {{
  readonly baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {{}}

  private getAuthHeaders(): HttpHeaders {{
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({{ Authorization: `Bearer ${{token}}` }});
  }}

  // ─── Generic Methods ─────────────────────────────────────────────────────────
  get(url: string): Observable<any> {{ return this.http.get<any>(`${{this.baseUrl}}${{url}}`, {{ headers: this.getAuthHeaders() }}); }}
  post(url: string, data: any): Observable<any> {{ return this.http.post<any>(`${{this.baseUrl}}${{url}}`, data, {{ headers: this.getAuthHeaders() }}); }}
  put(url: string, data: any): Observable<any> {{ return this.http.put<any>(`${{this.baseUrl}}${{url}}`, data, {{ headers: this.getAuthHeaders() }}); }}
  delete(url: string): Observable<any> {{ return this.http.delete<any>(`${{this.baseUrl}}${{url}}`, {{ headers: this.getAuthHeaders() }}); }}
  getBlob(url: string): Observable<Blob> {{ return this.http.get(`${{this.baseUrl}}${{url}}`, {{ headers: this.getAuthHeaders(), responseType: 'blob' }}); }}

{methods}
}}
'''

sections = re.split(r'// ─── ([A-Za-z &]+) ───+', api_content)

section_map = {}
for i in range(1, len(sections), 2):
    section_name = sections[i].strip()
    section_code = sections[i+1]
    section_map[section_name] = section_code

mapping = {
    'Users': ('UserService', 'user.service.ts'),
    'Vendors': ('VendorService', 'vendor.service.ts'),
    'Procurements': ('ProcurementService', 'procurement.service.ts'),
    'Purchase Orders': ('PurchaseOrderService', 'purchase-order.service.ts'),
    'Messages': ('MessageService', 'message.service.ts'),
    'Contracts': ('ContractService', 'contract.service.ts'),
    'Vendor Documents & Compliance': ('VendorDocumentService', 'vendor-document.service.ts'),
    'RFQs': ('RfqService', 'rfq.service.ts'),
    'File Uploads & Downloads': ('FileService', 'file.service.ts'),
    'Renewals': ('RenewalService', 'renewal.service.ts'),
    'Certifications': ('CertificationService', 'certification.service.ts'),
    'Compliance': ('ComplianceService', 'compliance.service.ts')
}

for name, (cls_name, file_name) in mapping.items():
    if name in section_map:
        code = section_map[name]
        # Remove the closing bracket of the original class if it's the last section
        code = code.rsplit('}', 1)[0]
        final_code = service_template.format(ClassName=cls_name, methods=code.strip())
        with open(os.path.join(services_dir, file_name), 'w', encoding='utf-8') as f:
            f.write(final_code)

print("Generated new services!")
