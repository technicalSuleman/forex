import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", volume: 4000 },
  { name: "Feb", volume: 3200 },
  { name: "Mar", volume: 5800 },
  { name: "Apr", volume: 4900 },
  { name: "May", volume: 6200 },
  { name: "Jun", volume: 7100 },
  { name: "Jul", volume: 6500 },
  { name: "Aug", volume: 8200 },
  { name: "Sep", volume: 7800 },
  { name: "Oct", volume: 9100 },
  { name: "Nov", volume: 8600 },
  { name: "Dec", volume: 10200 },
];

const VolumeChart = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
    className="glass-card p-5"
  >
    <h3 className="text-sm font-semibold text-foreground mb-4">Trading Volume</h3>
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
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
        <Line
          type="monotone"
          dataKey="volume"
          stroke="hsl(187 85% 53%)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: "hsl(187 85% 53%)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  </motion.div>
);

export default VolumeChart;
