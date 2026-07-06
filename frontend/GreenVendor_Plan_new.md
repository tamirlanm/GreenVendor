# GreenVendor — Командный план разработки (30 дней)

> B2B-платформа ESG-скоринга поставщиков · MVP/Demo версия  
> Стек: ASP.NET Core 8 + React + TypeScript + MS SQL Server + Python ML + Docker + VPS  
> Уровень: Junior+ / Pre-Middle (Dev A, Dev B) · Middle (Dev C — ML) · Команда: 3 человека

---

## Роли в команде

| | Dev A | Dev B | Dev C |
|---|---|---|---|
| **Основная зона** | Backend (ASP.NET Core) | Frontend (React + TS) | ML-сервис (Python) |
| **Общая зона** | DevOps (CI + VPS + API Docker) | DevOps (Frontend Docker + CD) | DevOps (ML Docker + CI) |
| **Инструменты** | C#, EF Core, MS SQL, xUnit | TypeScript, Vite, Tailwind, Recharts | Python, FastAPI, scikit-learn, pytest |
| **Главная задача** | Auth, Scoring, Products/Orders API | UI всех 3 ролей | Recommendation Engine для Buyer |

---

## Структура монорепозитория

```
greenvendor/                      ← один репозиторий
├── backend/                      ← ASP.NET Core 8 (Dev A)
│   ├── GreenVendor.API/
│   ├── GreenVendor.Application/
│   ├── GreenVendor.Domain/
│   ├── GreenVendor.Infrastructure/
│   ├── GreenVendor.Tests/
│   └── GreenVendor.sln
├── frontend/                     ← React + TypeScript (Dev B)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── ml-service/                   ← Python FastAPI (Dev C)
│   ├── app/
│   │   ├── main.py
│   │   ├── similarity.py
│   │   └── schemas.py
│   ├── tests/
│   │   └── test_similarity.py
│   ├── requirements.txt
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
├── docker-compose.yml             ← production
├── docker-compose.dev.yml         ← local dev
├── .env.example
├── .gitignore
└── README.md
```

---

## База данных: MS SQL Server

### Docker (dev и prod)
```yaml
db:
  image: mcr.microsoft.com/mssql/server:2022-latest
  environment:
    SA_PASSWORD: ${DB_PASSWORD}
    ACCEPT_EULA: Y
    MSSQL_PID: Developer
  ports:
    - "1433:1433"
```

### EF Core пакет
```bash
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
```

### Connection string
```json
"ConnectionStrings": {
  "Default": "Server=db,1433;Database=GreenVendor;User Id=sa;Password=${DB_PASSWORD};TrustServerCertificate=True;"
}
```

**Важный архитектурный принцип:** ML-сервис НЕ подключается к MS SQL напрямую. Он получает данные через HTTP JSON от backend — это избавляет от боли с ODBC-драйверами в Python-контейнере и держит ML stateless.

---

## Доменные модели (MVP)

### User + роли
```csharp
public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; }
    public SupplierProfile? SupplierProfile { get; set; }
    public BuyerProfile? BuyerProfile { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}

public enum UserRole { Supplier, Buyer, Admin }
```

### SupplierProfile
```csharp
public class SupplierProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public Industry Industry { get; set; }
    public string? Description { get; set; }
    public string? CertificatePath { get; set; }
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public User User { get; set; } = null!;
    public EsgScore? LatestScore { get; set; }
    public ICollection<Product> Products { get; set; } = [];
}

public enum Industry { Manufacturing, Technology, Agriculture, Construction, Logistics, Retail, Other }
```

### BuyerProfile  (НОВОЕ — даёт Buyer реальный профиль, не только роль)
```csharp
public class BuyerProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public Industry Industry { get; set; }
    public string? PreferredMinGrade { get; set; }   // "B" → фильтр каталога по умолчанию
    public DateTime CreatedAt { get; set; }
    public User User { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = [];
}
```

