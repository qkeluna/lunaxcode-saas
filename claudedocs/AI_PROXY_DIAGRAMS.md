# AI Proxy Architecture Diagrams

This document contains visual diagrams for the AI Proxy System architecture.

---

## System Overview

```mermaid
graph TB
    Client[Client Browser<br/>localStorage: API Keys]
    Proxy[Edge API Route<br/>/api/ai/proxy]
    Security[Security Layer<br/>Rate Limit, Validation]
    Router[Proxy Service<br/>Provider Router]
    OpenAI[OpenAI API]
    Anthropic[Anthropic API]
    Google[Google Gemini API]
    DeepSeek[DeepSeek API]
    Groq[Groq API]
    Together[Together AI API]

    Client -->|POST JSON| Proxy
    Proxy --> Security
    Security -->|Validated| Router
    Router -->|Transform & Route| OpenAI
    Router -->|Transform & Route| Anthropic
    Router -->|Transform & Route| Google
    Router -->|Transform & Route| DeepSeek
    Router -->|Transform & Route| Groq
    Router -->|Transform & Route| Together

    OpenAI -->|Response| Router
    Anthropic -->|Response| Router
    Google -->|Response| Router
    DeepSeek -->|Response| Router
    Groq -->|Response| Router
    Together -->|Response| Router

    Router -->|Unified Format| Proxy
    Proxy -->|JSON Response| Client

    style Client fill:#e1f5ff
    style Proxy fill:#fff4e6
    style Security fill:#ffe7e7
    style Router fill:#e7f5e7
    style OpenAI fill:#f0f0f0
    style Anthropic fill:#f0f0f0
    style Google fill:#f0f0f0
    style DeepSeek fill:#f0f0f0
    style Groq fill:#f0f0f0
    style Together fill:#f0f0f0
```

---

## Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant Edge as Edge API Route
    participant Security as Security Layer
    participant Transformer as Request Transformer
    participant Provider as AI Provider
    participant Response as Response Transformer

    Client->>Edge: POST /api/ai/proxy
    Note over Client,Edge: {provider, model, messages, apiKey}

    Edge->>Security: Validate Request
    Security->>Security: Check Rate Limit
    Security->>Security: Validate Schema
    Security->>Security: Check API Key Format

    alt Rate Limit Exceeded
        Security-->>Client: 429 Rate Limit Exceeded
    else Invalid Request
        Security-->>Client: 400 Bad Request
    else Valid Request
        Security->>Transformer: Process Request
        Transformer->>Transformer: Convert to Provider Format
        Transformer->>Provider: HTTP POST

        alt Success
            Provider-->>Response: Provider Response
            Response->>Response: Transform to Universal Format
            Response-->>Client: 200 OK {text, usage, model}
        else Provider Error
            Provider-->>Response: Error Response
            Response-->>Client: 4xx/5xx Error
        end
    end
```

---

## Provider Routing Logic

```mermaid
flowchart TD
    Start[Request Received] --> Validate{Valid Request?}
    Validate -->|No| Error400[400 Bad Request]
    Validate -->|Yes| RateLimit{Within Rate Limit?}
    RateLimit -->|No| Error429[429 Rate Limit Exceeded]
    RateLimit -->|Yes| Provider{Which Provider?}

    Provider -->|openai| OpenAI[OpenAI Handler]
    Provider -->|anthropic| Anthropic[Anthropic Handler]
    Provider -->|google| Google[Google Handler]
    Provider -->|deepseek| DeepSeek[DeepSeek Handler]
    Provider -->|groq| Groq[Groq Handler]
    Provider -->|together| Together[Together Handler]

    OpenAI --> Transform1[Transform Request]
    Anthropic --> Transform2[Transform Request]
    Google --> Transform3[Transform Request]
    DeepSeek --> Transform4[Transform Request]
    Groq --> Transform5[Transform Request]
    Together --> Transform6[Transform Request]

    Transform1 --> API1[OpenAI API Call]
    Transform2 --> API2[Anthropic API Call]
    Transform3 --> API3[Google API Call]
    Transform4 --> API4[DeepSeek API Call]
    Transform5 --> API5[Groq API Call]
    Transform6 --> API6[Together API Call]

    API1 --> Success{Success?}
    API2 --> Success
    API3 --> Success
    API4 --> Success
    API5 --> Success
    API6 --> Success

    Success -->|Yes| TransformBack[Transform Response]
    Success -->|No| HandleError[Handle Error]

    TransformBack --> Return200[200 OK Response]
    HandleError --> Return5xx[4xx/5xx Error Response]

    style Start fill:#e1f5ff
    style Validate fill:#fff4e6
    style RateLimit fill:#fff4e6
    style Provider fill:#e7f5e7
    style Success fill:#fff4e6
    style Return200 fill:#d4edda
    style Error400 fill:#f8d7da
    style Error429 fill:#f8d7da
    style Return5xx fill:#f8d7da
