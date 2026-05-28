# Security Specification

## Data Invariants
1. Catalog items must have valid titles and a reasonable `order` value.
2. Notifications must have messages and a valid `active` status.
3. Global settings should contain styling and branding information.
4. Admins can manage all collections.
5. Public users can only read `catalog`, `settings`, and `notifications`.

## Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing**: Attempt to create a catalog item as an unauthenticated user.
2. **Identity Spoofing**: Attempt to create an admin record for a self-controlled UID.
3. **Resource Poisoning**: Injection of a very large string (1MB+) into `titleKa`.
4. **State Shortcutting**: Attempt to update `createdAt` on a notification.
5. **Unauthorized Write**: Unauthenticated user trying to delete a catalog item.
6. **Path Poisoning**: Using a 2KB string as a catalog item ID.
7. **PII Leak**: (Not applicable here as no PII is stored yet, but if users were present, we'd block non-owner reads).
8. **Malicious Update**: Authenticated non-admin trying to update `settings/global`.
9. **Malicious Update**: Admin trying to remove the `titleKa` field (which should be required).
10. **Resource Exhaustion**: Creating 10,000 notifications in a batch (rate limiting is hard in rules but we can restrict size).
11. **Type Mismatch**: Sending a boolean for `titleKa`.
12. **Relationship Orphan**: Creating a sub-resource if parent doesn't exist (not applicable here).

## Test Cases
- Public: GET/LIST `catalog` -> ALLOW
- Public: WRITE `catalog` -> DENY
- Admin (potiinnovations@gmail.com): WRITE `catalog` -> ALLOW
- Authenticated non-admin: WRITE `catalog` -> DENY