### Product  (НОВОЕ — товары поставщика)
```csharp
public class Product
{
    public Guid Id { get; set; }
    public Guid SupplierId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProductCategory Category { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public SupplierProfile Supplier { get; set; } = null!;
}

public enum ProductCategory { Paper, Furniture, Electronics, RawMaterials, Packaging, Other }
```

### Order  (НОВОЕ — заказы Buyer → Supplier)
```csharp
public class Order
{
    public Guid Id { get; set; }
    public Guid BuyerId { get; set; }
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }     // снапшот Price * Quantity
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Product Product { get; set; } = null!;
    public BuyerProfile Buyer { get; set; } = null!;
}

public enum OrderStatus { Pending, Confirmed, Rejected, Completed }
```

### Question / Questionnaire / EsgScore (без изменений)
```csharp
public class Question
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public QuestionCategory Category { get; set; }
    public decimal Weight { get; set; }
    public string OptionsJson { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public enum QuestionCategory { Environmental, Social, Governance }

public class EsgScore
{
    public Guid Id { get; set; }
    public Guid SupplierId { get; set; }
    public decimal Environmental { get; set; }
    public decimal Social { get; set; }
    public decimal Governance { get; set; }
    public decimal Total { get; set; }
    public string Grade { get; set; } = string.Empty;   // A/B/C/D/F
    public DateTime CalculatedAt { get; set; }
}
```

---

## Обновлённая RBAC-таблица

| Роль | Реальные задачи |
|---|---|
| **Supplier** | Анкета → ESG Score, CRUD своих Products, просмотр и подтверждение/отклонение входящих Orders |
| **Buyer** | Каталог поставщиков и товаров (фильтр по ESG Score/индустрии), **создание Order**, история своих заказов, ML-рекомендации поставщиков |
| **Admin** | Верификация поставщиков, управление вопросами анкеты, аналитика платформы (включая заказы) |

---

## API Endpoints (MVP)

### Auth `/api/auth`
| Метод | URL | Кто |
|---|---|---|
| POST | `/register` | Public |
| POST | `/login` | Public |
| POST | `/refresh` | Public |

### Suppliers `/api/suppliers`
| Метод | URL | Роль |
|---|---|---|
| GET | `/` | Buyer, Admin — каталог с фильтрами |
| GET | `/{id}` | Buyer, Admin — детальная страница + Score |
| GET/PUT | `/me` | Supplier — профиль |
| POST | `/me/certificate` | Supplier — загрузить PDF |

### Products `/api/products`  (НОВОЕ)
| Метод | URL | Роль |
|---|---|---|
| GET | `/` | Buyer — каталог товаров (фильтр категория/цена/грейд поставщика) |
| GET | `/{id}` | Buyer |
| GET | `/api/suppliers/me/products` | Supplier — свои товары |
| POST/PUT/DELETE | `/api/suppliers/me/products/{id}` | Supplier — CRUD |

### Orders `/api/orders`  (НОВОЕ)
| Метод | URL | Роль |
|---|---|---|
| POST | `/` | Buyer — создать заказ |
| GET | `/my` | Buyer — история заказов |
| GET | `/api/suppliers/me/orders` | Supplier — входящие заказы |
| PATCH | `/api/suppliers/me/orders/{id}` | Supplier — подтвердить/отклонить |

### Buyers `/api/buyers`  (НОВОЕ)
| Метод | URL | Роль |
|---|---|---|
| GET/PUT | `/me` | Buyer — профиль, включая `PreferredMinGrade` |
| GET | `/me/recommendations` | Buyer — proxy к ML-сервису Dev C |

### Questionnaire `/api/questionnaire`
| Метод | URL | Роль |
|---|---|---|
| GET | `/questions` | Supplier |
| GET | `/my` | Supplier |
| POST | `/submit` | Supplier — отправить + получить Score |