```

---

## Security Architecture

```mermaid
graph TB
    Request[Incoming Request]
    Method[Method Check<br/>POST or OPTIONS]
    ContentType[Content-Type Check<br/>application/json]
    Size[Request Size Check<br/>Max 1MB]
    RateLimit[Rate Limit Check<br/>IP-based]
    Schema[Schema Validation<br/>Required fields]
    APIKey[API Key Format<br/>Provider-specific]

    Request --> Method
    Method -->|Valid| ContentType
    Method -->|Invalid| Error1[405 Method Not Allowed]

    ContentType -->|Valid| Size
    ContentType -->|Invalid| Error2[415 Unsupported Media Type]

    Size -->|Valid| RateLimit
    Size -->|Invalid| Error3[413 Payload Too Large]

    RateLimit -->|Valid| Schema
    RateLimit -->|Exceeded| Error4[429 Rate Limit Exceeded]

    Schema -->|Valid| APIKey
    Schema -->|Invalid| Error5[400 Bad Request]

    APIKey -->|Valid| Process[Process Request]
    APIKey -->|Invalid| Error6[401 Unauthorized]

    Process --> Response[Add Security Headers]
    Response --> Client[Return to Client]

    style Request fill:#e1f5ff
    style Process fill:#d4edda
    style Response fill:#d4edda
    style Client fill:#d4edda
    style Error1 fill:#f8d7da
    style Error2 fill:#f8d7da
    style Error3 fill:#f8d7da
    style Error4 fill:#f8d7da
    style Error5 fill:#f8d7da
    style Error6 fill:#f8d7da
```

---

## Rate Limiting Flow

```mermaid
stateDiagram-v2
    [*] --> CheckIP: Request Received
    CheckIP --> GetEntry: Extract IP from Headers
    GetEntry --> FilterOld: Load Rate Limit Entry
    FilterOld --> CheckHourly: Remove Old Timestamps

    CheckHourly --> CheckMinute: < 100/hour?
    CheckHourly --> RateLimited: >= 100/hour

    CheckMinute --> UpdateEntry: < 20/minute?
    CheckMinute --> RateLimited: >= 20/minute

    UpdateEntry --> ProcessRequest: Add Timestamp
    RateLimited --> ReturnError: Calculate Retry-After

    ProcessRequest --> [*]: 200 OK
    ReturnError --> [*]: 429 Rate Limit Exceeded

    note right of CheckHourly
        Rate Limit: 100/hour
        Per IP address
    end note

    note right of CheckMinute
        Rate Limit: 20/minute
        Per IP address
    end note
```

---

## Error Handling Flow

```mermaid
graph TD
    Error[Error Occurred]
    Type{Error Type?}

    Error --> Type

    Type -->|AIProxyException| Known[Known Error]
    Type -->|Network Error| Network[Network Error Handler]
    Type -->|Unexpected| Unknown[Unknown Error Handler]

    Known --> Code{Error Code?}

    Code -->|INVALID_API_KEY| E401[401 Unauthorized]
    Code -->|RATE_LIMIT_EXCEEDED| E429[429 Rate Limit]
    Code -->|PROVIDER_ERROR| E503[503 Service Unavailable]
    Code -->|TIMEOUT| E504[504 Gateway Timeout]
    Code -->|INVALID_REQUEST| E400[400 Bad Request]
    Code -->|NETWORK_ERROR| E503

    Network --> E503
    Unknown --> E500[500 Internal Server Error]

    E401 --> Log[Log Error Safely]
    E429 --> Log
    E503 --> Log
    E504 --> Log
    E400 --> Log
    E500 --> Log

    Log --> Sanitize[Sanitize Error Message]
    Sanitize --> Return[Return Error Response]

    style Error fill:#f8d7da
    style Known fill:#fff4e6
    style Network fill:#fff4e6
    style Unknown fill:#fff4e6
    style E401 fill:#f8d7da
    style E429 fill:#f8d7da
    style E503 fill:#f8d7da
    style E504 fill:#f8d7da
    style E400 fill:#f8d7da
    style E500 fill:#f8d7da
    style Return fill:#e1f5ff
