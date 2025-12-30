'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface ChartData {
  season: string;
  yellowCards: number;
  redCards: number;
  penalties: number;
  matches: number;
  league: string;
}

interface RefereeStatsChartProps {
  data: ChartData[];
}

export default function RefereeStatsChart({ data }: RefereeStatsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No chart data available
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cards Per Match Line Chart */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Average Cards Per Match
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="season"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f3f4f6' }}
              itemStyle={{ color: '#d1d5db' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="yellowCards"
              name="Yellow Cards"
              stroke="#eab308"
              strokeWidth={2}
              dot={{ fill: '#eab308', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="redCards"
              name="Red Cards"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="penalties"
              name="Penalties"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Matches Per Season Bar Chart */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Matches Per Season
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="season"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f3f4f6' }}
              itemStyle={{ color: '#d1d5db' }}
            />
            <Bar
              dataKey="matches"
              name="Matches"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
