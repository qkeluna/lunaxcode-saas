# PRD Prompt Preview Feature - Visual Diagram

## Component Architecture

```mermaid
graph TD
    A[Admin Project Detail Page] -->|Click Sparkles| B[GeneratePRDModalEnhanced]
    B -->|User clicks Preview| C[Load Prompt Data]
    C -->|GET Request| D["/api/admin/projects/[id]/preview-prompt"]
    D -->|Fetch from DB| E[Project Data]
    D -->|Fetch from DB| F[Service Type]
    D -->|Fetch from DB| G[Project Answers]
    D -->|Build Prompts| H[buildPRDPrompt]
    D -->|Build Prompts| I[buildTasksPrompt]
    H --> J[PRD Prompt String]
    I --> K[Tasks Prompt String]
    J --> L[Return JSON Response]
    K --> L
    L --> M[Display Split-Screen UI]
    M -->|Left Panel| N[Project Info & Metadata]
    M -->|Right Panel| O[Tabbed Prompt Preview]
    O -->|Tab 1| P[PRD Prompt with Highlighting]
    O -->|Tab 2| Q[Tasks Prompt with Highlighting]
    P -->|Copy Button| R[Clipboard API]
    Q -->|Copy Button| R
    M -->|Generate Button| S[Execute AI Generation]
    S -->|POST Request| T["/api/admin/projects/[id]/generate-prd"]
    T -->|Use AI Config| U[Universal AI Service]
    U -->|Generate| V[PRD Content]
    U -->|Generate| W[Tasks Array]
    V --> X[Save to Database]
    W --> X
    X --> Y[Refresh Project Data]
    Y --> Z[Show Success Message]
```

## User Flow Diagram

```mermaid
sequenceDiagram
    participant Admin
    participant Modal
    participant PreviewAPI
    participant Database
    participant GenerateAPI
    participant AI

    Admin->>Modal: Click "Generate PRD" button
    Modal->>Admin: Show modal with info
    Admin->>Modal: Click "Preview JSON Prompt"
    Modal->>PreviewAPI: GET /preview-prompt
    PreviewAPI->>Database: Fetch project data
    Database-->>PreviewAPI: Project, Service, Answers
    PreviewAPI->>PreviewAPI: Build PRD & Tasks prompts
    PreviewAPI-->>Modal: Return prompt data
    Modal->>Admin: Display split-screen with prompts
    Admin->>Modal: Review PRD prompt tab
    Admin->>Modal: Review Tasks prompt tab
    Admin->>Modal: Click "Copy" (optional)
    Modal->>Admin: Show "Copied!" feedback
    Admin->>Modal: Click "Generate with AI"
    Modal->>GenerateAPI: POST /generate-prd
    GenerateAPI->>AI: Send PRD prompt
    AI-->>GenerateAPI: PRD content
    GenerateAPI->>AI: Send Tasks prompt
    AI-->>GenerateAPI: Tasks JSON
    GenerateAPI->>Database: Save PRD & Tasks
    Database-->>GenerateAPI: Success
    GenerateAPI-->>Modal: Generation complete
    Modal->>Admin: Show success, auto-close
```

## UI State Machine

```mermaid
stateDiagram-v2
    [*] --> Closed
    Closed --> ModalOpen: Click Sparkles
    ModalOpen --> LoadingPreview: Click "Preview Prompt"
    ModalOpen --> Generating: Click "Generate" (no preview)
    LoadingPreview --> PreviewError: API Error
    LoadingPreview --> PreviewShown: Success
    PreviewShown --> ModalOpen: Click "Hide Preview"
    PreviewShown --> Generating: Click "Generate"
    PreviewError --> ModalOpen: Click "Try Again"
    Generating --> GenerateSuccess: AI Success
    Generating --> GenerateError: AI Error
    GenerateSuccess --> Closed: Auto-close after 3s
    GenerateError --> ModalOpen: Show error
    ModalOpen --> Closed: Click "Cancel"
```

## Data Flow

```mermaid
flowchart LR
    subgraph Database
        A1[projects table]
        A2[service_types table]
        A3[project_answers table]
    end

    subgraph API Layer
        B1[preview-prompt route]
        B2[generate-prd route]
    end

    subgraph Prompt Building
        C1[buildPRDPrompt]
        C2[buildTasksPrompt]
    end

    subgraph UI Components
        D1[Modal State]
        D2[Left Panel]
        D3[Right Panel - Tabs]
        D4[PRD Tab]
        D5[Tasks Tab]
    end

    A1 --> B1
    A2 --> B1
    A3 --> B1
    B1 --> C1
    B1 --> C2
    C1 --> D1
    C2 --> D1
    D1 --> D2
    D1 --> D3
    D3 --> D4
    D3 --> D5
    D1 --> B2
```

