# Alert Dialog Migration Guide

## ✅ Completed Replacements

Successfully replaced all `alert()` calls with shadcn/ui AlertDialog in the following files:

1. **`src/app/onboarding/page.tsx`** - 6 alerts replaced
   - AI configuration errors
   - Generation/enhancement errors

2. **`src/app/(dashboard)/projects/[id]/payment/page.tsx`** - 9 alerts replaced
   - File validation errors
   - Form validation errors
   - Success message
   - Submit errors

3. **`src/components/projects/TaskList.tsx`** - 1 alert replaced
   - Task update error

4. **`src/app/(admin)/admin/users/page.tsx`** - 2 alerts replaced
   - User role update errors

5. **`src/app/(admin)/admin/payments/page.tsx`** - 4 alerts replaced
   - Rejection reason validation
   - Verification success/error messages

6. **`src/app/(admin)/admin/cms/services/page.tsx`** - 6 alerts replaced
   - CRUD operation errors (create, update, delete)

7. **`src/app/(admin)/admin/cms/features/page.tsx`** - 4 alerts replaced
   - CRUD operation errors (save, delete)

8. **`src/app/(admin)/admin/settings/ai-settings/page.tsx`** - 4 alerts replaced
   - API key validation
   - Configuration save/test errors

9. **`src/app/(dashboard)/settings/page.tsx`** - 4 alerts replaced
   - Profile and notification preference updates

10. **`src/app/(admin)/admin/settings/payment-accounts/page.tsx`** - 4 alerts replaced
   - Payment account CRUD operations

11. **`src/app/(admin)/admin/clients/page.tsx`** - 4 alerts replaced
   - Client update and delete operations

## 🔧 How It Works

### 1. Custom Hook: `useAlertDialog`

Location: `src/hooks/use-alert-dialog.tsx`

```typescript
const { showAlert, showError, showSuccess, AlertDialog } = useAlertDialog();
```

**Available Methods:**
- `showAlert(description, title?, variant?)` - General alert
- `showError(description, title?)` - Red error dialog (title defaults to "Error")
- `showSuccess(description, title?)` - Green success dialog (title defaults to "Success")

### 2. Implementation Pattern

**Step 1: Import the hook**
```typescript
import { useAlertDialog } from '@/hooks/use-alert-dialog';
```

**Step 2: Use the hook in your component**
```typescript
export default function MyComponent() {
  const { showAlert, showError, showSuccess, AlertDialog } = useAlertDialog();

  // ... rest of your component
}
```

**Step 3: Replace `alert()` calls**
```typescript
// OLD
alert('Please enter your name');
alert('Success! Data saved.');
alert('Error: Failed to save');

// NEW
showError('Please enter your name');
showSuccess('Success! Data saved.');
showError('Error: Failed to save');
```

**Step 4: Add AlertDialog component to JSX**
```typescript
return (
  <div>
    {/* Your component JSX */}

    {/* Alert Dialog - add before closing div */}
    <AlertDialog />
  </div>
);
```

## ✅ All Files Completed!

All files with `alert()` calls have been successfully migrated to use the shadcn/ui AlertDialog component.

## 🎯 Quick Migration Steps

For each remaining file:

1. **Add import:**
   ```typescript
   import { useAlertDialog } from '@/hooks/use-alert-dialog';
   ```

2. **Add hook usage** (after other hooks like `useState`, `useRouter`, etc.):
   ```typescript
   const { showError, showSuccess, AlertDialog } = useAlertDialog();
   ```

3. **Find and replace all `alert()` calls:**
   - Validation errors → `showError(message)`
   - Success messages → `showSuccess(message)`
   - General alerts → `showAlert(message)`

4. **Add `<AlertDialog />` component** before the closing `</div>` in the return statement

5. **Test the page** to ensure all alerts work correctly

## 📝 Example: Full Migration

### Before:
```typescript
'use client';

import { useState } from 'react';

export default function MyPage() {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!validateForm()) {
      alert('Please fill all required fields');
      return;
    }

    try {
      await saveData();
      alert('Data saved successfully!');
    } catch (error) {
      alert('Failed to save data');
    }
  };

  return <div>...</div>;
}
```

### After:
```typescript
'use client';

import { useState } from 'react';
import { useAlertDialog } from '@/hooks/use-alert-dialog';

export default function MyPage() {
  const { showError, showSuccess, AlertDialog } = useAlertDialog();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!validateForm()) {
      showError('Please fill all required fields');
      return;
    }

    try {
      await saveData();
      showSuccess('Data saved successfully!');
    } catch (error) {
      showError('Failed to save data');
    }
  };

  return (
    <div>
      {/* ... your JSX ... */}

      <AlertDialog />
    </div>
  );
}
```

## 🎨 Styling

The AlertDialog uses shadcn/ui's default styling with:
- **Red title** for error dialogs (`showError`)
- **Normal title** for success/general dialogs
- **Larger description text** (text-base) for better readability
- **Single OK button** to dismiss

## ✨ Benefits

- ✅ **Consistent UX** - Professional modal dialogs instead of browser alerts
- ✅ **Better styling** - Matches your app's design system
- ✅ **Accessible** - Keyboard navigation, focus management, ARIA labels
- ✅ **Non-blocking** - Won't interrupt async operations
- ✅ **Customizable** - Easy to extend with more variants

## 📊 Progress

**✅ Completed:** 11/11 files (100%)

All `alert()` calls have been successfully replaced with the shadcn/ui AlertDialog component!

### Summary
- **Total alerts replaced:** 41+ across 11 files
- **Files updated:** 11 (3 client-facing, 8 admin pages)
- **Components created:** 1 custom hook (`useAlertDialog`)
- **Benefits:** Consistent UX, better accessibility, professional styling
