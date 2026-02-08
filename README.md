<p align="center">
  <img src="mobile/assets/images/logoWord.png" alt="Spare Logo" width="200"/>
</p>

<h3 align="center">Food Worth Saving</h3>

<p align="center">
A food rescue marketplace connecting surplus food from local merchants with budget-conscious consumers.
</p>

---

## 🍞 The Problem

**In urban India, two realities coexist but remain disconnected:**

### For Merchants
Small and medium food establishments — bakeries, cafes, restaurants — prepare fresh food daily. By closing time, unsold items become sunk costs. A bakery owner in Gurgaon estimates **₹40,000–₹1,00,000 of waste monthly**, representing ingredients, labor, and overhead that generate zero revenue.

Current coping mechanisms are limited:
- Give to staff
- Quietly dispose
- Municipal bin dumps late at night

None of these recover value or scale.

### For Consumers
Students, interns, and early-career workers survive on **₹80–₹200/day** food budgets. They live within walking distance of quality bakeries and cafes, yet these remain aspirational rather than accessible. The irony: food being discarded nearby is often higher-quality than what they can afford.

### The Scale
- **4–7 lakh food establishments** across India
- **Tens of thousands of tonnes** of food waste daily
- Traditional platforms optimize for new full-price orders, not surplus clearance

---

## 💡 Our Solution

**Spare** is a surplus food rescue marketplace where merchants convert end-of-day unsold inventory into recovered revenue through discounted "Rescue Bags."

### How It Works

<table>
<tr>
<th>🏪 Merchants</th>
<th>📱 Consumers</th>
</tr>
<tr>
<td>

1. Near closing time (60–90 min before), mark Rescue Bags as available
2. Upload photos of surplus items — AI classifies & quantifies automatically
3. Set bag types: **Regular**, **Large**, or **Make Your Own**
4. Pack orders in provided branding and hand off during pickup window

</td>
<td>

1. Browse nearby outlets offering Rescue Bags
2. View category guarantees (Veg/Non-Veg/Jain) and pickup windows
3. Reserve and pay at discounted fixed price
4. Pick up within the stated time slot
5. Confirm collection and rate the experience

</td>
</tr>
</table>

### Key Design Choices

| Decision | Rationale |
|----------|-----------|
| **Bag system** (not individual listings) | Reduces merchant burden; avoids "advertising unsold food" perception |
| **Fixed pricing** | Simple value proposition for both sides |
| **Veg-only mode** | Essential for Indian dietary preferences |
| **Pickup only** (no delivery) | Eliminates fleet overhead for cost-sensitive consumers |
| **AI-powered classification** | Minimal merchant input; photos → structured inventory |

---

## 🏗️ Tech Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              SPARE PLATFORM                             │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│   📱 Mobile App  │  🖥️ Admin Portal │   ⚙️ API Server  │   🤖 ML Service│
│   (Consumer)     │   (Merchant)     │    (Backend)     │   (AI/Pricing)│
├──────────────────┼──────────────────┼──────────────────┼───────────────┤
│ React Native     │ Next.js 16       │ Express.js       │ FastAPI       │
│ Expo SDK 54      │ Tailwind CSS     │ MongoDB          │ Gemini AI     │
│ React Navigation │ Radix UI         │ Mongoose         │ Scikit-learn  │
│ Reanimated       │ Better-Auth      │ REST API         │ Pydantic      │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

### `/mobile` — Consumer App
React Native + Expo mobile app for end consumers.

| Component | Technology |
|-----------|------------|
| Framework | React Native 0.81 + Expo 54 |
| Navigation | React Navigation 7 |
| Animations | React Native Reanimated |
| UI | Bottom Sheet, Blur effects, Skia |
| State | Context API + AsyncStorage |

**Key Screens:**
- `HomeScreen` — Browse restaurants, filter by meal type
- `RestaurantDetailScreen` — View rescue bags, select preferences
- `CartScreen` — Review order with sustainability metrics
- `OrderConfirmationScreen` — QR code + countdown timer for pickup
- `ProfileScreen` — User stats (bags rescued, money saved, carbon offset)

---

### `/admin` — Merchant Dashboard
Next.js web portal for restaurant/bakery owners to manage surplus inventory.

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS 4 |
| Components | Radix UI primitives |
| Auth | Better-Auth |
| Icons | Lucide React |

