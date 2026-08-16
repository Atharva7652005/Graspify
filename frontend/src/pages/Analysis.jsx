import { Activity, Target, Trophy, TrendingDown, BookOpen } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function Analysis({ content, open }) {
  // Sort oldest first for the trend line
  const analyses = content
    .filter((item) => item.latestAnalysis && item.latestAnalysis.accuracy_percent !== undefined)
    .map((item) => ({ ...item.latestAnalysis, originalTitle: item.title, id: item.id, createdAt: item.createdAt }))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  const average = analyses.length 
    ? Math.round(analyses.reduce((total, item) => total + item.accuracy_percent, 0) / analyses.length) 
    : 0;

  const mastered = analyses.filter(a => a.accuracy_percent >= 80).length;

  const chartData = analyses.map((a, i) => ({
    name: `Q${i + 1}`,
    score: a.accuracy_percent,
    title: a.originalTitle,
    date: new Date(a.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }));

  const weakAreasCounts = {};
  analyses.forEach(a => {
    (a.weak_areas || []).forEach(area => {
      // Clean up string a bit for chart display
      const shortArea = area.length > 20 ? area.substring(0, 20) + "..." : area;
      weakAreasCounts[shortArea] = (weakAreasCounts[shortArea] || 0) + 1;
    });
  });
  
  const weakAreasData = Object.keys(weakAreasCounts).map(area => ({
    topic: area,
    count: weakAreasCounts[area]
  })).sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 weak areas

  return (
    <div className="max-w-5xl mx-auto py-8 px-4" style={{ minHeight: '100%' }}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
          <Activity size={20} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Analysis Overview</h1>
      </div>

      {analyses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 shadow-sm">
          <div className="flex justify-center mb-4 text-gray-300">
            <BookOpen size={48} />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No data available</h2>
          <p>Take a quiz in one of your lessons to unlock performance analytics.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Target size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Average Accuracy</p>
                <p className="text-3xl font-bold text-gray-900">{average}%</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Lessons Mastered</p>
                <p className="text-3xl font-bold text-gray-900">{mastered} <span className="text-sm font-normal text-gray-400">/ {analyses.length}</span></p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Trend Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingDown size={18} className="text-blue-500" style={{ transform: 'scaleY(-1)' }} /> 
                Performance Trend
              </h2>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                      formatter={(value, name, props) => [`${value}%`, props.payload.title]}
                    />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weak Areas Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Target size={18} className="text-orange-500" /> 
                Top Areas for Revision
              </h2>
              {weakAreasData.length > 0 ? (
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <BarChart data={weakAreasData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="topic" type="category" axisLine={false} tickLine={false} width={120} tick={{ fontSize: 11, fill: '#475569' }} />
                      <RechartsTooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`Missed in ${value} quizzes`, 'Frequency']}
                      />
                      <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm pb-8">
                  No weak areas detected yet! Keep up the good work.
                </div>
              )}
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz History</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Reverse array to show newest history first */}
            {[...analyses].reverse().map((item, i) => (
              <button 
                key={i}
                onClick={() => open(item.id)}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-left hover:border-blue-300 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.originalTitle}</h3>
                  <p className="text-xs text-gray-400 mb-2">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.weak_areas?.slice(0,2).map(area => (
                      <span key={area} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-md">Review: {area}</span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500">Score</p>
                    <p className={`text-xl font-bold ${item.accuracy_percent >= 80 ? 'text-green-600' : 'text-orange-500'}`}>{item.accuracy_percent}%</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
