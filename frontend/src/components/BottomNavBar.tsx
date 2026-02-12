import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

interface BottomNavBarProps {
  activeRoute?: string;
}

export default function BottomNavBar({ activeRoute }: BottomNavBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { icon: 'view-grid-outline', label: 'Dash', route: '/dashboard' },
    { icon: 'chart-timeline-variant', label: 'Manual', route: '/manual-analysis' },
    { icon: 'robot-outline', label: 'AI Analysis', route: '/ai-analysis' },
    { icon: 'newspaper', label: 'News', route: '/news' },
    { icon: 'menu', label: 'Menu', route: '/settings' },
  ];

  const isActive = (route: string) => {
    if (activeRoute) {
      return activeRoute === route;
    }
    return pathname === route;
  };

  const handleNavPress = (route: string) => {
    if (!isActive(route)) {
      router.push(route);
    }
  };

  return (
    <View style={styles.bottomNavContainer}>
      <View style={styles.bottomNav}>
        {navItems.map((item, index) => {
          const active = isActive(item.route);
          return (
            <NavIcon
              key={index}
              icon={item.icon}
              label={item.label}
              active={active}
              onPress={() => handleNavPress(item.route)}
            />
          );
        })}
      </View>
    </View>
  );
}

// Nav Icon Component
const NavIcon = ({ icon, label, active, onPress }: { icon: string; label: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
    <MaterialCommunityIcons
      name={icon as any}
      size={24}
      color={active ? '#fff' : '#888'}
    />
    <Text style={[styles.navText, { color: active ? '#fff' : '#888' }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: Platform.OS === 'ios' ? 85 : 70,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#151515',
    height: Platform.OS === 'ios' ? 70 : 60,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    paddingHorizontal: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  navText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});
