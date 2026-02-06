import json
import random
from datetime import datetime, timedelta
import os

# Create mock_data directory if it doesn't exist
os.makedirs("mock_data", exist_ok=True)

def generate_competitor_pricing_data():
    """Generate competitor pricing data for multiple merchants"""
    data = []
    merchant_ids = ["merchant_001", "merchant_002", "merchant_003"]
    
    # Generate data for the last 90 days
    start_date = datetime.now() - timedelta(days=90)
    
    for merchant_id in merchant_ids:
        for day in range(90):
            date = start_date + timedelta(days=day)
            
            # Generate multiple time windows per day
            time_windows = [
                {"window": "morning", "avg": 80, "range": 15},
                {"window": "afternoon", "avg": 70, "range": 12},
                {"window": "evening", "avg": 50, "range": 10}
            ]
            
            for tw in time_windows:
                base_price = tw["avg"] + random.uniform(-tw["range"], tw["range"])
                competitor_ids = [m for m in merchant_ids if m != merchant_id]
                
                data.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "merchant_id": merchant_id,
                    "time_window": tw["window"],
                    "competitor_merchant_ids": competitor_ids[:2],
                    "avg_price": round(base_price, 2),
                    "min_price": round(base_price * 0.8, 2),
                    "max_price": round(base_price * 1.2, 2)
                })
    
    with open("mock_data/competitor_pricing.json", "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"✓ Generated {len(data)} competitor pricing records")


def generate_sell_through_rates_data():
    """Generate historical sell-through rate data"""
    data = []
    merchant_ids = ["merchant_001", "merchant_002", "merchant_003"]
    
    # Price points to test
    price_points = [30, 40, 50, 60, 70, 80, 90, 100]
    
    # Time windows (minutes until closing)
    time_windows = [30, 60, 90, 120, 180, 240]
    
    item_types = ["perishable", "non_perishable"]
    
    for merchant_id in merchant_ids:
        for price in price_points:
            for time_window in time_windows:
                for item_type in item_types:
                    # Simulate sell-through rate based on factors:
                    # - Lower prices = higher sell-through
                    # - Less time until closing = higher sell-through for perishables
                    # - Perishables sell better at lower prices near closing
                    
                    base_rate = 1.0 - (price / 150)  # Higher price = lower rate
                    
                    # Time factor (more urgent near closing)
                    time_factor = 1.0 - (time_window / 300)
                    
                    # Perishability factor
                    if item_type == "perishable":
                        perishability_boost = 0.15 * time_factor
                        sell_through = min(0.95, base_rate + perishability_boost + random.uniform(-0.05, 0.05))
                    else:
                        sell_through = min(0.85, base_rate + random.uniform(-0.05, 0.05))
                    
                    # Ensure realistic bounds
                    sell_through = max(0.1, min(0.98, sell_through))
                    
                    data.append({
                        "merchant_id": merchant_id,
                        "price_point": price,
                        "time_until_closing_minutes": time_window,
                        "item_type": item_type,
                        "sell_through_rate": round(sell_through, 3),
                        "sample_size": random.randint(20, 100)
                    })
    
    with open("mock_data/sell_through_rates.json", "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"✓ Generated {len(data)} sell-through rate records")


if __name__ == "__main__":
    print("Generating mock data for ML service...")
    print()
    
    generate_competitor_pricing_data()
    generate_sell_through_rates_data()
    
    print()
    print("✓ Mock data generation complete!")
    print("  Files created in: mock_data/")
