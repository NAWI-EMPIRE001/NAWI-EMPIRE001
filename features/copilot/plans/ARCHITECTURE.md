flowchart LR
  %% Clients & Edge
  subgraph CLIENTS["Clients"]
    Browser[Web App<br/>(Browser / SPA)]
    Mobile[Mobile App]
  end

  subgraph EDGE["Edge / Delivery"]
    CDN[CDN / Edge Network]
    WAF[WAF / DDoS Protection]
  end

  Browser -->|https| CDN
  Mobile -->|https| CDN
  CDN --> WAF

  %% API Layer
  subgraph API["API / Ingress"]
    APIGW[API Gateway / Load Balancer]
    AuthProxy[Auth Proxy<br/>JWT / OAuth / Node Handshake]
    WSGateway[WebSocket Gateway<br/>Socket.io Engine]
  end
  WAF --> APIGW
  WAF --> WSGateway
  APIGW --> AuthProxy

  %% Frontend & Gateway
  subgraph FRONTEND["Frontend Core"]
    FrontendSvc[Frontend Service / SPA Backend]
  end
  AuthProxy --> FrontendSvc

  %% Core Application Services
  subgraph SERVICES["Application Services"]
    PlansSvc[Plans Service<br/>(Feature Domain)]
    CopilotSvc[Copilot AI Service<br/>(Assistant / ML Insights)]
    UsersSvc[User / Profile Service]
    BillingSvc[Billing & Liquidity Engine]
    MediaSvc[Media Processing Service<br/>Uploads & Transcoding]
    Worker[Background Workers / Jobs]
  end

  APIGW --> PlansSvc
  APIGW --> CopilotSvc
  APIGW --> UsersSvc
  APIGW --> BillingSvc
  APIGW --> MediaSvc

  WSGateway <-->|Real-time Sync| PlansSvc
  FrontendSvc --> PlansSvc
  PlansSvc --> CopilotSvc
  PlansSvc --> BillingSvc
  PlansSvc --> UsersSvc
  CopilotSvc -->|async| Worker
  MediaSvc -->|async| Worker

  %% Data & Integrations Layer
  subgraph DATA["Data & Storage Engine"]
    PlansDB[(Plans DB<br/>Relational)]
    UsersDB[(Users DB<br/>NoSQL / Core)]
    BillingDB[(Billing / Ledger DB)]
    Cache[(Redis Cache)]
    ObjectStore[(Object Storage<br/>S3 / Cloudinary)]
    EventBus[(Event Bus / Kafka)]
    MLStore[(Vector DB / Feature Store)]
  end

  PlansSvc --> PlansDB
  UsersSvc --> UsersDB
  BillingSvc --> BillingDB
  PlansSvc --> Cache
  CopilotSvc --> MLStore
  MediaSvc --> ObjectStore
  Worker --> EventBus
  EventBus --> PlansSvc

  %% Observability & Infra
  subgraph INFRA["Infra & Observability"]
    Prom[Metrics / Prometheus]
    Tracing[Distributed Tracing]
    Logs[Centralized Logging]
    CICD[CI/CD / GitOps Engine]
  end

  %% Connected service metrics explicitly to fix rendering error
  PlansSvc & CopilotSvc & UsersSvc & BillingSvc & MediaSvc --> Prom
  PlansSvc & CopilotSvc & UsersSvc & BillingSvc & MediaSvc --> Tracing
  PlansSvc & CopilotSvc & UsersSvc & BillingSvc & MediaSvc --> Logs
  Worker --> Logs
  CICD --> FrontendSvc
  CICD --> SERVICES

  %% External integrations
  subgraph EXTERNAL["External / 3rd-Party Providers"]
    PaymentGateway[Payment Gateway / Escrow API]
    AuthProvider[OAuth / Identity Provider]
    MLProvider[Large Model API / LLM Engine]
  end

  BillingSvc --> PaymentGateway
  AuthProxy --> AuthProvider
  CopilotSvc --> MLProvider
