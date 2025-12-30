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
        <h3 id="cards-chart-heading" className="text-sm font-medium text-muted-foreground mb-4">
          Average Cards Per Match
        </h3>
        <div
          role="img"
          aria-labelledby="cards-chart-heading"
          aria-describedby="cards-chart-desc"
        >
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
        {/* Screen reader accessible data table */}
        <table id="cards-chart-desc" className="sr-only">
          <caption>Average cards per match by season</caption>
          <thead>
            <tr>
              <th scope="col">Season</th>
              <th scope="col">Yellow Cards</th>
              <th scope="col">Red Cards</th>
              <th scope="col">Penalties</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.season}>
                <td>{d.season}</td>
                <td>{d.yellowCards.toFixed(2)}</td>
                <td>{d.redCards.toFixed(2)}</td>
                <td>{d.penalties.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Matches Per Season Bar Chart */}
      <div>
        <h3 id="matches-chart-heading" className="text-sm font-medium text-muted-foreground mb-4">
          Matches Per Season
        </h3>
        <div
          role="img"
          aria-labelledby="matches-chart-heading"
          aria-describedby="matches-chart-desc"
        >
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
        {/* Screen reader accessible data table */}
        <table id="matches-chart-desc" className="sr-only">
          <caption>Matches officiated per season</caption>
          <thead>
            <tr>
              <th scope="col">Season</th>
              <th scope="col">League</th>
              <th scope="col">Matches</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.season}>
                <td>{d.season}</td>
                <td>{d.league}</td>
                <td>{d.matches}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