### Admin `/api/admin`
| Метод | URL | Описание |
|---|---|---|
| GET | `/suppliers` | Все поставщики |
| PATCH | `/suppliers/{id}/verify` | Верифицировать |
| GET | `/analytics` | Статистика платформы (+ заказы) |

---

## Алгоритм скоринга (Dev A, неделя 2, без изменений)

```csharp
public class EsgScoringService : IEsgScoringService
{
    public EsgScoreResult Calculate(
        IReadOnlyList<(decimal pointsEarned, decimal weight, QuestionCategory category)> answers)
    {
        var env = ScoreCategory(answers, QuestionCategory.Environmental);
        var soc = ScoreCategory(answers, QuestionCategory.Social);
        var gov = ScoreCategory(answers, QuestionCategory.Governance);
        var total = env * 0.40m + soc * 0.35m + gov * 0.25m;

        return new EsgScoreResult
        {
            Environmental = Math.Round(env, 1),
            Social        = Math.Round(soc, 1),
            Governance    = Math.Round(gov, 1),
            Total         = Math.Round(total, 1),
            Grade         = ToGrade(total)
        };
    }

    private static decimal ScoreCategory(
        IReadOnlyList<(decimal points, decimal weight, QuestionCategory cat)> answers,
        QuestionCategory category)
    {
        var filtered = answers.Where(a => a.cat == category).ToList();
        if (filtered.Count == 0) return 0m;
        var totalWeight = filtered.Sum(a => a.weight);
        var earnedScore = filtered.Sum(a => a.points * a.weight);
        return totalWeight == 0 ? 0m : earnedScore / totalWeight * 100m;
    }

    private static string ToGrade(decimal score) => score switch
    {
        >= 85 => "A", >= 70 => "B", >= 55 => "C", >= 40 => "D", _ => "F"
    };
}
```

---

## ML-сервис: Recommendation Engine (Dev C, Python)

**Идея:** Buyer получает топ-N рекомендованных поставщиков на основе cosine similarity между
вектором профиля покупателя и векторами доступных поставщиков. Не дублирует C#-алгоритм
скоринга — использует его выход (Environmental/Social/Governance/Price) как входные фичи.

### Вектор поставщика
```
[E_score, S_score, G_score, price_normalized, industry_one_hot...]
```

### app/schemas.py
```python
from pydantic import BaseModel

class SupplierVector(BaseModel):
    supplier_id: str
    environmental: float
    social: float
    governance: float
    avg_price: float
    industry: str

class RecommendRequest(BaseModel):
    buyer_preferred_min_grade: str | None = None
    buyer_past_supplier_ids: list[str] = []
    candidates: list[SupplierVector]

class RankedSupplier(BaseModel):
    supplier_id: str
    similarity_score: float
    reason: str

class RecommendResponse(BaseModel):
    recommendations: list[RankedSupplier]
```

### app/similarity.py
```python
import numpy as np

INDUSTRY_LIST = ["Manufacturing", "Technology", "Agriculture",
                  "Construction", "Logistics", "Retail", "Other"]

def to_vector(s) -> np.ndarray:
    industry_vec = [1.0 if s.industry == i else 0.0 for i in INDUSTRY_LIST]
    return np.array([s.environmental, s.social, s.governance, s.avg_price, *industry_vec])

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    return float(np.dot(a, b) / denom) if denom else 0.0

def build_buyer_vector(past_suppliers: list, all_candidates: list) -> np.ndarray:
    """Профиль покупателя = среднее векторов поставщиков, у которых уже покупал.
    Если истории нет — нейтральный вектор (среднее по всем кандидатам)."""
    pool = [s for s in all_candidates if s.supplier_id in past_suppliers] or all_candidates
    vectors = [to_vector(s) for s in pool]
    return np.mean(vectors, axis=0)

def explain(candidate, buyer_vec, vec) -> str:
    if vec[0] > buyer_vec[0]:
        return "Higher Environmental score than your usual suppliers"
    if vec[2] > buyer_vec[2]:
        return "Stronger Governance practices than your average"
    return "Good overall ESG match for your profile"
```

