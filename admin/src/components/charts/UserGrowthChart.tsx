import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", users: 1200 },
  { name: "Feb", users: 1800 },
  { name: "Mar", users: 2400 },
  { name: "Apr", users: 3100 },
  { name: "May", users: 3800 },
  { name: "Jun", users: 4600 },
  { name: "Jul", users: 5200 },
  { name: "Aug", users: 6100 },
  { name: "Sep", users: 7000 },
  { name: "Oct", users: 7800 },
  { name: "Nov", users: 8500 },
  { name: "Dec", users: 9400 },
];

const UserGrowthChart = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.5 }}
    className="glass-card p-5 col-span-full"
  >
    <h3 className="text-sm font-semibold text-foreground mb-4">User Growth</h3>
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(38 92% 55%)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(38 92% 55%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 18%)" />
        <XAxis dataKey="name" stroke="hsl(215 15% 55%)" fontSize={12} />
        <YAxis stroke="hsl(215 15% 55%)" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: "hsl(220 22% 12%)",
            border: "1px solid hsl(220 16% 18%)",
            borderRadius: "8px",
            color: "hsl(210 20% 92%)",
          }}
        />
        <Area
          type="monotone"
          dataKey="users"
          stroke="hsl(38 92% 55%)"
          fill="url(#userGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  </motion.div>
);

export default UserGrowthChart;
