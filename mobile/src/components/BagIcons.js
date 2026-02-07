import React from 'react';
import Svg, { Path, G, Rect, Circle } from 'react-native-svg';

// Regular Bag - Simple bag with heart
export const RegularBagIcon = ({ width = 120, height = 120, color = '#C6F04D' }) => (
  <Svg width={width} height={height} viewBox="0 0 120 120" fill="none">
    <G>
      {/* Bag body */}
      <Path
        d="M30 45 L25 100 C25 105 28 110 33 110 L87 110 C92 110 95 105 95 100 L90 45 Z"
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bag top fold */}
      <Path
        d="M25 45 L30 40 L90 40 L95 45"
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Handle */}
      <Path
        d="M42 40 C42 30 45 20 60 20 C75 20 78 30 78 40"
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Heart */}
      <Path
        d="M60 55 C55 50 45 50 45 60 C45 70 60 80 60 80 C60 80 75 70 75 60 C75 50 65 50 60 55 Z"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  </Svg>
);

// Large Bag - Bigger bag with heart, perspective view
export const LargeBagIcon = ({ width = 140, height = 140, color = '#C6F04D' }) => (
  <Svg width={width} height={height} viewBox="0 0 140 140" fill="none">
    <G>
      {/* Bag body - larger and with perspective */}
      <Path
        d="M35 50 L28 115 C28 121 32 125 38 125 L102 125 C108 125 112 121 112 115 L105 50 Z"
        stroke={color}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bag top fold */}
      <Path
        d="M28 50 L35 45 L105 45 L112 50"
        stroke={color}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left side panel */}
      <Path
        d="M35 50 L35 115"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Right side panel */}
      <Path
        d="M105 50 L105 115"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Handle */}
      <Path
        d="M48 45 C48 32 52 22 70 22 C88 22 92 32 92 45"
        stroke={color}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Heart - larger */}
      <Path
        d="M70 62 C64 56 52 56 52 68 C52 80 70 92 70 92 C70 92 88 80 88 68 C88 56 76 56 70 62 Z"
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  </Svg>
);

// Make it Yourself - Utensils (fork and spoon) diagonal
export const MakeItYourselfIcon = ({ width = 120, height = 120, color = '#C6F04D' }) => (
  <Svg width={width} height={height} viewBox="0 0 120 120" fill="none">
    <G transform="rotate(-15 60 60)">
      {/* Fork */}
      <G transform="translate(-10, 0) rotate(-10 43 60)">
        {/* Fork tines */}
        <Path
          d="M35 25 L35 50"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M43 25 L43 50"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M51 25 L51 50"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Fork handle */}
        <Path
          d="M43 50 L43 100"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Fork base connector */}
        <Path
          d="M35 48 L51 48"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </G>

      {/* Spoon */}
      <G transform="translate(10, 5) rotate(15 77 60)">
        {/* Spoon bowl */}
        <Path
          d="M77 25 C77 25 69 25 69 35 C69 45 69 48 77 48 C85 48 85 45 85 35 C85 25 77 25 77 25 Z"
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Spoon handle */}
        <Path
          d="M77 48 L77 100"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </G>
    </G>
  </Svg>
);

export default {
  RegularBagIcon,
  LargeBagIcon,
  MakeItYourselfIcon,
};
