# Backlog & Kanban Task Management System

## Overview

The task management system now includes a **Backlog** workflow where newly generated tasks start in a backlog state before being moved to the Kanban board. This provides better control over task planning and prioritization.

---

## Task Workflow

### Task Statuses

| Status | Location | Description |
|--------|----------|-------------|
| `pending` | **Backlog** | Tasks waiting to be planned (not on Kanban board) |
| `to-do` | **Kanban: To Do** | Tasks planned and ready to start |
| `in-progress` | **Kanban: In Progress** | Tasks currently being worked on |
| `testing` | **Kanban: Testing** | Tasks in QA/testing phase |
| `done` | **Kanban: Done** | Completed tasks |

### Workflow Diagram

```
┌──────────────────────┐
│   AI Generates PRD   │
│   & Tasks            │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   BACKLOG            │
│   (status: pending)  │◄───── Manual Task Add
│   - All AI tasks     │       (Admin creates)
│   - Manual tasks     │
└──────────┬───────────┘
           │
           │ "Move to Board"
           ▼
┌──────────────────────┐
│   KANBAN BOARD       │
│                      │
│  ┌────┬───────┬────┬─────┐
│  │To Do│In Prog│Test│Done│
│  │    │       │    │     │
│  └────┴───────┴────┴─────┘
└──────────────────────┘
```

---

## Features

### 1. Backlog Section ✅

**Location**: Below Kanban board in Tasks tab

**Features**:
- **Table View**: Shows all pending tasks in a clear table format
- **Task Details**: Title, description, section, priority, estimated hours
- **Move to Board**: Button to promote tasks from backlog to "To Do" column
- **Task Count**: Shows number of tasks in backlog

**Columns**:
1. Task (title + description preview)
2. Section (Frontend, Backend, etc.)
3. Priority badge (High/Medium/Low)
4. Estimated Hours
5. Actions ("Move to Board" button)

### 2. Add Task Manually ✅

**Access**: Click "Add Task" button in Backlog section

**Dialog Fields**:
- **Task Title** (required)
- **Description** (optional)
- **Priority** (Low/Medium/High dropdown)
- Auto-set fields:
  - Status: `pending` (goes to backlog)
  - Section: `Custom`
  - Estimated Hours: `0`
  - Order: Next available

**Use Cases**:
- Add forgotten requirements
- Add technical debt tasks
- Add bug fix tasks
- Add improvement tasks
- Add documentation tasks

### 3. Move Tasks to Kanban ✅

**Method**: Click "Move to Board" button on any backlog task

**What Happens**:
- Task status changes from `pending` → `to-do`
- Task disappears from backlog table
- Task appears in "To Do" column of Kanban board
- Task is now part of the active workflow

### 4. Kanban Board ✅

**4 Columns**: To Do, In Progress, Testing, Done

**Status Dropdown** on each task card:
- Shows all 5 statuses (including Backlog)
- Can move task directly to any status
- Can move task back to backlog if needed

---

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  KANBAN BOARD                                           │
│  ┌────────────┬────────────┬────────────┬────────────┐ │
│  │  To Do     │ In Progress│  Testing   │   Done     │ │
│  │  (0)       │  (1)       │  (0)       │  (1)       │ │
│  ├────────────┼────────────┼────────────┼────────────┤ │
│  │ [Task card]│ [Task card]│            │ [Task card]│ │
│  │ [Task card]│            │            │            │ │
│  └────────────┴────────────┴────────────┴────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  BACKLOG (21)                     [+ Add Task] button   │
│  Tasks waiting to be added to the Kanban board          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Task │ Section  │ Priority │ Hours │ Actions      │ │
│  ├──────┼──────────┼──────────┼───────┼──────────────┤ │
│  │ 1    │ Frontend │ High     │ 8h    │ [Move→Board] │ │
│  │ 2    │ Backend  │ Medium   │ 5h    │ [Move→Board] │ │
│  │ 3    │ Database │ Low      │ 3h    │ [Move→Board] │ │
│  └──────┴──────────┴──────────┴───────┴──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Default Task Status

### AI-Generated Tasks

When a PRD is generated and tasks are created by AI:
- **Default Status**: `pending` (Backlog)
- **Location**: Backlog table
- **Reason**: Allows admin to review and plan before adding to active work

### Manually Added Tasks

When admin adds a task manually:
- **Default Status**: `pending` (Backlog)
- **Location**: Backlog table
- **Reason**: Consistent with AI tasks, allows planning

