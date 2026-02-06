# Spare ML Service

FastAPI-based ML service with two main features:
1. **Food Classification** - Identify food items from images using Gemini AI
2. **Price Optimization** - Suggest optimal rescue bag prices based on multiple factors

## Features

### 1. Food Classification + Quantification
- Upload food images (JPEG, PNG)
- Get structured JSON with:
  - Type of food item
  - Quantity
  - Closest matching menu item
  - Confidence score (0-100)
- Powered by Google Gemini AI

### 2. Dynamic Price Optimization
- ML-based price recommendations
- Factors considered:
  - Time until closing
  - Historical sell-through rates
  - Competitor pricing
  - Item type (perishable/non-perishable)
- Returns optimal price with detailed reasoning

## Installation

### Prerequisites
- Python 3.9 or higher
- pip package manager

### Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure Gemini API:
   - Ensure `config.ini` has valid Gemini API key
   - File should contain:
   ```ini
   [GEMINI]
   api_key = your_api_key_here
   api_url = https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent
   ```

3. Generate mock data:
```bash
python scripts/generate_mock_data.py
```

This creates:
- `mock_data/competitor_pricing.json` - Competitor pricing data
- `mock_data/sell_through_rates.json` - Historical sell-through rates

## Running the Service

### Development Mode
```bash
uvicorn ml_service.main:app --reload --port 8000
```

### Production Mode
```bash
uvicorn ml_service.main:app --host 0.0.0.0 --port 8000
```

The service will be available at: `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "Spare ML Service"
}
```

### 1. Food Classification (JSON)

**Endpoint:** `POST /api/ml/food-classification`

**Request Body:**
```json
{
  "image_base64": "base64_encoded_image_string",
  "menu_items": ["Croissant", "Muffin", "Sandwich", "Coffee"]
}
```

**Response:**
```json
{
  "items": [
    {
      "type": "Croissant",
      "quantity": 3,
      "closest_menu_item": "Croissant",
      "confidence": 95
    },
    {
      "type": "Chocolate Muffin",
      "quantity": 2,
      "closest_menu_item": "Muffin",
      "confidence": 92
    }
  ],
  "total_items": 2,
  "processing_time_ms": 1234.56
}
```

### 2. Food Classification (File Upload)

**Endpoint:** `POST /api/ml/food-classification/upload`

**Request:** FormData
- `image`: Image file (JPEG, PNG)
- `menu_items`: (Optional) JSON string array of menu items

**Example using curl:**
```bash
curl -X POST http://localhost:8000/api/ml/food-classification/upload \
  -F "image=@path/to/image.jpg" \
  -F 'menu_items=["Croissant", "Muffin", "Sandwich"]'
```

**Response:** Same as JSON endpoint

### 3. Price Optimization

**Endpoint:** `POST /api/ml/price-optimization`

**Request Body:**
```json
{
  "merchant_id": "merchant_001",
  "time_until_closing_minutes": 90,
  "item_type": "perishable",
  "current_price": 80,
  "competitor_prices": [70, 75, 85]
}
```

**Response:**
```json
{
  "recommended_price": 65.5,
  "confidence": 0.85,
  "reasoning": {
    "time_factor": "Time urgency is high (90 minutes until closing). Recommend aggressive pricing to maximize sell-through.",
    "sell_through_impact": "Expected sell-through at recommended price: 87.3%. High sell-through rate predicted.",
    "competitor_analysis": "Average competitor price: ₹76.67. Recommended price is competitively lower to attract customers.",
    "perishability_factor": "Items are perishable. Perishable items near closing time warrant aggressive discounting."
  },
  "price_range": {
    "min": 58.95,
    "max": 72.05
  },
  "expected_sell_through": 0.873
}
```

## Testing the API

### Using Python

```python
import requests
import base64

# Test food classification
with open("images/test_img.jpeg", "rb") as f:
    image_base64 = base64.b64encode(f.read()).decode("utf-8")

response = requests.post(
    "http://localhost:8000/api/ml/food-classification",
    json={
        "image_base64": image_base64,
        "menu_items": ["Popcorn", "Nachos", "Crackers", "Juice"]
    }
)
print(response.json())

# Test price optimization
response = requests.post(
    "http://localhost:8000/api/ml/price-optimization",
    json={
        "merchant_id": "merchant_001",
        "time_until_closing_minutes": 60,
        "item_type": "perishable",
        "current_price": 70
    }
)
print(response.json())
```

### Using curl

**Food Classification:**
```bash
# Get base64 of image (Linux/Mac)
IMAGE_BASE64=$(base64 -i images/test_img.jpeg)

# Call API
curl -X POST http://localhost:8000/api/ml/food-classification \
  -H "Content-Type: application/json" \
  -d "{\"image_base64\": \"$IMAGE_BASE64\", \"menu_items\": [\"Popcorn\", \"Nachos\"]}"
```

**Price Optimization:**
```bash
curl -X POST http://localhost:8000/api/ml/price-optimization \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "merchant_001",
    "time_until_closing_minutes": 120,
    "item_type": "perishable"
  }'
```

## Interactive API Documentation

FastAPI provides interactive API documentation:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

You can test all endpoints directly from the browser!

## Project Structure

```
ml/
├── ml_service/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app
│   ├── models.py                # Pydantic data models
│   ├── food_classification.py   # Gemini AI wrapper
│   └── price_optimization.py    # Price optimization ML model
├── scripts/
│   └── generate_mock_data.py    # Mock data generator
├── mock_data/
│   ├── competitor_pricing.json
│   └── sell_through_rates.json
├── images/
│   └── test_img.jpeg            # Sample test image
├── prompts.py                   # Gemini AI prompts
├── config.ini                   # Configuration
├── requirements.txt             # Dependencies
└── README.md                    # This file
```

## Technology Stack

- **FastAPI** - Modern web framework
- **Uvicorn** - ASGI server
- **Google Gemini AI** - Food classification
- **Scikit-learn** - ML models
- **Pandas** - Data processing
- **Pydantic** - Data validation

## Error Handling

All endpoints return proper HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid input)
- `500` - Internal server error

Error response format:
```json
{
  "error": "Error message",
  "detail": "Detailed error information"
}
```

## Next Steps

### Integration with React Native
```javascript
// Food Classification
const formData = new FormData();
formData.append('image', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'photo.jpg'
});
formData.append('menu_items', JSON.stringify(['Croissant', 'Muffin']));

const response = await fetch('http://localhost:8000/api/ml/food-classification/upload', {
  method: 'POST',
  body: formData
});

// Price Optimization
const priceResponse = await fetch('http://localhost:8000/api/ml/price-optimization', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    merchant_id: 'merchant_001',
    time_until_closing_minutes: 90,
    item_type: 'perishable'
  })
});
```

### Production Deployment
1. Set up environment variables for API keys
2. Configure CORS properly (restrict origins)
3. Add authentication/authorization
4. Deploy using Docker or cloud services (AWS, GCP, Azure)
5. Set up logging and monitoring

## Troubleshooting

### Mock data not found
Run: `python scripts/generate_mock_data.py`

### Gemini API errors
- Verify API key in `config.ini`
- Check internet connection
- Ensure API quota is not exceeded

### Import errors
Install all dependencies: `pip install -r requirements.txt`

## License

Part of the Spare project - RedBrickHacks 2025