### app/main.py
```python
from fastapi import FastAPI
from .schemas import RecommendRequest, RecommendResponse, RankedSupplier
from .similarity import to_vector, cosine_similarity, build_buyer_vector, explain

app = FastAPI(title="GreenVendor ML Recommendation Service")

@app.post("/recommend", response_model=RecommendResponse)
def recommend(req: RecommendRequest):
    candidates = req.candidates
    if not candidates:
        return RecommendResponse(recommendations=[])

    buyer_vec = build_buyer_vector(req.buyer_past_supplier_ids, candidates)

    ranked = []
    for c in candidates:
        vec = to_vector(c)
        score = cosine_similarity(buyer_vec, vec)
        ranked.append(RankedSupplier(
            supplier_id=c.supplier_id,
            similarity_score=round(score, 3),
            reason=explain(c, buyer_vec, vec),
        ))

    ranked.sort(key=lambda r: r.similarity_score, reverse=True)
    return RecommendResponse(recommendations=ranked[:5])

@app.get("/health")
def health():
    return {"status": "ok"}
```

### tests/test_similarity.py
```python
import numpy as np
from app.similarity import cosine_similarity

def test_identical_vectors_have_similarity_one():
    v = np.array([1.0, 2.0, 3.0])
    assert abs(cosine_similarity(v, v) - 1.0) < 1e-6

def test_orthogonal_vectors_have_similarity_zero():
    a, b = np.array([1.0, 0.0]), np.array([0.0, 1.0])
    assert abs(cosine_similarity(a, b)) < 1e-6

def test_empty_vector_does_not_crash():
    z = np.array([0.0, 0.0])
    assert cosine_similarity(z, z) == 0.0
```

### Вызов из .NET (Dev A интегрирует на sync-точке)
```csharp
public interface IMlRecommendationClient
{
    Task<RecommendResult?> GetRecommendationsAsync(RecommendRequest req, CancellationToken ct);
}

public class MlRecommendationClient(HttpClient http) : IMlRecommendationClient
{
    public async Task<RecommendResult?> GetRecommendationsAsync(RecommendRequest req, CancellationToken ct)
    {
        try
        {
            var resp = await http.PostAsJsonAsync("/recommend", req, ct);
            resp.EnsureSuccessStatusCode();
            return await resp.Content.ReadFromJsonAsync<RecommendResult>(cancellationToken: ct);
        }
        catch (Exception)
        {
            return null; // ML недоступен — каталог продолжает работать без рекомендаций
        }
    }
}
```

---

## 30-дневный командный план

### Фаза 0 · Дни 1–3 · ВСЕ · Kickoff и архитектура

| Dev A | Dev B | Dev C |
|---|---|---|
| Solution (Clean Architecture) | Vite + React + TS setup | FastAPI + Docker setup |
| docker-compose.dev.yml (db + api) | MSW (Mock Service Worker) | requirements.txt, pytest setup |
| OpenAPI-контракт (все endpoints + Product/Order) | TS-типы из контракта | Контракт `/recommend` согласован с Dev A |
| .env.example, .gitignore | Tailwind + Router v6 | Синтетические данные: 10 mock-поставщиков |

**🔴 Sync Day 3:** Контракты заморожены — включая `/recommend` запрос/ответ между Dev A и Dev C.

---

### Фаза 1 · Дни 4–10 · Auth

| Dev A | Dev B | Dev C |
|---|---|---|
| EF Core + MS SQL: User, RefreshToken | Login/Register (RHF + Zod) | Реализация cosine similarity + `to_vector()` |
| JWT: register/login/refresh | AuthContext + ProtectedRoute | Юнит-тесты similarity (pytest) |
| Role-based middleware | Axios interceptor (auto-refresh) | `/recommend` endpoint на синтетических данных |
| Swagger с Bearer auth | Базовый Layout по роли | GitHub Actions: `pytest` job |

