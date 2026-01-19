'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface PeriodData {
  period: string;
  yellow: number;
  red: number;
  total: number;
  percent: number;
}

interface MinuteData {
  range: string;
  yellow: number;
  red: number;
  total: number;
}

interface RefereeData {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  league: string;
  firstHalf: number;
  secondHalf: number;
  injuryTime: number;
  total: number;
  earlyCards: number;
  lateCards: number;
  firstHalfPercent: number;
  lateCardPercent: number;
}

interface TimeAnalysisData {
  hasData: boolean;
  overall: {
    total: number;
    firstHalf: number;
    secondHalf: number;
    firstHalfPercent: number;
    secondHalfPercent: number;
    avgMinute: number;
  } | null;
  byPeriod: PeriodData[];
  byMinute: MinuteData[];
  referees: RefereeData[];
}

interface TimeAnalysisClientProps {
  data: TimeAnalysisData;
}


export default function TimeAnalysisClient({ data }: TimeAnalysisClientProps) {
  if (!data.hasData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-xl font-bold mb-2">Data Loading...</h2>
          <p className="text-muted-foreground">
            Card timing data is being collected from the API. Please check back later.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            This feature requires minute-by-minute card event data which is currently being fetched.
          </p>
        </CardContent>
      </Card>
    );
  }

  const halfData = [
    { name: 'First Half', value: data.overall!.firstHalf, color: '#3b82f6' },
    { name: 'Second Half', value: data.overall!.secondHalf, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{data.overall!.total}</div>
            <p className="text-sm text-muted-foreground">Total Cards Analyzed</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-500">
              {data.overall!.firstHalfPercent.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">First Half Cards</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-red-500">
              {data.overall!.secondHalfPercent.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">Second Half Cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{data.overall!.avgMinute.toFixed(0)}`</div>
            <p className="text-sm text-muted-foreground">Average Minute</p>
          </CardContent>
        </Card>
      </div>

      {/* Half Distribution Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>First Half vs Second Half</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={halfData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`}
                  >
                    {halfData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cards by 15-Minute Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={data.byPeriod}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Bar dataKey="yellow" fill="hsl(var(--yellow-card))" name="Yellow" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="red" fill="hsl(var(--red-card))" name="Red" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Minute by Minute */}
      <Card>
        <CardHeader>
          <CardTitle>Cards by 5-Minute Intervals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={data.byMinute}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="range" className="text-xs" angle={-45} textAnchor="end" height={60} />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend />
                <Bar dataKey="yellow" fill="hsl(var(--yellow-card))" name="Yellow Cards" stackId="a" />
                <Bar dataKey="red" fill="hsl(var(--red-card))" name="Red Cards" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Referee Timing Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Referee Timing Patterns</CardTitle>
          <p className="text-sm text-muted-foreground">
            How different referees distribute cards across the match
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.referees.slice(0, 15).map((referee) => (
              <div key={referee.id} className="border rounded-lg p-4 hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  {/* Photo */}
                  <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden relative shrink-0">
                    {referee.photo ? (
                      <Image src={referee.photo} alt={referee.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">
                        {referee.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/referees/${referee.slug}`}
                      className="font-semibold hover:text-primary"
                    >
                      {referee.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {referee.total} cards analyzed
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 items-center text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-500">
                        {referee.firstHalfPercent.toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">1st Half</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-500">
                        {(100 - referee.firstHalfPercent).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">2nd Half</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-orange-500">
                        {referee.lateCardPercent.toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Late (75+)</p>
                    </div>
                  </div>
                </div>

                {/* Visual bar */}
                <div className="mt-3 flex h-2 rounded-full overflow-hidden bg-muted">
                  <div
                    className="bg-blue-500"
                    style={{ width: `${referee.firstHalfPercent}%` }}
                  />
                  <div
                    className="bg-red-500"
                    style={{ width: `${100 - referee.firstHalfPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle>Timing Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>{data.overall!.secondHalfPercent > 50 ? 'Second' : 'First'} half</strong> sees more cards overall ({Math.max(data.overall!.firstHalfPercent, data.overall!.secondHalfPercent).toFixed(1)}% of total).
            </li>
            <li>
              The average card is shown in the <strong>{data.overall!.avgMinute.toFixed(0)}th minute</strong> of the match.
            </li>
            {data.referees.length > 0 && (
              <li>
                <strong>{data.referees.sort((a, b) => b.lateCardPercent - a.lateCardPercent)[0]?.name}</strong> shows the highest percentage of late cards (75+ minutes).
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
