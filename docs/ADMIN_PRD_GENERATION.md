# Admin-Controlled PRD Generation Workflow

**Last Updated:** December 2024

---

## Overview

PRD (Project Requirements Document) and task generation is now **admin-controlled** instead of automatic. This gives admins full control over when and how AI generates project documentation.

## Why This Approach?

### Benefits:
1. **Quality Control** - Admin reviews project details before generating PRD
2. **Cost Management** - AI only runs when admin triggers it (saves API calls)
3. **Better Client Experience** - Clients see "under review" status instead of AI loading states
4. **Flexibility** - Admin can regenerate PRD if needed
5. **No Failed Generations** - Clients never see technical errors

### Old Flow (Automatic):
```
Client submits → AI generates PRD immediately → Client waits 30-60s → Sees result
❌ Client sees loading spinner
❌ Client sees errors if AI fails
❌ No quality control
```

### New Flow (Admin-Controlled):
```
Client submits → "Under Review" message → Admin reviews → Admin clicks "Generate PRD" → AI generates → Client sees completed PRD
✅ Professional client experience
✅ Admin control and oversight
✅ Quality assurance
```

---

## Client Experience

### 1. After Onboarding Submission

When a client completes the onboarding form, they immediately see:

```markdown
# Project Requirements Document

## Project Overview
**Project Name**: Web Application for Client Name
**Service Type**: Web Application
**Description**: [Their description]

## Status Update
Your project has been successfully submitted! Our team is currently reviewing your requirements.

## What Happens Next?
1. **Team Review** - Our experts will analyze your project requirements (24-48 hours)
2. **PRD Creation** - We'll create a comprehensive requirements document
3. **Task Planning** - We'll break down the project into detailed tasks
4. **Your Review** - You'll review and approve the project plan
5. **Payment** - 50% deposit to begin development
6. **Project Kickoff** - Development begins once deposit is verified

## Expected Timeline
- **PRD Completion**: 24-48 hours
- **Your Review**: 2-3 business days
- **Project Start**: After 50% deposit payment is verified
```

### 2. After Admin Generates PRD

Once admin triggers PRD generation, client sees:
- ✅ **Complete PRD** (10+ sections with detailed requirements)
- ✅ **Task List** (15-25 actionable tasks)
- ✅ **Timeline estimates**
- ✅ **Dependencies mapped**
- ✅ **Progress tracking**

---

## Admin Workflow

### Step 1: View New Projects

1. **Go to Admin Dashboard**: `/admin/projects`
2. **See all projects** with status badges
3. **Identify new submissions**: Look for `pending` status

### Step 2: Review Project Details

Before generating PRD, review:
- Client name and contact info
- Service type selected
- Project description
- Budget and timeline expectations
- Onboarding question answers (if any)

### Step 3: Generate PRD

1. **Click the Sparkles icon** (✨) in the Actions column
2. **Confirm generation**: Dialog appears asking for confirmation
3. **Wait for AI**: Takes 20-40 seconds
   - Spinner shows while generating
   - Button is disabled during generation
4. **See results**: Success dialog shows:
   - PRD length (characters)
   - Number of tasks created

### Step 4: Verify Generated Content

1. **Check PRD quality**: Open project detail to review
2. **Review tasks**: Ensure tasks make sense
3. **Regenerate if needed**: Click Generate PRD again to replace

---

## Admin Dashboard Features

### Generate PRD Button

**Location**: Admin Projects Table → Actions Column

**Icon**: ✨ Sparkles (purple)

**States**:
- **Ready**: Purple sparkles icon
- **Generating**: Spinning loader
- **Disabled**: Grayed out while processing

**Confirmation Dialog**:
```
Generate PRD and tasks for this project?
This will replace any existing PRD and tasks.

[Cancel] [Confirm]
```

**Success Message**:
```
✅ PRD generated successfully!

- PRD Length: 8,234 characters
- Tasks Created: 23 tasks
```

**Error Message**:
```
❌ Failed to generate PRD:

[Error details here]
```

---

## API Endpoint

### Generate PRD

**Endpoint**: `POST /api/admin/projects/[id]/generate-prd`

