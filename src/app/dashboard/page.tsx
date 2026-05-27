export default function DashboardPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-heading font-bold text-royal-blue mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/trainer" className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-100">
          <h2 className="text-xl font-heading font-semibold text-emerald-green mb-2">Trainer Studio</h2>
          <p className="text-slate-600">Create and manage learning journeys.</p>
        </a>
        <a href="/learner" className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-100">
          <h2 className="text-xl font-heading font-semibold text-plum mb-2">Learner View</h2>
          <p className="text-slate-600">Experience a module as a learner.</p>
        </a>
        <a href="/admin" className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-100">
          <h2 className="text-xl font-heading font-semibold text-slate-800 mb-2">Signals</h2>
          <p className="text-slate-600">Understand development signals.</p>
        </a>
      </div>
    </div>
  );
}
