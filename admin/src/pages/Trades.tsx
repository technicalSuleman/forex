import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Trade {
  id: number;
  user: string;
  pair: string;
  type: "Buy" | "Sell";
  amount: string;
  price: string;
  status: "Completed" | "Pending" | "Failed";
  date: string;
}

const allTrades: Trade[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  user: ["Alex Thompson", "Sarah Chen", "Mike Roberts", "Emily Davis", "John Park"][i % 5],
  pair: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "ADA/USDT"][i % 5],
  type: i % 3 === 0 ? "Sell" : "Buy",
  amount: `$${(Math.random() * 50000 + 500).toFixed(2)}`,
  price: `$${(Math.random() * 60000 + 100).toFixed(2)}`,
  status: (["Completed", "Completed", "Pending", "Completed", "Failed"] as const)[i % 5],
  date: `2026-02-${String(12 - (i % 10)).padStart(2, "0")}`,
}));

const statusColor: Record<string, string> = {
  Completed: "bg-success/10 text-success border-success/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
  Failed: "bg-destructive/10 text-destructive border-destructive/20",
};

const typeColor: Record<string, string> = {
  Buy: "text-success",
  Sell: "text-destructive",
};

const Trades = () => {
  const [pairFilter, setPairFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = allTrades.filter((t) => {
    const matchPair = pairFilter === "all" || t.pair === pairFilter;
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchSearch = t.user.toLowerCase().includes(search.toLowerCase());
    return matchPair && matchStatus && matchSearch;
  });

  const exportCSV = () => {
    const headers = "ID,User,Pair,Type,Amount,Price,Status,Date\n";
    const rows = filtered.map((t) => `${t.id},${t.user},${t.pair},${t.type},${t.amount},${t.price},${t.status},${t.date}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trades.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by user..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border h-9" />
        </div>
        <Select value={pairFilter} onValueChange={setPairFilter}>
          <SelectTrigger className="w-40 bg-secondary/50 border-border h-9">
            <SelectValue placeholder="Pair" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Pairs</SelectItem>
            <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
            <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
            <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
            <SelectItem value="XRP/USDT">XRP/USDT</SelectItem>
            <SelectItem value="ADA/USDT">ADA/USDT</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-secondary/50 border-border h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={exportCSV} variant="outline" className="h-9 border-border text-muted-foreground hover:text-foreground">
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-secondary/30">
                <th className="text-left py-3 px-4 font-medium">ID</th>
                <th className="text-left py-3 px-4 font-medium">User</th>
                <th className="text-left py-3 px-4 font-medium">Pair</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Price</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 20).map((trade) => (
                <motion.tr
                  key={trade.id}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  className="border-b border-border/50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-muted-foreground">#{trade.id}</td>
                  <td className="py-3 px-4 text-foreground">{trade.user}</td>
                  <td className="py-3 px-4 font-mono text-foreground">{trade.pair}</td>
                  <td className={`py-3 px-4 font-medium ${typeColor[trade.type]}`}>{trade.type}</td>
                  <td className="py-3 px-4 font-mono text-foreground">{trade.amount}</td>
                  <td className="py-3 px-4 font-mono text-foreground">{trade.price}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor[trade.status]}`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{trade.date}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Trades;