**Authentication**: Admin only (checked via `checkIsAdmin()`)

**Process**:
1. Validates admin access
2. Fetches project details from database
3. Gets service type and onboarding answers
4. Calls Gemini AI to generate PRD
5. Calls Gemini AI to generate tasks
6. Deletes old tasks (if any)
7. Saves new PRD and tasks to database

**Response**:
```json
{
  "success": true,
  "message": "PRD and tasks generated successfully",
  "prdLength": 8234,
  "tasksCount": 23
}
```

**Error Response**:
```json
{
  "error": "GEMINI_API_KEY not configured",
  "details": "..."
}
```

---

## Technical Details

### Database Changes

**Projects Table**:
- `prd` field now starts with "Under Review" template
- PRD is replaced when admin triggers generation

**Tasks Table**:
- Old tasks are deleted before new ones are inserted
- Ensures no duplicate tasks from re-generation

### AI Integration

**Gemini API Usage**:
1. **PRD Generation**: 1 API call (~5-10 seconds)
2. **Task Generation**: 1 API call (~10-20 seconds)
3. **Total Time**: 20-40 seconds per project

**Cost Savings**:
- Only runs when admin triggers (not automatic)
- Admin can review before spending API credits
- No wasted calls on test/spam submissions

### Code Changes

**Modified Files**:
- `src/app/api/projects/create-from-onboarding/route.ts`
  - Removed automatic PRD generation
  - Added "Under Review" template

**New Files**:
- `src/app/api/admin/projects/[id]/generate-prd/route.ts`
  - Admin endpoint for PRD generation
  - Handles AI calls and database updates

**Updated Files**:
- `src/app/(admin)/admin/projects/page.tsx`
  - Added Generate PRD button
  - Added loading state
  - Added success/error handling

---

## Troubleshooting

### "GEMINI_API_KEY not configured"

**Problem**: API key not set in Cloudflare secrets

**Solution**:
```bash
npx wrangler secret put GEMINI_API_KEY --env production
# Paste your API key when prompted
```

### "Failed to generate PRD"

**Possible Causes**:
1. API quota exceeded (free tier: 60 requests/minute)
2. Invalid API key
3. Network timeout
4. Gemini API service down

**Solutions**:
1. Wait a minute and try again
2. Verify API key in Cloudflare dashboard
3. Check Cloudflare deployment logs
4. Check Gemini AI status page

### Button Doesn't Work

**Check**:
1. Are you logged in as admin?
2. Is the button disabled/spinning?
3. Check browser console for errors
4. Check network tab for API call

---

## Best Practices

### When to Generate PRD:

✅ **DO Generate**:
- After reviewing client requirements
- For legitimate, paid projects
- When you have time to review output
- For projects moving forward

❌ **DON'T Generate**:
- For test submissions
- For spam/fake projects
- Before client confirms interest
- Multiple times unnecessarily

### Quality Assurance:

1. **Review Project Details First** - Make sure submission is complete
2. **Check Generated PRD** - Ensure it matches client needs
3. **Verify Tasks** - Confirm tasks are logical and complete
4. **Regenerate if Needed** - Don't hesitate to generate again

### Communication with Clients:

- **Immediately after submission**: "We received your project! Under review."
- **After PRD generation**: "Your project plan is ready! Please review."
- **Before development**: "Approve PRD and make 50% deposit to begin."

---

## Future Enhancements

Potential improvements:
- [ ] Edit PRD directly in admin dashboard
- [ ] Add/remove/edit individual tasks
- [ ] Preview PRD before saving
- [ ] Bulk generate for multiple projects
- [ ] Schedule generation for specific time
- [ ] Email notification when PRD is ready
- [ ] Client approval workflow for PRD

---

## Summary

**Key Points**:
1. ✅ **Admin controls** when PRD is generated
2. ✅ **Clients see professional** "under review" message
3. ✅ **Quality control** before AI generation
4. ✅ **Cost savings** - only generate when needed
5. ✅ **Flexible** - regenerate anytime

**Admin Action Required**:
- Review new project submissions daily
- Generate PRD for approved projects
- Verify quality of generated content
- Communicate status to clients

---

**Need Help?** Check deployment logs or contact support.

