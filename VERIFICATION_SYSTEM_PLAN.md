# Verification System Plan

## Overview

Admin-driven KYC verification flow: users submit documents → admin reviews → status becomes verified.

---

## Verification Steps (User Journey)

| Step | Name | Description | Status Trigger |
|------|------|-------------|----------------|
| 1 | Account Created | User signs up | Automatic |
| 2 | KYC Documents Submitted | User fills form + uploads ID, selfie | `status: 'pending'` |
| 3 | Admin Review | Admin reviews in dashboard | `status: 'pending'` |
| 4 | Verified | Admin approves | `status: 'approved'` |

---

## Database Schema (Firebase Realtime DB)

```
users/{userId}/
  createdAt: "2024-01-15T10:30:00.000Z"
  kyc/
    status: "not_started" | "pending" | "approved" | "rejected"
    submittedAt: "2024-01-20T14:00:00.000Z"
    approvedAt: "2024-01-21T09:00:00.000Z"  // when admin approves
    approvedBy: "admin_uid"                   // optional
    rejectionReason: "..."                    // if rejected
    documents/
      frontId: "cloudinary_url"
      backId: "cloudinary_url"
      selfie: "cloudinary_url"
    fullName: "..."
    idNumber: "..."
    address: "..."
```

---

## Admin Dashboard Requirements

### 1. Admin Authentication
- Admin role stored in `users/{adminId}/role: "admin"` or separate `admins` collection
- Or use Firebase Custom Claims: `admin: true`
- Protect admin routes with role check

### 2. Pending Users List
- Query: `users` where `kyc.status === 'pending'`
- Display: name, email, submittedAt, document thumbnails/links

### 3. Admin Actions
- **Approve**: Set `kyc.status = 'approved'`, `kyc.approvedAt = now`, `kyc.approvedBy = adminId`
- **Reject**: Set `kyc.status = 'rejected'`, `kyc.rejectionReason = "..."`

### 4. Firebase Security Rules

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && (auth.uid == $uid || root.child('users').child(auth.uid).child('role').val() == 'admin')",
        ".write": "auth != null && auth.uid == $uid",
        "kyc": {
          ".write": "auth != null && (auth.uid == $uid || root.child('users').child(auth.uid).child('role').val() == 'admin')"
        }
      }
    }
  }
}
```

---

## Implementation Checklist

### Phase 1: Backend / Firebase
- [ ] Add `approvedAt`, `approvedBy`, `rejectionReason` to KYC schema
- [ ] Create admin role/claims system
- [ ] Update Firebase rules for admin kyc write access

### Phase 2: Admin Dashboard (Web)
- [ ] Create admin login (or use Firebase Auth)
- [ ] Build pending KYC list page
- [ ] Build KYC detail view (documents, user info)
- [ ] Add Approve / Reject buttons with API or direct Firebase write

### Phase 3: Mobile App
- [x] Verification steps UI in AccountDetailsScreen
- [x] Progress bar (25% → 75% → 100%)
- [ ] Handle "rejected" status: show reason, allow resubmit
- [ ] Optional: Push notification when verified

### Phase 4: Document Storage
- [ ] Upload KYC images to Cloudinary (like avatar)
- [ ] Store URLs in `kyc.documents` instead of base64/local URIs

---

## Progress Bar Logic (Current)

| KYC Status | Step | Progress |
|------------|------|----------|
| not_started | 1 | 25% |
| rejected | 2 | 50% |
| pending | 3 | 75% |
| approved | 4 | 100% |

---

## Next Steps

1. Set up admin user(s) in Firebase
2. Build simple admin web app or use Firebase Console initially
3. Update KYCScreen to upload documents to Cloudinary
4. Add reject flow with reason + resubmit option
