# Payment System Deployment Guide

**Quick deployment guide for the manual payment verification system**

---

## 🚀 Production Deployment Steps

### Step 1: Apply Database Migration

```bash
# Apply payment system migration to production database
npx wrangler d1 execute lunaxcode-prod --remote --file=./migrations/0005_manual_payment_system.sql
```

**Expected Output**: 9 commands executed successfully

---

### Step 2: Update Payment Account Details

1. **Login to Admin Dashboard**
   - URL: `https://lunaxcode-saas.pages.dev/admin`
   - Login with your admin account

2. **Navigate to Payment Accounts**
   - Go to: `/admin/settings/payment-accounts`
   - Or click: Settings → Payment Accounts

3. **Update Each Account with Real Details**

   **GCash:**
   - Account Name: Your GCash registered name
   - Mobile Number: Your actual GCash number (e.g., 09XX XXX XXXX)
   - Instructions: "Send payment to this GCash number. Take a screenshot of the transaction and upload as proof."
   - Optional: Upload QR code image URL

   **SeaBank:**
   - Account Name: Your SeaBank account holder name
   - Account Number: Your SeaBank account number
   - Bank Name: "SeaBank Philippines"
   - Instructions: "Transfer to this SeaBank account via online banking or mobile app. Upload the transaction receipt."

   **PayMaya:**
   - Account Name: Your PayMaya registered name
   - Mobile Number: Your PayMaya number
   - Instructions: "Send payment via PayMaya app. Take a screenshot and upload as proof."
   - Optional: Upload QR code image URL

   **Bank Transfer:**
   - Account Name: Your company/business name
   - Account Number: Your primary bank account
   - Bank Name: "BDO / BPI / Metrobank" (list all banks you accept)
   - Instructions: "Bank transfer or deposit to any of our accounts. Upload the deposit slip or online banking receipt."

4. **Disable Methods You Don't Use**
   - Toggle off payment methods you don't want to accept
   - Keep at least 2-3 methods active for client convenience

---

### Step 3: Test the Payment Flow

#### As a Client:

1. **Create a Test Project**
   - Login as a test client
   - Go through onboarding
   - Create a new project

2. **Navigate to Payment Page**
   - Click on your project
   - Click "Make Payment" or go to `/projects/[id]/payment`

3. **Verify Payment Methods Display**
   - Check all active payment methods show up
   - Verify account details are correct
   - Confirm instructions are clear

4. **Submit Test Payment Proof**
   - Select a payment method
   - Upload a test image (can be any image for testing)
   - Fill in reference number: "TEST12345"
   - Fill in your name
   - Submit

5. **Verify Submission**
   - Check payment appears in payment history
   - Status should be "Pending"

#### As an Admin:

1. **Check Payment Dashboard**
   - Go to `/admin/payments`
   - Verify test payment appears
   - Check statistics update

2. **Review Payment**
   - Click "Review Payment"
   - Verify all details display correctly
   - Image should be viewable

3. **Approve Payment**
   - Add admin notes: "Test payment approved"
   - Click "Approve Payment"
   - Verify success message

4. **Check Project Status**
   - Navigate to the test project
   - Verify project status changed to "In Progress" (for deposit)
   - Verify payment status changed to "Partially Paid"

---

### Step 4: Client Communication

**Inform Your Clients:**

1. **Email Template:**

```
Subject: New Payment Process for Your Project

Dear [Client Name],

We've updated our payment process to make it easier and more convenient for you!

Payment Structure:
• 50% Deposit - Required before project work begins
• 50% Completion - Required upon project completion and approval

How to Pay:
1. Log into your project dashboard
2. Click "Make Payment" on your project
3. Choose your preferred payment method:
   - GCash
   - SeaBank
   - PayMaya
   - Bank Transfer (BDO/BPI/Metrobank)
4. Transfer the amount to our account
5. Upload a screenshot/photo of your receipt
6. We'll verify within 24 hours!

Once verified, we'll start working on your project immediately.

Questions? Reply to this email or contact us.

Best regards,
Lunaxcode Team
```