```

---

## Request Transformation

```mermaid
flowchart LR
    subgraph Universal Format
        U1[Universal Request]
        U2[provider: string]
        U3[model: string]
        U4[messages: Array]
        U5[apiKey: string]

        U1 --> U2
        U1 --> U3
        U1 --> U4
        U1 --> U5
    end

    subgraph Transformer
        T[Provider-Specific<br/>Transformer]
    end

    subgraph OpenAI Format
        O1[OpenAI Request]
        O2[model: string]
        O3[messages: Array]
        O4[temperature: number]
        O5[max_tokens: number]

        O1 --> O2
        O1 --> O3
        O1 --> O4
        O1 --> O5
    end

    subgraph Anthropic Format
        A1[Anthropic Request]
        A2[model: string]
        A3[messages: Array]
        A4[system: string]
        A5[max_tokens: number]

        A1 --> A2
        A1 --> A3
        A1 --> A4
        A1 --> A5
    end

    subgraph Google Format
        G1[Google Request]
        G2[contents: Array]
        G3[generationConfig: Object]

        G1 --> G2
        G1 --> G3
    end

    U1 --> T
    T -->|openai| O1
    T -->|anthropic| A1
    T -->|google| G1

    style U1 fill:#e1f5ff
    style T fill:#fff4e6
    style O1 fill:#e7f5e7
    style A1 fill:#e7f5e7
    style G1 fill:#e7f5e7
```

---

## Response Transformation

```mermaid
flowchart RL
    subgraph Provider Responses
        O[OpenAI<br/>Response]
        A[Anthropic<br/>Response]
        G[Google<br/>Response]
    end

    subgraph Transformers
        TO[OpenAI<br/>Transformer]
        TA[Anthropic<br/>Transformer]
        TG[Google<br/>Transformer]
    end

    subgraph Universal Response
        U[Universal Format]
        U1[text: string]
        U2[usage: Object]
        U3[model: string]
        U4[provider: string]
        U5[finishReason: string]

        U --> U1
        U --> U2
        U --> U3
        U --> U4
        U --> U5
    end

    O --> TO
    A --> TA
    G --> TG

    TO --> U
    TA --> U
    TG --> U

    style O fill:#f0f0f0
    style A fill:#f0f0f0
    style G fill:#f0f0f0
    style TO fill:#fff4e6
    style TA fill:#fff4e6
    style TG fill:#fff4e6
    style U fill:#d4edda
```

---

## Streaming Architecture (Future)

```mermaid
sequenceDiagram
    participant Client
    participant Edge as /api/ai/stream
    participant Provider as AI Provider

    Client->>Edge: POST /api/ai/stream
    Note over Client,Edge: {provider, model, messages, stream: true}

    Edge->>Provider: Streaming Request

    loop Stream Chunks
        Provider->>Edge: Chunk: "Hello"
        Edge->>Client: SSE: data: {"text":"Hello","done":false}
        Provider->>Edge: Chunk: " world"
        Edge->>Client: SSE: data: {"text":" world","done":false}
    end

    Provider->>Edge: Final Chunk + Usage
    Edge->>Client: SSE: data: {"text":"!","done":true,"usage":{...}}

    Edge->>Client: Stream Closed

    Note over Client: Display real-time updates<br/>as chunks arrive
```

---

## File Organization

```mermaid
graph TB
    subgraph API Routes
        R1[/api/ai/proxy/route.ts]
        R2[/api/ai/stream/route.ts]
        R3[/api/ai/validate/route.ts]
    end

    subgraph Core Libraries
        L1[types.ts<br/>TypeScript Interfaces]
        L2[provider-config.ts<br/>Provider Settings]
        L3[transformers.ts<br/>Request/Response Transform]
        L4[proxy-service.ts<br/>Core Routing Logic]
        L5[error-handler.ts<br/>Error Management]
        L6[rate-limiter.ts<br/>Security & Rate Limiting]
    end

    subgraph Existing
        E1[universal-ai.ts<br/>Server-side AI]
    end

    R1 --> L4
    R2 --> L4
    R3 --> L2

    L4 --> L2
    L4 --> L3
    L4 --> L5

    R1 --> L5
    R2 --> L5
    R3 --> L5

    R1 --> L6
    R2 --> L6
    R3 --> L6

    L3 --> L1
    L2 --> L1
    L4 --> L1
    L5 --> L1

    style R1 fill:#fff4e6
    style R2 fill:#fff4e6
    style R3 fill:#fff4e6
    style L1 fill:#e7f5e7
    style L2 fill:#e7f5e7
    style L3 fill:#e7f5e7
    style L4 fill:#e7f5e7
    style L5 fill:#e7f5e7
    style L6 fill:#e7f5e7
    style E1 fill:#f0f0f0
