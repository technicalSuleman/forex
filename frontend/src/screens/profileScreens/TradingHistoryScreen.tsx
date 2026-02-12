import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Trade {
  id: string;
  symbol?: string;
  type?: string;
  profit?: number;
  createdAt?: string;
}

interface TradingHistoryScreenProps {
  trades: Trade[];
  loading: boolean;
}

export default function TradingHistoryScreen({ trades, loading }: TradingHistoryScreenProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const getTradeTypeColor = (type?: string) => {
    if (!type) return '#888';
    return type.toUpperCase() === 'BUY' ? '#00E396' : '#FF4560';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Trading History</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2962FF" />
        </View>
      </View>
    );
  }

  if (trades.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Trading History</Text>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="chart-line" size={64} color="#333" />
          <Text style={styles.emptyText}>No Trading History</Text>
          <Text style={styles.emptySubtext}>Your trading history will appear here</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trading History</Text>
      <Text style={styles.subtitle}>{trades.length} {trades.length === 1 ? 'Trade' : 'Trades'}</Text>
      
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {trades.map((trade) => {
          const isProfit = (trade.profit || 0) >= 0;
          const profitColor = isProfit ? '#00E396' : '#FF4560';
          
          return (
            <View key={trade.id} style={styles.tradeCard}>
              <LinearGradient
                colors={isProfit 
                  ? ['rgba(0, 227, 150, 0.1)', 'rgba(0, 227, 150, 0.05)']
                  : ['rgba(255, 69, 96, 0.1)', 'rgba(255, 69, 96, 0.05)']
                }
                style={styles.tradeGradient}
              >
                <View style={styles.tradeHeader}>
                  <View style={styles.tradeLeft}>
                    <Text style={styles.tradeSymbol}>{trade.symbol || 'N/A'}</Text>
                    <View style={[styles.tradeTypeBadge, { backgroundColor: getTradeTypeColor(trade.type) + '20' }]}>
                      <Text style={[styles.tradeTypeText, { color: getTradeTypeColor(trade.type) }]}>
                        {trade.type || 'N/A'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: profitColor + '20' }]}>
                    <Text style={[styles.statusText, { color: profitColor }]}>
                      {isProfit ? 'WIN' : 'LOSS'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.tradeBody}>
                  <View>
                    <Text style={styles.profitLabel}>Profit/Loss</Text>
                    <Text style={[styles.profitValue, { color: profitColor }]}>
                      {isProfit ? '+' : ''}${(trade.profit || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.dateContainer}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color="#888" />
                    <Text style={styles.dateText}>{formatDate(trade.createdAt)}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

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
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  tradeCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#252525',
  },
  tradeGradient: {
    padding: 15,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tradeSymbol: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tradeTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tradeTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  tradeBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  profitLabel: {
    color: '#888',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  profitValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    color: '#888',
    fontSize: 12,
  },
});