---

## API Endpoints

### Create Task Manually

**POST `/api/admin/projects/[id]/tasks`**

**Request Body**:
```json
{
  "title": "Fix login bug",
  "description": "Users can't login with social auth",
  "priority": "high",
  "status": "pending",
  "section": "Custom",
  "estimatedHours": 0,
  "dependencies": "",
  "order": 25
}
```

**Response**:
```json
{
  "success": true,
  "message": "Task created successfully"
}
```

### Update Task Status

**PATCH `/api/tasks/[id]`**

**Request Body**:
```json
{
  "status": "to-do"  // or 'pending', 'in-progress', 'testing', 'done'
}
```

**Response**:
```json
{
  "success": true
}
```

---

## Database Schema

### Tasks Table

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  section TEXT NOT NULL,
  priority TEXT NOT NULL,          -- 'low' | 'medium' | 'high'
  status TEXT DEFAULT 'pending',   -- 'pending' | 'to-do' | 'in-progress' | 'testing' | 'done'
  estimated_hours INTEGER NOT NULL,
  dependencies TEXT,
  "order" INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

**Key Change**: Default status is now `'pending'` instead of `'to-do'`

---

## Migration

### Production Database Update

All existing tasks were migrated:

```sql
UPDATE tasks SET status = 'pending' WHERE status = 'to-do';
```

**Result**: 21 tasks updated successfully

---

## User Workflows

### Workflow 1: New Project with AI Tasks

1. Admin generates PRD with AI
2. AI creates 15-25 tasks with status `pending`
3. All tasks appear in Backlog table
4. Admin reviews tasks
5. Admin clicks "Move to Board" on priority tasks
6. Tasks move to "To Do" column
7. Admin can start working on Kanban tasks

### Workflow 2: Add Custom Task

1. Admin clicks "Add Task" button
2. Dialog opens
3. Admin fills: Title, Description, Priority
4. Admin clicks "Add Task"
5. Task created with status `pending`
6. Task appears in Backlog table
7. Admin can "Move to Board" when ready

### Workflow 3: Move Task Back to Backlog

1. Admin has task in Kanban board
2. Admin clicks status dropdown on task
3. Admin selects "Backlog"
4. Task disappears from Kanban
5. Task reappears in Backlog table
6. Can be moved back to board later

---

## Benefits

### Better Planning
- Review all AI-generated tasks before starting work
- Prioritize which tasks to work on first
- Don't clutter Kanban board with unplanned tasks

### Flexibility
- Add custom tasks any time
- Move tasks back to backlog if needed
- Clear separation between planned and unplanned work

### Organized Workflow
- Backlog for planning
- Kanban for execution
- No mixing of planned vs unplanned tasks

### Scalability
- Handle 100+ AI-generated tasks
- Add tasks incrementally to board
- Manage large project scope effectively

---

## Future Enhancements

1. **Drag & Drop**: Drag tasks from backlog to Kanban columns
2. **Bulk Move**: Select multiple backlog tasks and move at once
3. **Backlog Sorting**: Sort backlog by priority, hours, section
4. **Backlog Filtering**: Filter backlog by section or priority
5. **Task Dependencies**: Show task dependencies in backlog
6. **Sprint Planning**: Group backlog tasks into sprints
7. **Backlog Grooming**: Mark tasks for review or deletion
8. **Task Templates**: Create task templates for common work
9. **Time Tracking**: Track actual hours spent on tasks
10. **Task Comments**: Add notes and comments to tasks

---

## Code Structure

### Frontend Component

**File**: `/src/app/(admin)/admin/projects/[id]/page.tsx`

**Key Functions**:
- `groupTasksByStatus()` - Filters tasks for Kanban columns
- `backlogTasks` - Filters tasks with status='pending'
- `handleAddTask()` - Creates new task via API
- `handleStatusChange()` - Updates task status
- `<Dialog>` - Add Task modal
- `<Table>` - Backlog table view

### Backend API

**Files**:
- `/src/app/api/admin/projects/[id]/tasks/route.ts` - Create task
- `/src/app/api/tasks/[id]/route.ts` - Update task status

---

## Security

- ✅ Admin-only access for adding tasks
- ✅ Admin-only access for moving tasks
- ✅ Validation: Task title required
- ✅ Default safe values for optional fields
- ✅ SQL injection protection via ORM

---

**Status**: ✅ **Fully Implemented**  
**Last Updated**: October 16, 2025  
**Version**: 1.0
