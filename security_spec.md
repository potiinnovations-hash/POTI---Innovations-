# Security Specification - Sustainable Development Catalog

## Data Invariants
1. A **Catalog Item** must have Georgian and English titles and an image URL.
2. **Global Settings** can only be modified by admins.
3. **Notifications** must have a message and an active status.
4. **Users** can only create their own profiles with 'user' role by default. Admins can promote/demote.
5. All string fields must have a maximum size to prevent resource exhaustion.
6. Timestamp `createdAt` for notifications must be the server time.

## The "Dirty Dozen" Payloads

1. **Identity Spoofing (Catalog):** Create catalog item with `ownerId` as another user (if it had one).
2. **Resource Poisoning (Catalog):** Inject a 1MB string into `titleKa`.
3. **State Shortcutting (Notification):** Create notification with `active: true` when not an admin.
4. **Privilege Escalation (User):** Create own user profile with `role: 'admin'`.
5. **Unauthorized Modification (Settings):** Update global settings as a non-admin.
6. **Ghost Field Injection:** Update catalog item adding a field `isVerified: true` not in schema.
7. **Orphaned Record (General):** Create a sub-resource with an ID of a non-existent parent (if applicable).
8. **PII Leak:** Fetch another user's email via direct 'get' request (should be restricted).
9. **Bulk Scraping:** List all users without any query filters (if restricted).
10. **Terminal State Lock Bypass:** Modify an immutable field `createdAt`.
11. **ID Poisoning:** Use a 2KB string as a document ID.
12. **Timestamp Fraud:** Provide a client-side `createdAt` timestamp instead of server time.

## Verification
All these payloads must return `PERMISSION_DENIED`.
