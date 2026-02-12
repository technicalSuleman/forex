import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Linking } from 'react-native';

export default function HelpScreen() {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  const helpItems = [
    {
      icon: 'help-circle',
      label: 'FAQ',
      description: 'Frequently asked questions',
      onPress: () => {},
    },
    {
      icon: 'email',
      label: 'Contact Support',
      description: 'support@forexai.com',
      onPress: () => openLink('mailto:support@forexai.com'),
    },
    {
      icon: 'file-document',
      label: 'Terms & Conditions',
      description: 'Read our terms of service',
      onPress: () => {},
    },
    {
      icon: 'shield-check',
      label: 'Privacy Policy',
      description: 'How we protect your data',
      onPress: () => {},
    },
    {
      icon: 'information',
      label: 'About App',
      description: 'Version 2.5.0',
      onPress: () => {},
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Help & Support</Text>
      <Text style={styles.subtitle}>We're here to help you</Text>

      <View style={styles.helpSection}>
        {helpItems.map((item, index) => (
          <HelpItem
            key={index}
            icon={item.icon}
            label={item.label}
            description={item.description}
            onPress={item.onPress}
            isLast={index === helpItems.length - 1}
          />
        ))}
      </View>

      <View style={styles.contactCard}>
        <MaterialCommunityIcons name="headset" size={32} color="#2962FF" />
        <Text style={styles.contactTitle}>Need More Help?</Text>
        <Text style={styles.contactText}>Our support team is available 24/7</Text>
        <TouchableOpacity style={styles.contactBtn} onPress={() => openLink('mailto:support@forexai.com')}>
          <Text style={styles.contactBtnText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

interface HelpItemProps {
  icon: string;
  label: string;
  description: string;
  onPress: () => void;
  isLast?: boolean;
}

const HelpItem = ({ icon, label, description, onPress, isLast }: HelpItemProps) => (
  <TouchableOpacity
    style={[styles.helpItem, isLast && styles.noBorder]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.itemLeft}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon} size={20} color="#2962FF" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#444" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 30,
  },
  helpSection: {
    backgroundColor: '#181818',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 30,
  },
  helpItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(41, 98, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    color: '#888',
    fontSize: 12,
  },
  contactCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
    marginBottom: 20,
  },
  contactTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },
  contactText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  contactBtn: {
    backgroundColor: '#2962FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  contactBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
