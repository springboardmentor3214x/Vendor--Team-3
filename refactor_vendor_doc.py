import os

router_path = 'c:/Users/namke/OneDrive/Desktop/vendor_reliability/app/routers/vendor_document.py'
with open(router_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_logic = """
# Approve Vendor Document
@router.put("/{document_id}/approve")
def approve_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = db.query(VendorDocument).filter(
        VendorDocument.document_id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    document.status = "Approved"
    db.commit()

    return {"message": "Document approved"}


# Reject Vendor Document
@router.put("/{document_id}/reject")
def reject_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = db.query(VendorDocument).filter(
        VendorDocument.document_id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    document.status = "Rejected"
    db.commit()

    return {"message": "Document rejected"}
"""

if "# Approve Vendor Document" not in content:
    content += "\n\n" + new_logic
    with open(router_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added approve/reject endpoints to vendor_document.py")
else:
    print("Already added")