```

---

## Component Interaction

```mermaid
classDiagram
    class AIProxyRequest {
        +provider: AIProvider
        +model: string
        +messages: AIMessage[]
        +apiKey: string
        +temperature?: number
        +maxTokens?: number
    }

    class AIProxyResponse {
        +text: string
        +usage: Usage
        +model: string
        +provider: string
        +finishReason: string
    }

    class ProviderConfig {
        +baseUrl: string
        +headers: Record
        +defaultMaxTokens: number
        +timeout: number
        +supportsStreaming: boolean
    }

    class ProxyService {
        +executeAIRequest()
        +executeStreamingRequest()
    }

    class RequestTransformer {
        +transformToOpenAI()
        +transformToAnthropic()
        +transformToGoogle()
    }

    class ResponseTransformer {
        +transformFromOpenAI()
        +transformFromAnthropic()
        +transformFromGoogle()
    }

    class ErrorHandler {
        +validateProxyRequest()
        +handleHttpError()
        +sanitizeErrorMessage()
    }

    class RateLimiter {
        +checkRateLimit()
        +enforceRateLimit()
        +addSecurityHeaders()
    }

    AIProxyRequest --> ProxyService
    ProxyService --> ProviderConfig
    ProxyService --> RequestTransformer
    ProxyService --> ResponseTransformer
    ProxyService --> ErrorHandler
    ProxyService --> RateLimiter
    ResponseTransformer --> AIProxyResponse
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph Client
        Browser[Web Browser]
        LocalStorage[localStorage<br/>API Keys]
    end

    subgraph Cloudflare Edge
        Pages[Cloudflare Pages]
        EdgeRuntime[Edge Runtime<br/>Next.js API Routes]
        Workers[Cloudflare Workers]
    end

    subgraph External Services
        OpenAI[OpenAI API]
        Anthropic[Anthropic API]
        Google[Google Gemini]
        Others[Other Providers...]
    end

    Browser --> LocalStorage
    Browser -->|HTTPS POST| Pages
    Pages --> EdgeRuntime
    EdgeRuntime --> Workers

    Workers -->|API Request| OpenAI
    Workers -->|API Request| Anthropic
    Workers -->|API Request| Google
    Workers -->|API Request| Others

    OpenAI -->|Response| Workers
    Anthropic -->|Response| Workers
    Google -->|Response| Workers
    Others -->|Response| Workers

    Workers --> EdgeRuntime
    EdgeRuntime --> Pages
    Pages -->|JSON Response| Browser

    style Browser fill:#e1f5ff
    style LocalStorage fill:#fff4e6
    style Pages fill:#ffe7e7
    style EdgeRuntime fill:#ffe7e7
    style Workers fill:#ffe7e7
    style OpenAI fill:#f0f0f0
    style Anthropic fill:#f0f0f0
    style Google fill:#f0f0f0
    style Others fill:#f0f0f0
```

---

## Integration Points

```mermaid
graph LR
    subgraph Client Application
        UI[React UI Components]
        Hook[useAI Hook]
        Storage[localStorage Manager]
    end

    subgraph AI Proxy System
        Proxy[/api/ai/proxy]
        Stream[/api/ai/stream]
        Validate[/api/ai/validate]
    end

    subgraph Existing Features
        PRD[PRD Generation<br/>universal-ai.ts]
        Tasks[Task Generation]
        Onboarding[Onboarding Flow]
    end

    UI --> Hook
    Hook --> Storage
    Hook --> Proxy
    Hook --> Stream
    Hook --> Validate

    Onboarding --> PRD
    PRD --> Tasks

    Note1[Can migrate to use<br/>AI Proxy if needed]
    PRD -.-> Note1
    Tasks -.-> Note1

    style UI fill:#e1f5ff
    style Hook fill:#e1f5ff
    style Storage fill:#fff4e6
    style Proxy fill:#e7f5e7
    style Stream fill:#e7f5e7
    style Validate fill:#e7f5e7
    style PRD fill:#f0f0f0
    style Tasks fill:#f0f0f0
    style Onboarding fill:#f0f0f0
```

---

## Notes

All diagrams are in Mermaid format and can be rendered using:
- GitHub Markdown
- Mermaid Live Editor (https://mermaid.live)
- VS Code with Mermaid extension
- Documentation tools supporting Mermaid

To view these diagrams:
1. Copy the Mermaid code block
2. Paste into https://mermaid.live
3. Click "Render" to see the visual diagram
