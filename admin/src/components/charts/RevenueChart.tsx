import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", revenue: 12400 },
  { name: "Feb", revenue: 9800 },
  { name: "Mar", revenue: 15600 },
  { name: "Apr", revenue: 13200 },
  { name: "May", revenue: 17800 },
  { name: "Jun", revenue: 19200 },
  { name: "Jul", revenue: 16500 },
  { name: "Aug", revenue: 21000 },
  { name: "Sep", revenue: 18900 },
  { name: "Oct", revenue: 23400 },
  { name: "Nov", revenue: 20100 },
  { name: "Dec", revenue: 26800 },
];

const RevenueChart = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
    className="glass-card p-5"
  >
    <h3 className="text-sm font-semibold text-foreground mb-4">Revenue</h3>
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
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
        <Bar dataKey="revenue" fill="hsl(152 70% 45%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </motion.div>
);

export default RevenueChart;
