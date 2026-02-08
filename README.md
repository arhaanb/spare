<p align="center">
  <img src="./assets/wordmark.svg" alt="Spare Logo" width="200"/>
</p>

<h3 align="center">Food Worth Saving</h3>

<p align="center">
A food rescue marketplace connecting surplus food from local merchants with budget-conscious consumers.
</p>

---

## The Problem

**In urban India, two realities coexist but remain disconnected:**

### For Merchants
Small and medium food establishments — bakeries, cafes, restaurants — prepare fresh food daily. By closing time, unsold items become sunk costs. A small bakery owner in Gurgaon estimates **₹40,000–₹1,00,000 of waste monthly**, representing ingredients, labor, and overhead that generate zero revenue.

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

## Our Solution

**Spare** is a surplus food rescue marketplace where merchants convert end-of-day unsold inventory into recovered revenue through discounted "Rescue Bags."

### How It Works

<table>
<tr>
<th>Merchants</th>
<th>Consumers</th>
</tr>
<tr>
<td>

1. Near closing time (60–90 min before), mark Rescue Bags as available
2. Upload photos of surplus items - AI classifies & quantifies automatically
3. Set bag types: **Regular**, **Large**, or **Make Your Own**. These are distributed and priced automatically through our distribution engine.
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

---

## Tech Architecture

<a href="https://www.figma.com/board/Xb8Gax2yGLjwoEKlD264iV/Spare-%7C-User-Flows?node-id=0-1&t=m7dd50qxlRqr9NDE-1">
  <img width="3984" height="3386" alt="image" src="https://github.com/user-attachments/assets/08856248-efb2-43a3-baf1-818921c3dc68" />
</a>


### `/mobile` — Consumer App
React Native + Expo mobile app for end consumers.

| Component | Technology |
|-----------|------------|
| Framework | React Native 0.81 + Expo 54 |
| Navigation | React Navigation 7 |
| Animations | React Native Reanimated |
| UI | Bottom Sheet, Blur effects, Skia |
| State | Context API + AsyncStorage |

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

---

### `/api` — Backend Server
Express.js REST API with MongoDB for data persistence.

**Data Models**
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

**Endpoints**

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

## User Flows

The flow is divided into teh **Consumer** and **Merchant** flow which includes onboarding, setup, and placing / receiving orders. The [FigJam can be found here](https://www.figma.com/board/Xb8Gax2yGLjwoEKlD264iV/Spare-%7C-User-Flows?node-id=0-1&t=m7dd50qxlRqr9NDE-1).

<br>

<a href="https://www.figma.com/board/Xb8Gax2yGLjwoEKlD264iV/Spare-%7C-User-Flows?node-id=0-1&t=m7dd50qxlRqr9NDE-1">
  <img width="9416" height="5318" alt="image" src="https://github.com/user-attachments/assets/16dd3cb6-b5da-455e-b307-1ff79010303b" />
</a>

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB instance
- Google Gemini API key

### Installation

```bash
# Clone repository
git clone https://github.com/arhaanb/spare.git
cd spare

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

## Team

- [Arhaan Bahadur](https://arhaanb.com)
- Hrijul Chauhan
- Siddhayak Goyal

Built for **RedBrickHacks @ Ashoka University**
