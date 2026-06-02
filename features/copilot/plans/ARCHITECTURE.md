# Architecture Overview

This document shows a high-level architecture overview for the Copilot "Plans" feature and surrounding platform components.

```mermaid
flowchart LR
  %% Clients & Edge
  subgraph CLIENTS["Clients"]
    Browser[Web App<br/>(Browser / SPA)]
    Mobile[Mobile App]
  end

  subgraph EDGE["Edge / Delivery"]
    CDN[CDN]
    WAF[WAF / DDoS Protection]
  end

  Browser -->|https| CDN
  Mobile -->|https| CDN
  CDN --> WAF

  %% API Layer
  subgraph API["API / Ingress"]
    APIGW[API Gateway / LB]
    AuthProxy[Auth Proxy (JWT/OAuth)]
  end
  WAF --> APIGW
  APIGW --> AuthProxy

  %% Frontend & Gateway
  subgraph FRONTEND["Frontend"]
    FrontendSvc[Frontend Service / SPA Backend]
  end
  AuthProxy --> FrontendSvc

  %% Core Services
  subgraph SERVICES["Application Services"]
    PlansSvc[Plans Service\n(feature domain)]
    CopilotSvc[Copilot AI Service\n(assistant / recommendations)]
    UsersSvc[User/Profile Service]
    BillingSvc[Billing Service]
    Worker[Background Workers / Jobs]
  end

  APIGW --> PlansSvc
  APIGW --> CopilotSvc
  APIGW --> UsersSvc
  APIGW --> BillingSvc

  FrontendSvc --> PlansSvc
  PlansSvc --> CopilotSvc
  PlansSvc --> BillingSvc
  PlansSvc --> UsersSvc
  CopilotSvc -->|async| Worker

  %% Data & Integrations
  subgraph DATA["Data & Storage"]
    PlansDB[(Plans DB)\n(Relational)]
    UsersDB[(Users DB)]
    BillingDB[(Billing DB)]
    Cache[(Redis Cache)]
    ObjectStore[(Object Storage)]
    EventBus[(Event Bus / Kafka)]
    MLStore[(ML Feature Store / Vector DB)]
  end

  PlansSvc --> PlansDB
  UsersSvc --> UsersDB
  BillingSvc --> BillingDB
  PlansSvc --> Cache
  CopilotSvc --> MLStore
  Worker --> EventBus
  EventBus --> PlansSvc

  %% Observability & Infra
  subgraph INFRA["Infra & Observability"]
    Prom[Metrics / Prometheus]
    Tracing[Distributed Tracing]
    Logs[Centralized Logging]
    CDNConfig[CDN Config / Edge Rules]
    CICD[CI/CD / GitOps]
  end

  Services --> Prom
  Services --> Tracing
  Services --> Logs
  Worker --> Logs
  CICD --> Services

  %% External integrations
  subgraph EXTERNAL["External / 3rd-party"]
    PaymentGateway[Payment Provider]
    AuthProvider[OAuth / Identity Provider]
    MLProvider[Large Model API / Private Model]
  end

  BillingSvc --> PaymentGateway
  AuthProxy --> AuthProvider
  CopilotSvc --> MLProvider
```

Notes
- The diagram highlights synchronous request flows (API Gateway -> Services) and asynchronous flows (Event Bus, Workers).
- Key concerns: authentication/authorization, data partitioning (separate DBs), caching for read-heavy endpoints, observability for tracing AI requests and billing-sensitive flows.
- Suggested filename/path: `features/copilot/plans/ARCHITECTURE.md`.
