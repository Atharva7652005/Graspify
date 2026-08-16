import { Activity, Target, Trophy } from "lucide-react";

export default function Analysis({ content, open }) {
  const analyses = content.map((item) => ({ ...item.latestAnalysis, originalTitle: item.title, id: item.id })).filter((a) => a.accuracy_percent !== undefined);
  
  const average = analyses.length 
    ? Math.round(analyses.reduce((total, item) => total + item.accuracy_percent, 0) / analyses.length) 
    : 0;

  const mastered = analyses.filter(a => a.accuracy_percent >= 80).length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
          <Activity size={20} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Analysis Overview</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
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

      <h2 className="text-xl font-semibold text-gray-900 mb-4">Individual Quiz Performance</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {analyses.length ? analyses.map((item, i) => (
          <button 
            key={i}
            onClick={() => open(item.id)}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-left hover:border-blue-300 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{item.originalTitle}</h3>
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
        )) : (
           <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 shadow-sm">
             Take a quiz in one of your lessons to see your performance analysis here.
           </div>
        )}
      </div>
    </div>
  );
}
