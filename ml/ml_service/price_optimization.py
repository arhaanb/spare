import json
import numpy as np
import pandas as pd
from typing import List, Optional
from sklearn.ensemble import GradientBoostingRegressor
from .models import PriceOptimizationResponse, PriceReasoning, PriceRange


class PriceOptimizer:
    def __init__(self):
        """Initialize price optimizer with pre-trained model"""
        self.model = None
        self.sell_through_data = None
        self.competitor_pricing_data = None
        self._load_data()
        self._train_model()
    
    def _load_data(self):
        """Load mock data for training"""
        try:
            with open("mock_data/sell_through_rates.json", "r") as f:
                self.sell_through_data = pd.DataFrame(json.load(f))
            
            with open("mock_data/competitor_pricing.json", "r") as f:
                self.competitor_pricing_data = pd.DataFrame(json.load(f))
        except FileNotFoundError:
            raise Exception("Mock data not found. Please run: python scripts/generate_mock_data.py")
    
    def _train_model(self):
        """Train gradient boosting model on historical sell-through data"""
        # Prepare features
        X = self.sell_through_data[[
            'price_point',
            'time_until_closing_minutes'
        ]].copy()
        
        # Add item type encoding (perishable=1, non_perishable=0)
        X['is_perishable'] = (self.sell_through_data['item_type'] == 'perishable').astype(int)
        
        # Target: sell-through rate
        y = self.sell_through_data['sell_through_rate']
        
        # Train model
        self.model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=4,
            random_state=42
        )
        self.model.fit(X, y)
    
    def _get_competitor_avg_price(self, merchant_id: str, competitor_prices: Optional[List[float]] = None) -> float:
        """Get average competitor price"""
        if competitor_prices:
            return np.mean(competitor_prices)
        
        # Use mock data
        merchant_data = self.competitor_pricing_data[
            self.competitor_pricing_data['merchant_id'] == merchant_id
        ]
        
        if len(merchant_data) > 0:
            return merchant_data['avg_price'].mean()
        
        # Default fallback
        return 60.0
    
    def _predict_sell_through(self, price: float, time_until_closing: int, is_perishable: bool) -> float:
        """Predict sell-through rate for given parameters"""
        features = pd.DataFrame({
            'price_point': [price],
            'time_until_closing_minutes': [time_until_closing],
            'is_perishable': [1 if is_perishable else 0]
        })
        
        prediction = self.model.predict(features)[0]
        return max(0.0, min(1.0, prediction))  # Clamp between 0 and 1
    
    def _find_optimal_price(
        self,
        time_until_closing: int,
        is_perishable: bool,
        competitor_avg: float,
        current_price: Optional[float] = None
    ) -> tuple[float, float]:
        """
        Find optimal price that maximizes expected revenue
        
        Returns: (optimal_price, expected_sell_through)
        """
        # Define price range to search
        min_price = max(20, competitor_avg * 0.5)
        max_price = min(120, competitor_avg * 1.3)
        
        # Test different prices
        prices = np.linspace(min_price, max_price, 30)
        best_price = None
        best_revenue = 0
        best_sell_through = 0
        
        for price in prices:
            sell_through = self._predict_sell_through(price, time_until_closing, is_perishable)
            expected_revenue = price * sell_through
            
            if expected_revenue > best_revenue:
                best_revenue = expected_revenue
                best_price = price
                best_sell_through = sell_through
        
        # If current price is provided, consider it
        if current_price:
            current_sell_through = self._predict_sell_through(current_price, time_until_closing, is_perishable)
            current_revenue = current_price * current_sell_through
            
            # Only recommend change if improvement is significant (>5%)
            if best_revenue < current_revenue * 1.05:
                return current_price, current_sell_through
        
        return best_price, best_sell_through
    
    def optimize_price(
        self,
        merchant_id: str,
        time_until_closing_minutes: int,
        item_type: str,
        current_price: Optional[float] = None,
        competitor_prices: Optional[List[float]] = None
    ) -> PriceOptimizationResponse:
        """
        Optimize rescue bag price based on multiple factors
        
        Args:
            merchant_id: Merchant identifier
            time_until_closing_minutes: Minutes until store closing
            item_type: "perishable" or "non_perishable"
            current_price: Current price (optional)
            competitor_prices: List of competitor prices (optional)
            
        Returns:
            PriceOptimizationResponse with recommendation
        """
        is_perishable = item_type == "perishable"
        
        # Get competitor pricing
        competitor_avg = self._get_competitor_avg_price(merchant_id, competitor_prices)
        
        # Find optimal price
        optimal_price, expected_sell_through = self._find_optimal_price(
            time_until_closing_minutes,
            is_perishable,
            competitor_avg,
            current_price
        )
        
        # Calculate confidence based on data availability
        confidence = 0.85 if len(self.sell_through_data) > 100 else 0.70
        
        # Generate reasoning
        time_urgency = "high" if time_until_closing_minutes < 90 else "medium" if time_until_closing_minutes < 180 else "low"
        
        time_factor_text = f"Time urgency is {time_urgency} ({time_until_closing_minutes} minutes until closing). "
        if time_until_closing_minutes < 60:
            time_factor_text += "Recommend aggressive pricing to maximize sell-through."
        elif time_until_closing_minutes < 180:
            time_factor_text += "Moderate pricing recommended to balance revenue and sell-through."
        else:
            time_factor_text += "Premium pricing acceptable with ample time remaining."
        
        sell_through_text = f"Expected sell-through at recommended price: {expected_sell_through:.1%}. "
        if expected_sell_through > 0.8:
            sell_through_text += "High sell-through rate predicted."
        elif expected_sell_through > 0.6:
            sell_through_text += "Moderate sell-through rate predicted."
        else:
            sell_through_text += "Lower sell-through rate, but maximizes revenue."
        
        competitor_text = f"Average competitor price: ₹{competitor_avg:.2f}. "
        if optimal_price < competitor_avg * 0.85:
            competitor_text += "Recommended price is competitively lower to attract customers."
        elif optimal_price > competitor_avg * 1.15:
            competitor_text += "Recommended price is premium but justified by quality/timing."
        else:
            competitor_text += "Recommended price is competitive with market rates."
        
        perishability_text = f"Items are {'perishable' if is_perishable else 'non-perishable'}. "
        if is_perishable and time_until_closing_minutes < 120:
            perishability_text += "Perishable items near closing time warrant aggressive discounting."
        elif is_perishable:
            perishability_text += "Perishable items factor into pricing strategy."
        else:
            perishability_text += "Non-perishable items allow for more flexible pricing."
        
        reasoning = PriceReasoning(
            time_factor=time_factor_text,
            sell_through_impact=sell_through_text,
            competitor_analysis=competitor_text,
            perishability_factor=perishability_text
        )
        
        # Calculate price range (±10% of optimal)
        price_range = PriceRange(
            min=round(optimal_price * 0.9, 2),
            max=round(optimal_price * 1.1, 2)
        )
        
        return PriceOptimizationResponse(
            recommended_price=round(optimal_price, 2),
            confidence=confidence,
            reasoning=reasoning,
            price_range=price_range,
            expected_sell_through=round(expected_sell_through, 3)
        )


# Global optimizer instance
_optimizer = None


def get_price_optimizer() -> PriceOptimizer:
    """Get or create price optimizer singleton"""
    global _optimizer
    if _optimizer is None:
        _optimizer = PriceOptimizer()
    return _optimizer