**🔴 Sync Day 10:** Auth работает end-to-end. Dev C показывает рекомендации на mock-данных (ещё не реальных).

---

### Фаза 2 · Дни 11–17 · Ядро платформы

| Dev A | Dev B | Dev C |
|---|---|---|
| Question/Questionnaire/EsgScore + миграции | Supplier Dashboard + форма анкеты | Explainability: `explain()` для каждой рекомендации |
| Seed 12 вопросов (4E+4S+4G) | Мультишаговая форма (E→S→G) | Обработка edge cases (нет истории заказов → нейтральный вектор) |
| `POST /questionnaire/submit` + EsgScoringService | Страница результата (Grade-бейдж) | Контейнеризация: `ml-service/Dockerfile` |
| **5+ юнит-тестов backend** (xUnit) | Страница профиля + загрузка PDF | Добавление `/health` endpoint |

**🔴 Sync Day 17:** Supplier flow работает полностью. Dev C готов принимать реальные ESG-векторы.

---

### Фаза 3 · Дни 18–22 · Каталог, Products/Orders, Admin, ML-интеграция

| Dev A | Dev B | Dev C |
|---|---|---|
| Product CRUD (Supplier) | Buyer: каталог поставщиков + Products | **Финальное тестирование на реальных данных** от Dev A |
| Order create/confirm/reject | Order: форма заказа + история (`/my`) | Метрики качества рекомендаций (% разнообразия топ-5) |
| `GET /buyers/me/recommendations` (proxy к ML) | Страница рекомендаций (Buyer Dashboard) | Доп. фича (если время): explainability UI-текст для Dev B |
| Admin: verify, analytics | Admin: таблица + аналитика | Финализация `requirements.txt`, README ml-service |
| **Замена MSW → реальный API** (общий шаг с Dev B) | | |

**🔴 Sync Day 22:** Все три роли + ML-рекомендации работают локально через `docker-compose.dev.yml` (db + api + frontend + ml).

---

### Фаза 4 · Дни 23–27 · DevOps

| Dev A | Dev B | Dev C |
|---|---|---|
| Dockerfile multi-stage (ASP.NET Core) | Dockerfile (Vite build → Nginx) | Финализация `ml-service/Dockerfile` |
| `docker-compose.yml` (db+api+nginx+**ml**) | `nginx.conf`: SPA + `/api/` proxy | GitHub Actions: `pytest` в общем CI |
| GitHub Actions CI: `dotnet build` + `dotnet test` | GitHub Actions CD: деплой на VPS | Проверка лимитов памяти ML-контейнера на VPS |
| Hetzner VPS setup, SSH-ключ в Secrets | CORS настройка в API | `MlService__BaseUrl` в `.env` на проде |

**🔴 Sync Day 27:** `docker compose up` на VPS поднимает все 4 контейнера (db, api, nginx+frontend, ml).

---

### Фаза 5 · Дни 28–30 · Demo-готовность

| Dev A | Dev B | Dev C |
|---|---|---|
| Seed демо-данных (10 Suppliers, 2 Buyers, 1 Admin, ~15 Products, ~10 Orders) | README.md + скриншоты | Проверка `/recommend` с реальными seed-данными на проде |
| Финальный `dotnet ef database update` на проде | Responsive полировка | Фоллбэк-тест: что происходит, если ML контейнер упал (graceful degradation) |
| Мониторинг логов всех контейнеров | Финальные E2E тесты в браузере | README ml-service: как обучалась/работает модель |

**🎯 Day 30:** Платформа живёт на публичном IP. 3 роли + ML-рекомендации работают. README со скриншотами.

---

## Docker файлы