## Split-Screen Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│  🌟 Generate PRD & Tasks with AI           [👁️ Preview JSON Prompt]    │
│  Project Name                                                          │
├──────────────────────────────┬─────────────────────────────────────────┤
│                              │                                         │
│  LEFT PANEL (40%)            │  RIGHT PANEL (60%)                      │
│  ─────────────────           │  ──────────────────                     │
│                              │                                         │
│  This will use AI to:        │  ┌─────────────────────────────────┐   │
│  • Comprehensive PRD         │  │  Prompt Preview   🔍            │   │
│  • 15-25 detailed tasks      │  ├─────────────────────────────────┤   │
│  • Time estimates            │  │  [PRD Prompt] [Tasks Prompt]    │   │
│  • Priorities                │  │                          [Copy] │   │
│  • Dependencies              │  ├─────────────────────────────────┤   │
│                              │  │                                 │   │
│  📊 Project Details:         │  │ Create a comprehensive...       │   │
│  ┌─────────────────────┐    │  │                                 │   │
│  │ Service: Landing    │    │  │ Service Type: ${serviceName}    │   │
│  │ Description: 450ch  │    │  │ Project Description: ${desc}    │   │
│  │ Requirements: 8     │    │  │                                 │   │
│  │ Est. Tokens: ~1.2K  │    │  │ Client Requirements:            │   │
│  └─────────────────────┘    │  │ - target_audience: ...          │   │
│                              │  │ - key_features: ...             │   │
│  ⚠️ Replaces existing PRD    │  │                                 │   │
│  ⏱️ Expected: 20-40 seconds  │  │ Generate a detailed PRD with:   │   │
│                              │  │                                 │   │
│                              │  │ # Project Requirements Doc...   │   │
│                              │  │                                 │   │
│                              │  │ ## 1. Executive Summary         │   │
│                              │  │ Brief overview of project...    │   │
│                              │  │                                 │   │
│                              │  │ ## 2. Project Overview          │   │
│                              │  │ Detailed description...         │   │
│                              │  │                                 │   │
│                              │  │ [... scrollable content ...]    │   │
│                              │  │                                 │   │
│                              │  └─────────────────────────────────┘   │
│                              │                                         │
├──────────────────────────────┴─────────────────────────────────────────┤
│                          [Cancel]  [✨ Generate with AI]               │
└────────────────────────────────────────────────────────────────────────┘
```

## Syntax Highlighting Legend

```typescript
// Color-coded text highlighting:

Blue Bold:    # Headers     → Headings in the prompt
Green:        - Bullets     → List items and features
Purple Italic: ${variables} → Dynamic placeholders
Gray:         Normal text   → Regular prompt content
```

## Copy Functionality Flow

```mermaid
graph LR
    A[User clicks Copy] --> B[navigator.clipboard.writeText]
    B --> C{Success?}
    C -->|Yes| D[Show 'Copied!' icon]
    C -->|No| E[Log error]
    D --> F[Wait 2 seconds]
    F --> G[Reset to 'Copy' icon]
```

## Modal Dialog Size States

```
Normal Mode (no preview):
┌─────────────────────────┐
│  Max Width: 600px       │
│  Height: Auto           │
│  Single Column          │
└─────────────────────────┘

Preview Mode:
┌───────────────────────────────────────────────────────────┐
│  Max Width: 95vw (viewport width)                        │
│  Max Height: 90vh (viewport height)                      │
│  Two Columns: 40% / 60% split                            │
│  Scrollable right panel for long prompts                 │
└───────────────────────────────────────────────────────────┘
```

## Responsive Breakpoints

```
Mobile (<640px):
- Single column layout
- Tabs stack vertically
- Preview shows below info

Tablet (640px - 1024px):
- Split screen maintained
- Narrower gap between panels
- Smaller font sizes

Desktop (>1024px):
- Full split screen
- Comfortable reading width
- Larger prompt preview area
```

## API Response Structure

```json
{
  "success": true,
  "data": {
    "prd": {
      "provider": "Will use default AI provider from settings",
      "model": "Will use configured model",
      "prompt": "Create a comprehensive Project Requirements Document...",
      "metadata": {
        "serviceName": "Landing Page Design",
        "descriptionLength": 450,
        "requirementsCount": 8,
        "estimatedTokens": 1200
      }
    },
    "tasks": {
      "provider": "Will use default AI provider from settings",
      "model": "Will use configured model",
      "prompt": "Based on this PRD, generate 15-25 specific tasks...",
      "metadata": {
        "prdAvailable": true,
        "prdLength": 3500,
        "estimatedTokens": 2800
      }
    },
    "project": {
      "id": 1,
      "name": "Acme Corp Landing Page",
      "service": "Landing Page Design",
      "description": "We need a modern landing page...",
      "questionAnswers": {
        "target_audience": "B2B SaaS companies",
        "key_features": ["Hero section", "Pricing table"],
        "preferred_style": "Minimalist"
      }
    }
  }
}
```

## Feature Integration Points

```
lunaxcode-saas/
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       └── projects/
│   │   │           └── [id]/
│   │   │               └── page.tsx  ← Uses enhanced modal
│   │   └── api/
│   │       └── admin/
│   │           └── projects/
│   │               └── [id]/
│   │                   ├── preview-prompt/
│   │                   │   └── route.ts  ← NEW: Preview API
│   │                   └── generate-prd/
│   │                       └── route.ts  ← Existing: Generation API
│   ├── components/
│   │   └── admin/
│   │       ├── GeneratePRDModal.tsx  ← Original (preserved)
│   │       └── GeneratePRDModalEnhanced.tsx  ← NEW: With preview
│   └── lib/
│       └── ai/
│           └── universal-ai.ts  ← Prompt building logic
```
