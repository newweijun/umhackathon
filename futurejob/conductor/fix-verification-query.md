# Fix Company Verification Query

## Objective
The Admin Moderation page currently shows "No companies waiting for verification" even when there are unverified companies on the platform. This is because the Firestore query explicitly searches for documents where `isVerified == false`. In many cases, newly created company profiles might not have the `isVerified` field at all, meaning they are excluded from the query results.

## Proposed Change
Update the data fetching logic in `lib/admin/dashboard.ts` (`getAdminModerationPageData`) to:
1. Fetch all company documents (remove the `where("isVerified", "==", false)` filter).
2. Filter the companies in memory to include any document where `isVerified !== true`. This safely captures companies where the field is explicitly `false` AND companies where the field is entirely missing (`undefined`).

## Files to Update
- `lib/admin/dashboard.ts`: Update the `companiesSnapshot` query and the `pendingApplications` mapping logic.