### docker-compose.yml (production, 4 контейнера)
```yaml
services:
  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      SA_PASSWORD: ${DB_PASSWORD}
      ACCEPT_EULA: Y
      MSSQL_PID: Developer
    volumes:
      - mssql_data:/var/opt/mssql
    networks: [gv_net]
    healthcheck:
      test: /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "${DB_PASSWORD}" -Q "SELECT 1" || exit 1
      interval: 15s
      retries: 10

  api:
    build: ./backend/GreenVendor.API
    env_file: .env
    environment:
      MlService__BaseUrl: http://ml:8001
    depends_on:
      db: { condition: service_healthy }
    networks: [gv_net]

  ml:
    build: ./ml-service
    networks: [gv_net]

  nginx:
    image: nginx:1.25-alpine
    ports: ["80:80"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - frontend_dist:/usr/share/nginx/html:ro
    depends_on: [api]
    networks: [gv_net]

volumes:
  mssql_data:
  frontend_dist:

networks:
  gv_net:
```

### ml-service/Dockerfile
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/
EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### nginx.conf (без изменений)
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    location /api/ {
        proxy_pass http://api:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location /uploads/ {
        alias /app/uploads/;
    }
}
```

### GitHub Actions CI (объединённый, все три стека)
```yaml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with: { dotnet-version: '8.0.x' }
      - run: dotnet build backend/GreenVendor.sln --configuration Release
      - run: dotnet test backend/GreenVendor.sln --no-build

  ml-service:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install -r ml-service/requirements.txt
      - run: pytest ml-service/tests/
```

### GitHub Actions CD (Dev B настраивает)
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build frontend
        run: cd frontend && npm ci && npm run build
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd ~/greenvendor && git pull origin main
            docker compose build
            docker compose up -d
            docker compose exec -T api dotnet ef database update
```

---

## .env.example
```env
# MS SQL Server
DB_PASSWORD=YourStrong@Password123

# JWT
JWT_SECRET=your-super-secret-key-at-least-32-chars
JWT_ISSUER=greenvendor-api
JWT_AUDIENCE=greenvendor-client
JWT_ACCESS_EXPIRES_MINUTES=30
JWT_REFRESH_EXPIRES_DAYS=7

# ML Service
MlService__BaseUrl=http://ml:8001

# ASP.NET Core
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
```

---

## MVP чеклист (Demo Day)

### Backend (Dev A)
- [ ] JWT auth (register/login/refresh), 3 роли с RBAC
- [ ] Анкета + EsgScoringService + 5 юнит-тестов
- [ ] Product CRUD (Supplier), Order create/confirm/reject (Buyer↔Supplier)
- [ ] Каталог поставщиков и товаров с фильтрами
- [ ] Proxy-endpoint к ML-сервису с graceful fallback
- [ ] Swagger на `/api/docs`

### Frontend (Dev B)
- [ ] Login/Register (3 роли)
- [ ] Supplier: анкета, Score, CRUD товаров, входящие заказы
- [ ] Buyer: каталог, создание заказа, история заказов, страница рекомендаций
- [ ] Admin: верификация + аналитика

### ML (Dev C)
- [ ] `/recommend` endpoint с cosine similarity
- [ ] Explainability (текстовая причина рекомендации)
- [ ] pytest: минимум 3 теста на similarity-функцию
- [ ] Graceful degradation подтверждён (API работает при упавшем ML)

### DevOps (все)
- [ ] `docker-compose.yml` поднимает 4 контейнера одной командой
- [ ] GitHub Actions CI: dotnet test + pytest
- [ ] GitHub Actions CD деплоит на VPS
- [ ] Сайт живёт по публичному IP
- [ ] Нет секретов в коде

### Оформление
- [ ] README.md со скриншотами + архитектурной схемой (4 сервиса)
- [ ] .env.example в репо
- [ ] Осмысленные commit messages

---

*GreenVendor · Командный план (3 разработчика) · Июнь 2026*
