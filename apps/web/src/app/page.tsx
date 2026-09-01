import { ArrowRight, BarChart3, Clock, Users, Ticket, Settings } from "lucide-react";

export default function Dashboard() {
  return (
    <main className="flex-1 flex flex-col p-8 lg:p-12 max-w-7xl mx-auto w-full">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
          <p className="text-zinc-400">Welcome back. Here&apos;s an overview of your support operations.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-panel px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            System Operational
          </div>
          <button className="btn-primary px-6 py-2.5 rounded-lg flex items-center gap-2">
            New Ticket <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { title: "Open Tickets", value: "124", icon: Ticket, color: "text-blue-400", trend: "+12%" },
          { title: "Avg. Resolution Time", value: "4.2h", icon: Clock, color: "text-purple-400", trend: "-5%" },
          { title: "Active Agents", value: "18", icon: Users, color: "text-green-400", trend: "0%" },
          { title: "CSAT Score", value: "94%", icon: BarChart3, color: "text-amber-400", trend: "+2%" },
        ].map((stat, i) => (
          <div key={i} className="glass-panel rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/20">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-500/10 text-green-400' : stat.trend.startsWith('-') ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-zinc-400 font-medium">{stat.title}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Tickets</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">View All</button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300">
                    JD
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">Cannot access billing portal</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Acme Corp • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">High</span>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Open</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Quick Actions</h2>
            <Settings className="w-5 h-5 text-zinc-400" />
          </div>
          
          <div className="space-y-3">
            {[
              { label: "Manage Roles & Permissions", desc: "Configure RBAC access" },
              { label: "Customize Theme", desc: "Update tenant colors & logos" },
              { label: "Business Hours", desc: "Set operating schedules" },
              { label: "Audit Logs", desc: "Review security events" },
            ].map((action, i) => (
              <button key={i} className="w-full text-left p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
                <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{action.label}</h4>
                <p className="text-xs text-zinc-500 mt-1">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
