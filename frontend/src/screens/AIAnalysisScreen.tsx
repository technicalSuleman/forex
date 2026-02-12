import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';

const { width } = Dimensions.get('window');

export default function AIAnalysisScreen() {
  
  // --- MOCK DATA ---
  const signals = [
    {
      id: 1,
      pair: 'AUD/JPY',
      time: '2m ago',
      entry: '1.06',
      tp: '2.7',
      confidence: 87,
      desc: 'Resistance Rejection @ 1.0850. MACD Bearish Crossover.',
      highlight: false, 
      type: 'SELL'
    },
    {
      id: 2,
      pair: 'EUR/USD',
      time: '5m ago',
      entry: '1.0850',
      tp: '1.0920',
      confidence: 92,
      desc: 'Strong Support Level. RSI Oversold Condition.',
      highlight: true, // Highlighted with Blue Border
      type: 'BUY'
    },
    {
      id: 3,
      pair: 'GBP/USD',
      time: '8m ago',
      entry: '1.2650',
      tp: '1.2800',
      confidence: 78,
      desc: 'Trend Reversal. Fib Retracement 61%.',
      highlight: false,
      type: 'BUY'
    },
    {
      id: 4,
      pair: 'XAU/USD',
      time: '12m ago',
      entry: '2035',
      tp: '2050',
      confidence: 85,
      desc: 'Golden Cross. Bullish Divergence.',
      highlight: false,
      type: 'BUY'
    },
  ];

  const recentSignals = [
    { pair: 'EUR/JPY', time: '1m', type: 'SELL', color: '#FF4560' }, 
    { pair: 'EUR/USD', time: '5m', type: 'BUY', color: '#00E396' },
    { pair: 'GBP/USD', time: '1m', type: 'BUY', color: '#00E396' },
    { pair: 'XAU/USD', time: '1m', type: 'SELL', color: '#FF4560' },
    { pair: 'BTC/USD', time: '15m', type: 'BUY', color: '#00E396' },
    { pair: 'ETH/USD', time: '20m', type: 'SELL', color: '#FF4560' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
           <MaterialCommunityIcons name="robot-excited-outline" size={22} color="#2962FF" style={{marginRight: 8}} />
           <Text style={styles.headerTitle}>AI ANALYSIS</Text>
        </View>
        <Text style={styles.headerSubtitle}>Real Time Insights</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.mainRow}>
            
            {/* --- LEFT COLUMN (68%) - AI SIGNALS --- */}
            <View style={styles.leftColumn}>
                
                {/* AI Cards Loop */}
                {signals.map((item) => (
                    <View key={item.id} style={[styles.cardContainer, item.highlight && styles.highlightBorder]}>
                        
                        {/* Left Side: Info & Meter (60% of Card) */}
                        <View style={styles.cardLeft}>
                            {/* Header: Pair & Time */}
                            <View style={styles.cardLeftHeader}>
                                <Text style={styles.pairText}>{item.pair}</Text>
                                <Text style={styles.timeText}>{item.time}</Text>
                            </View>

                            {/* Middle: Stats & Meter */}
                            <View style={styles.cardLeftBody}>
                                <View>
                                    <Text style={styles.statLabel}>Entry: <Text style={styles.statValue}>{item.entry}</Text></Text>
                                    <Text style={styles.statLabel}>TP: <Text style={styles.statValue}>{item.tp}</Text></Text>
                                </View>
                                
                                {/* Confidence Meter */}
                                <View style={styles.meterBox}>
                                    <View style={[styles.meterCircle, { borderColor: item.confidence > 80 ? '#00E396' : '#2962FF' }]}>
                                        <Text style={styles.meterText}>{item.confidence}%</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Right Side: Description (40% of Card) */}
                        <View style={styles.cardRight}>
                            <Text style={styles.descTitle}>Signal Insight</Text>
                            <Text style={styles.descText} numberOfLines={4}>
                                {item.desc}
                            </Text>
                            {/* Type Badge at bottom right */}
                            <View style={[styles.typeBadgeAbs, {backgroundColor: item.type==='BUY'?'#00E396':'#FF4560'}]}>
                                <Text style={styles.typeTextAbs}>{item.type}</Text>
                            </View>
                        </View>

                    </View>
                ))}

            </View>


            {/* --- RIGHT COLUMN (30%) - RECENT + WARNING --- */}
            <View style={styles.rightColumn}>
                
                <Text style={styles.columnHeaderTitle}>RECENT</Text>

                {recentSignals.map((item, index) => (
                    <TouchableOpacity key={index} style={[styles.recentPill, {backgroundColor: item.color}]}>
                        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                            <Text style={styles.recentPair}>{item.pair}</Text>
                            <Text style={styles.recentTime}>{item.time}</Text>
                        </View>
                        <Text style={styles.recentType}>{item.type}</Text>
                    </TouchableOpacity>
                ))}

                {/* HIGH VOLATILITY CARD */}
                <LinearGradient 
                    colors={['#1F0A0A', '#000000']} 
                    style={styles.volatilityCard}
                >
                    <Ionicons name="warning-outline" size={20} color="#FF4560" style={{marginBottom: 4}} />
                    <Text style={styles.warningTitle}>HIGH VOLATILITY</Text>
                    <View style={styles.redBar} />
                    <Text style={styles.warningText}>Market Unstable</Text>
                </LinearGradient>

            </View>

        </View>

        <View style={{height: 100}} /> 
      </ScrollView>

       <BottomNavBar activeRoute="/ai-analysis" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },

  // HEADER
  header: {
    paddingTop: Platform.OS === 'android' ? 45 : 55,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  headerSubtitle: { color: '#666', fontSize: 10 },

  scrollContent: { padding: 10 },
  mainRow: { flexDirection: 'row', justifyContent: 'space-between' },

  // --- COLUMNS ---
  leftColumn: { width: '68%' },
  rightColumn: { width: '30%' },
  columnHeaderTitle: { color: '#888', fontSize: 10, fontWeight:'bold', marginBottom: 8, textAlign:'right' },

  // --- AI CARD (Two Tone) ---
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    minHeight: 85,
    elevation: 2,
  },
  highlightBorder: {
    borderWidth: 1,
    borderColor: '#2962FF'
  },

  // LEFT SIDE OF CARD
  cardLeft: {
    flex: 1.8, // 60% Width
    padding: 8,
    justifyContent: 'space-between'
  },
  cardLeftHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4
  },
  pairText: { fontSize: 13, fontWeight: '900', color: '#fff' },
  timeText: { fontSize: 9, color: '#888' },
  
  cardLeftBody: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  statLabel: { fontSize: 8, color: '#888', marginBottom: 2 },
  statValue: { color: '#fff', fontWeight: 'bold' },

  // METER
  meterBox: { justifyContent: 'center', alignItems: 'center' },
  meterCircle: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 3, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  meterText: { fontSize: 9, fontWeight: 'bold', color: '#fff' },

  // RIGHT SIDE OF CARD (Description)
  cardRight: {
    flex: 1.2, // 40% Width
    backgroundColor: '#222', // Slightly lighter/different bg
    padding: 6,
    borderLeftWidth: 1,
    borderLeftColor: '#333',
    justifyContent: 'center',
    position: 'relative'
  },
  descTitle: { fontSize: 8, fontWeight: 'bold', color: '#aaa', marginBottom: 2 },
  descText: { fontSize: 8, color: '#666', lineHeight: 10 },
  
  // Floating Type Badge
  typeBadgeAbs: {
    position: 'absolute', bottom: 4, right: 4,
    paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3
  },
  typeTextAbs: { fontSize: 7, fontWeight: 'bold', color: '#000' },


  // --- RECENT SIGNALS (Pills) ---
  recentPill: {
    padding: 6, borderRadius: 4, marginBottom: 6,
    justifyContent: 'center'
  },
  recentPair: { fontSize: 9, fontWeight: 'bold', color: '#fff' },
  recentTime: { fontSize: 8, color: 'rgba(255,255,255,0.8)' },
  recentType: { fontSize: 8, fontWeight: 'bold', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', marginTop: 2 },

  // --- VOLATILITY CARD ---
  volatilityCard: {
    borderRadius: 6, padding: 10,
    borderWidth: 1, borderColor: '#FF4560',
    alignItems: 'center', marginTop: 10,
    shadowColor: '#FF4560', shadowOpacity: 0.3, shadowRadius: 5
  },
  warningTitle: { color: '#FF4560', fontSize: 9, fontWeight: '900', textAlign: 'center' },
  redBar: { width: 20, height: 2, backgroundColor: '#FF4560', marginVertical: 4 },
  warningText: { color: '#ccc', fontSize: 8, textAlign: 'center' }

});