2. **Update Website/Landing Page**
   - Add payment process information
   - Link to FAQs about payments

---

### Step 5: Admin Training

**Train your team on:**

1. **Daily Payment Check Routine**
   - Check `/admin/payments` at least twice daily
   - Morning (9 AM) and afternoon (3 PM)
   - Respond to all pending payments within 24 hours

2. **Verification Checklist**
   - ✅ Reference number matches screenshot
   - ✅ Amount is correct (50% or balance)
   - ✅ Sender name matches client name
   - ✅ Screenshot shows successful transaction
   - ✅ Date/time is reasonable (not too old)

3. **When to Approve**
   - Payment proof is clear and legible
   - All details match
   - Amount is correct
   - Transaction is recent (within 7 days)

4. **When to Reject**
   - Blurry or unreadable proof
   - Wrong amount
   - Suspicious or edited screenshot
   - Missing reference number
   - Payment to wrong account
   
   **Always provide clear rejection reason so client can fix and resubmit!**

5. **Communication Standards**
   - Always be polite and professional
   - Provide specific reasons for rejection
   - Offer help if client is confused
   - Respond within 24 hours maximum

---

### Step 6: Monitoring & Maintenance

**Weekly Tasks:**

1. **Review Payment Statistics**
   - Check total verified amount
   - Monitor pending count (should be low)
   - Track rejected count (should be minimal)

2. **Verify Bank/E-wallet Accounts**
   - Confirm you actually received the money
   - Match client submissions with bank records
   - Report any discrepancies

3. **Update Account Details if Needed**
   - If you change bank accounts, update immediately
   - Test after any changes

**Monthly Tasks:**

1. **Export Payment Records**
   - For accounting/tax purposes
   - Keep backup of payment proofs

2. **Analyze Payment Trends**
   - Which payment methods are most used?
   - Average verification time
   - Rejection rate and reasons

---

## 📋 Post-Deployment Checklist

- [ ] Migration applied to production database ✓
- [ ] Payment account details updated with real information ✓
- [ ] Test project created and payment submitted ✓
- [ ] Test payment approved and project status updated ✓
- [ ] All payment methods tested ✓
- [ ] Clients informed about new payment process ✓
- [ ] Admin team trained on verification process ✓
- [ ] Payment dashboard bookmarked for daily checks ✓
- [ ] Bank/E-wallet apps set up for verification ✓
- [ ] First real payment successfully processed ✓

---

## 🆘 Troubleshooting

### Problem: Payment stuck in "Pending"

**Solution:**
- Admin needs to login and verify
- Go to `/admin/payments`
- Review and approve/reject

### Problem: Project doesn't start after deposit approval

**Solution:**
- Check if payment type is "deposit"
- Verify payment status changed to "verified"
- Manually update project status if needed

### Problem: Client can't upload image

**Solution:**
- Check image file size (<5MB)
- Ensure image format (JPG/PNG)
- Try different browser
- Refresh page and try again

### Problem: Wrong payment amount

**Solution:**
- Reject payment with reason: "Incorrect amount. Please pay ₱X for [deposit/completion]"
- Client can resubmit with correct amount

---

## 💡 Pro Tips

1. **Enable Bank Notifications**
   - Turn on SMS/email alerts for your bank accounts
   - Makes verification faster

2. **Create Verification Template**
   - Save common rejection reasons
   - Copy-paste for consistency

3. **Set Verification Hours**
   - Example: "Payments verified Monday-Friday, 9 AM - 5 PM"
   - Set client expectations

4. **Use QR Codes**
   - Generate GCash/PayMaya QR codes
   - Upload to payment accounts
   - Makes client payments easier

5. **Track Verification Time**
   - Aim for <24 hour turnaround
   - Faster verification = happier clients

---

## 📞 Support

**Questions?**
- Check `docs/MANUAL_PAYMENT_SYSTEM.md` for detailed documentation
- Review code comments in payment pages
- Contact the development team

---

**Your manual payment verification system is ready to go! 🎉**

