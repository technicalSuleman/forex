import { Users, Activity, DollarSign, TrendingUp, Clock } from "lucide-react";
import StatCard from "@/components/cards/StatCard";
import VolumeChart from "@/components/charts/VolumeChart";
import RevenueChart from "@/components/charts/RevenueChart";
import UserGrowthChart from "@/components/charts/UserGrowthChart";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const stats = [
  { title: "Total Users", value: "24,521", change: 12.5, icon: Users },
  { title: "Active Traders", value: "8,432", change: 8.2, icon: Activity },
  { title: "Total Volume", value: "$42.8M", change: 15.3, icon: TrendingUp },
  { title: "Total Revenue", value: "$1.24M", change: -3.1, icon: DollarSign },
  { title: "Pending Withdrawals", value: "142", change: -7.8, icon: Clock },
];

const recentTrades = [
  { user: "Alex Thompson", pair: "BTC/USDT", amount: "$12,450", type: "Buy", status: "Completed", date: "2026-02-12" },
  { user: "Sarah Chen", pair: "ETH/USDT", amount: "$8,200", type: "Sell", status: "Completed", date: "2026-02-12" },
  { user: "Mike Roberts", pair: "SOL/USDT", amount: "$3,100", type: "Buy", status: "Pending", date: "2026-02-11" },
  { user: "Emily Davis", pair: "BTC/USDT", amount: "$25,000", type: "Sell", status: "Completed", date: "2026-02-11" },
  { user: "John Park", pair: "XRP/USDT", amount: "$1,800", type: "Buy", status: "Failed", date: "2026-02-11" },
  { user: "Lisa Wang", pair: "ADA/USDT", amount: "$950", type: "Sell", status: "Completed", date: "2026-02-10" },
];

const statusColor: Record<string, string> = {
  Completed: "bg-success/10 text-success border-success/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
  Failed: "bg-destructive/10 text-destructive border-destructive/20",
};

const typeColor: Record<string, string> = {
  Buy: "text-success",
  Sell: "text-destructive",
};

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.title} {...s} index={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VolumeChart />
        <RevenueChart />
        <UserGrowthChart />
      </div>

      {/* Recent Trades */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="glass-card p-5"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Trades</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-3 font-medium">User</th>
                <th className="text-left py-3 px-3 font-medium">Pair</th>
                <th className="text-left py-3 px-3 font-medium">Amount</th>
                <th className="text-left py-3 px-3 font-medium">Type</th>
                <th className="text-left py-3 px-3 font-medium">Status</th>
                <th className="text-left py-3 px-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTrades.map((trade, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-3 px-3 text-foreground">{trade.user}</td>
                  <td className="py-3 px-3 font-mono text-foreground">{trade.pair}</td>
                  <td className="py-3 px-3 font-mono text-foreground">{trade.amount}</td>
                  <td className={`py-3 px-3 font-medium ${typeColor[trade.type]}`}>{trade.type}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor[trade.status]}`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{trade.date}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
