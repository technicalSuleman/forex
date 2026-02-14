import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Settings = () => {
  return (
    <div className="max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Profile Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            <Input defaultValue="Admin User" className="bg-secondary/50 border-border h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input defaultValue="admin@trazorhub.com" className="bg-secondary/50 border-border h-9" />
          </div>
        </div>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        <div className="space-y-4">
          {["Email notifications", "Push notifications", "Trade alerts", "Withdrawal alerts"].map((label) => (
            <div key={label} className="flex items-center justify-between">
              <Label className="text-sm text-foreground">{label}</Label>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Security</h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Current Password</Label>
            <Input type="password" className="bg-secondary/50 border-border h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">New Password</Label>
            <Input type="password" className="bg-secondary/50 border-border h-9" />
          </div>
          <Button size="sm" variant="outline" className="border-border text-foreground">Update Password</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
