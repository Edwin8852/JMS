import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const MiniTrendChart = ({ data, color = "#D4A017" }) => {
  // Generate dummy trend data if none provided
  const chartData = data || [
    { value: 10 }, { value: 15 }, { value: 12 }, 
    { value: 18 }, { value: 20 }, { value: 17 }, 
    { value: 25 }, { value: 22 }, { value: 30 }
  ];

  return (
    <div className="h-8 w-16 opacity-60">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#gradient-${color.replace('#', '')})`}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MiniTrendChart;
