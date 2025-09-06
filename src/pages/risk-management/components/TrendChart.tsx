import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TrendDataPoint } from '../../../types/riskManagement';

interface TrendChartProps {
  data: TrendDataPoint[];
  title: string;
  color?: string;
  showTrend?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  color = 'blue',
  showTrend = true,
  formatValue = (value) => value.toFixed(1),
  className = ''
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-sm">No trend data available</div>
        </div>
      </div>
    );
  }

  // Calculate trend
  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const trendChange = lastValue - firstValue;
  const trendPercentage = firstValue !== 0 ? (trendChange / firstValue) * 100 : 0;

  // Get color classes
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-500',
          bgLight: 'bg-green-50',
          text: 'text-green-600',
          border: 'border-green-200'
        };
      case 'red':
        return {
          bg: 'bg-red-500',
          bgLight: 'bg-red-50',
          text: 'text-red-600',
          border: 'border-red-200'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-500',
          bgLight: 'bg-yellow-50',
          text: 'text-yellow-600',
          border: 'border-yellow-200'
        };
      case 'purple':
        return {
          bg: 'bg-purple-500',
          bgLight: 'bg-purple-50',
          text: 'text-purple-600',
          border: 'border-purple-200'
        };
      default:
        return {
          bg: 'bg-teal-500',
          bgLight: 'bg-teal-50',
          text: 'text-teal-600',
          border: 'border-teal-200'
        };
    }
  };

  const colors = getColorClasses(color);

  // Find min and max values for scaling
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  // Generate SVG path for the trend line
  const width = 300;
  const height = 120;
  const padding = 20;

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((point.value - minValue) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const pathData = `M ${points}`;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {showTrend && (
          <div className={`flex items-center space-x-1 ${colors.text}`}>
            {trendChange > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : trendChange < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {trendChange > 0 ? '+' : ''}{formatValue(trendChange)}
              {showTrend && ` (${trendPercentage > 0 ? '+' : ''}${trendPercentage.toFixed(1)}%)`}
            </span>
          </div>
        )}
      </div>

      <div className="relative">
        <svg width={width} height={height} className="w-full h-32">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Trend line */}
          <path
            d={pathData}
            fill="none"
            stroke={colors.bg.replace('bg-', '#').replace('-500', '')}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((point.value - minValue) / range) * (height - 2 * padding);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={colors.bg.replace('bg-', '#').replace('-500', '')}
                className="hover:r-4 transition-all duration-200"
              />
            );
          })}
        </svg>

        {/* Value labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{formatValue(minValue)}</span>
          <span>{formatValue(maxValue)}</span>
        </div>
      </div>

      {/* Current value */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current Value</span>
          <span className={`text-lg font-semibold ${colors.text}`}>
            {formatValue(lastValue)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrendChart;