**Features:**
- Dashboard overview
- Create/manage Rescue Bags
- Upload food photos for AI classification
- View orders and analytics

---

### `/api` — Backend Server
Express.js REST API with MongoDB for data persistence.

| Component | Technology |
|-----------|------------|
| Runtime | Node.js |
| Framework | Express.js 4 |
| Database | MongoDB + Mongoose 8 |
| Security | Helmet, CORS |
| Logging | Morgan |

**Data Models:**
- `Restaurant` — Merchant profiles and menu items
- `Order` — Consumer orders and statuses
- `Cart` — Session-based cart management
- `Favorite` — Saved restaurants
- `Stats` — User impact tracking

---

### `/ml` — ML Service
Python FastAPI service for AI-powered features.

| Component | Technology |
|-----------|------------|
| Framework | FastAPI + Uvicorn |
| AI | Google Gemini API |
| ML | Scikit-learn |
| Validation | Pydantic |

**Endpoints:**

| Endpoint | Function |
|----------|----------|
| `POST /api/ml/food-classification` | Identify food items from images |
| `POST /api/ml/price-optimization` | Dynamic pricing recommendations |

**Price Optimization Factors:**
- Time until closing
- Historical sell-through rates
- Competitor pricing
- Item perishability

---

## 📱 User Flows

### Consumer Flow

```mermaid
flowchart LR
    A[Open App] --> B[Browse Restaurants]
    B --> C[Select Restaurant]
    C --> D[Choose Diet Preference<br/>Veg / Non-Veg / Jain]
    D --> E{Select Bag Type}
    E -->|Pre-made| F[Regular or Large Bag]
    E -->|Custom| G[Make Your Own<br/>Select Items]
    F --> H[Add to Cart]
    G --> H
    H --> I[Checkout]
    I --> J[Receive QR Code]
    J --> K[Pickup at Restaurant]
    K --> L[Confirm & Rate]
```

### Merchant Flow

```mermaid
flowchart LR
    A[Login to Admin] --> B[Dashboard]
    B --> C[Near Closing Time]
    C --> D[Upload Surplus Photos]
    D --> E[AI Classifies Items]
    E --> F[Set Bag Availability]
    F --> G[Receive Orders]
    G --> H[Scan QR at Pickup]
    H --> I[Complete Handoff]
```

---

## 🌱 Impact Metrics

### For Merchants
- Average monthly INR recovered
- Daily surplus sold vs. discarded ratio
- Repeat participation rate
- Cross-selling opportunities

### For Consumers
- Pickup frequency
- Satisfaction rate (price, value, freshness)

### Platform Health
- Average user rating
- Vendor listing/delisting rate
- Time-to-clear metrics
- Total food rescued (kg)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB instance
- Google Gemini API key

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/spare-admin.git
cd spare-admin

# Mobile App
cd mobile
npm install
npm run start

# Admin Dashboard
cd ../admin
npm install
npm run dev

# API Server
cd ../api
npm install
npm run dev

# ML Service
cd ../ml
pip install -r requirements.txt
uvicorn ml_service.main:app --reload --port 8000
```

### Environment Configuration

**`/api/.env`**
```
MONGODB_URI=mongodb://localhost:27017/spare
PORT=3000
```

**`/ml/config.ini`**
```ini
[GEMINI]
api_key = your_gemini_api_key
api_url = https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent
```

---

## 📂 Repository Structure

```
spare-admin/
├── mobile/          # React Native consumer app
│   ├── src/
│   │   ├── screens/       # App screens
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # State management
│   │   └── api/           # API client
│   └── assets/            # Images and fonts
│
├── admin/           # Next.js merchant dashboard
│   └── src/
│       ├── app/           # App router pages
│       ├── components/    # UI components
│       └── lib/           # Utilities
│
├── api/             # Express.js backend
│   └── src/
│       ├── models/        # Mongoose schemas
│       ├── routes/        # API endpoints
│       └── config/        # Database config
│
└── ml/              # FastAPI ML service
    ├── ml_service/        # Core service code
    ├── scripts/           # Data generation
    └── mock_data/         # Test data
```

---

## 👥 Team

Built for **RedBrickHacks @ Ashoka University**

---

## 📄 License

This project was created as a hackathon submission for RedBrickHacks 2025.
