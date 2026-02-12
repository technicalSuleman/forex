import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function LiveSignalsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
            <View style={styles.titleRow}>
                <MaterialCommunityIcons name="finance" size={26} color="#2962FF" style={{marginRight:8}} />
                <Text style={styles.mainTitle}>FOREX <Text style={styles.highlightTitle}>LIVE SIGNALS</Text></Text>
            </View>
            <View style={styles.statusPill}>
                <View style={styles.pulsingDot} />
                <Text style={styles.statusText}>MARKET OPEN</Text>
            </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* --- MAIN ROW --- */}
        <View style={styles.mainRow}>

          {/* === LEFT COLUMN (48%) === */}
          <View style={styles.column}>
            <View style={styles.columnHeader}>
                <Ionicons name="flash" size={16} color="#FFD700" />
                <Text style={styles.columnTitle}>ACTIVE TRADES</Text>
            </View>

            {/* Signal 1 */}
            <SignalCard
              pair="AUD/JPY"
              time="02m"
              entry="1.065"
              tp="2.700"
              confidence={87}
              desc="Res. Rejection"
              type="SELL"
              highlight={true}
            />

            {/* Signal 2 */}
            <SignalCard
              pair="GBP/USD"
              time="05m"
              entry="1.242"
              tp="1.265"
              confidence={92}
              desc="Flag Breakout"
              type="BUY"
            />

             {/* Signal 3 */}
            <SignalCard
              pair="EUR/CAD"
              time="12m"
              entry="1.450"
              tp="1.425"
              confidence={78}
              desc="Support Broken"
              type="SELL"
            />
            
            {/* Signal 4 */}
            <SignalCard
              pair="XAU/USD"
              time="18m"
              entry="2035"
              tp="2050"
              confidence={81}
              desc="Gold Momentum"
              type="BUY"
            />
          </View>

          {/* === RIGHT COLUMN (48%) === */}
          <View style={styles.column}>
            
            {/* HISTORY LIST */}
            <View style={styles.rightSection}>
                <Text style={styles.columnTitle}>HISTORY</Text>
                <View style={styles.historyBox}>
                  <HistoryRow pair="EUR/JPY" result="WIN" profit="+45" />
                  <HistoryRow pair="USD/CAD" result="WIN" profit="+30" />
                  <HistoryRow pair="GBP/JPY" result="LOSS" profit="-15" />
                  <HistoryRow pair="XRP/USD" result="WIN" profit="+120" />
                  <HistoryRow pair="BTC/USD" result="WIN" profit="+850" />
                  <HistoryRow pair="ETH/USD" result="WIN" profit="+40" />
                  <HistoryRow pair="AUD/USD" result="LOSS" profit="-20" />
                  <HistoryRow pair="SOL/USD" result="WIN" profit="+15" />
                </View>
            </View>

            {/* HIGH VOLATILITY CARD (Flexible to fill remaining space) */}
            <View style={{flex: 1}}>
                <LinearGradient
                    colors={['rgba(20, 20, 20, 1)', 'rgba(30, 10, 10, 1)']}
                    style={styles.highVolCard}
                >
                    <View style={styles.volHeader}>
                        <Ionicons name="warning-outline" size={18} color="#FF4560" />
                        <Text style={styles.volTitle}>HIGH VOLATILITY</Text>
                    </View>

                    <View style={styles.riskCompactRow}>
                       <Text style={styles.riskLevelText}>Risk: 95%</Text>
                       <View style={styles.progressBarBg}>
                          <LinearGradient
                              colors={['#FF4560', '#FF0000']}
                              start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                              style={[styles.progressBarFill, {width: '95%'}]} 
                          />
                       </View>
                    </View>

                    <Text style={styles.volDesc}>
                        Market unstable. AI Signals Paused.
                    </Text>

                    <TouchableOpacity style={styles.stopTradingBtn}>
                        <Text style={styles.stopBtnLabel}>STOP TRADING</Text>
                    </TouchableOpacity>

                </LinearGradient>
            </View>

          </View>

        </View>

      </ScrollView>

    </View>
  );
}

// --- COMPONENTS ---

const SignalCard = ({ pair, time, entry, tp, confidence, desc, type, highlight }) => (
  <View style={[styles.card, highlight && styles.highlightCard]}>
    <View style={styles.cardHeader}>
        <View>
            <Text style={styles.pairText}>{pair}</Text>
            <Text style={[styles.typeText, {color: type==='BUY'?'#00E396':'#FF4560'}]}>{type}</Text>
        </View>
        <View style={{alignItems:'flex-end'}}>
            <Text style={styles.timeText}>{time}</Text>
            <View style={[styles.confBadge, {borderColor: confidence > 80 ? '#00E396' : '#FF4560'}]}>
                <Text style={styles.confText}>{confidence}%</Text>
            </View>
        </View>
    </View>
    <View style={styles.cardValues}>
        <View style={styles.valRow}>
            <Text style={styles.valLabel}>EP:</Text>
            <Text style={styles.valData}>{entry}</Text>
        </View>
        <View style={styles.valRow}>
            <Text style={styles.valLabel}>TP:</Text>
            <Text style={styles.valData}>{tp}</Text>
        </View>
    </View>
    <Text style={styles.descText} numberOfLines={1}>{desc}</Text>
  </View>
);

const HistoryRow = ({ pair, result, profit }) => (
  <View style={styles.histRow}>
     <Text style={styles.histPair}>{pair}</Text>
     <Text style={[styles.histResult, {color: result==='WIN'?'#00E396':'#FF4560'}]}>{result}</Text>
     <Text style={[styles.histProfit, {color: result==='WIN'?'#fff':'#aaa'}]}>{profit}</Text>
  </View>
);

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  
  // HEADER
  header: {
    paddingTop: Platform.OS === 'android' ? 45 : 55,
    paddingBottom: 15, backgroundColor: '#111', 
    borderBottomWidth: 1, borderBottomColor: '#1F1F1F',
    alignItems: 'center', elevation: 5
  },
  headerInner: { alignItems:'center' },
  titleRow: { flexDirection:'row', alignItems:'center' },
  mainTitle: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  highlightTitle: { color: '#2962FF' },
  statusPill: { flexDirection:'row', alignItems:'center', backgroundColor:'rgba(41, 98, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 5 },
  pulsingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00E396', marginRight: 6 },
  statusText: { color: '#00E396', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  content: { padding: 10, paddingBottom: 100 },

  // MAIN LAYOUT
  mainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch' }, // Stretch Ensures equal height visually
  column: { width: '49%' },

  columnHeader: { flexDirection:'row', alignItems:'center', gap:5, marginBottom:10 },
  columnTitle: { color: '#aaa', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, textTransform:'uppercase' },

  // SIGNAL CARD
  card: { backgroundColor: '#181818', borderRadius: 8, marginBottom: 8, padding: 10, borderWidth: 1, borderColor: '#252525' },
  highlightCard: { borderColor: '#2962FF', backgroundColor: '#1A1A24' },
  cardHeader: { flexDirection:'row', justifyContent:'space-between', marginBottom: 8 },
  pairText: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  typeText: { fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  timeText: { fontSize: 9, color: '#666', textAlign:'right', marginBottom:2 },
  confBadge: { borderWidth:1, borderRadius:4, paddingHorizontal:4, paddingVertical:1 },
  confText: { fontSize:9, color:'#fff', fontWeight:'bold' },
  cardValues: { flexDirection:'row', justifyContent:'space-between', marginBottom: 6, backgroundColor:'rgba(255,255,255,0.03)', padding:5, borderRadius:4 },
  valRow: { flexDirection:'row', alignItems:'center', gap:4 },
  valLabel: { fontSize: 9, color:'#888' },
  valData: { fontSize: 11, fontWeight:'bold', color:'#fff' },
  descText: { fontSize: 9, color: '#888', fontStyle:'italic' },

  // HISTORY
  rightSection: { marginBottom: 10 },
  historyBox: { backgroundColor: '#181818', borderRadius: 8, padding: 10, borderWidth:1, borderColor:'#252525' },
  histRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#252525' },
  histPair: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  histResult: { fontSize: 10, fontWeight: 'bold' },
  histProfit: { fontSize: 10, fontWeight: 'bold', minWidth: 25, textAlign:'right' },

  // --- HIGH VOLATILITY CARD (Fills Remaining Space) ---
  highVolCard: {
    flex: 1, // Grow to fill space
    borderRadius: 12, padding: 10, borderWidth: 1.5, borderColor: '#FF4560',
    marginTop: 0, alignItems: 'center', justifyContent: 'center', // Centered Content
    shadowColor: '#FF4560', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
    minHeight: 120 // Minimum height safety
  },
  volHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  volTitle: { color: '#FF4560', fontSize: 12, fontWeight: 'bold', marginLeft: 5, letterSpacing: 1 },
  
  riskCompactRow: { flexDirection: 'row', alignItems:'center', width:'100%', marginBottom: 10, justifyContent: 'space-between' },
  riskLevelText: { color: '#aaa', fontSize: 10, marginRight: 5 },
  progressBarBg: { flex: 1, height: 4, backgroundColor: '#333', borderRadius: 3 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  
  volDesc: { color: '#ccc', fontSize: 9, textAlign: 'center', marginBottom: 12 },
  
  stopTradingBtn: { backgroundColor: '#FF4560', paddingVertical: 8, width: '100%', borderRadius: 6, alignItems: 'center' },
  stopBtnLabel: { color: '#fff', fontWeight: 'bold', fontSize: 10, letterSpacing: 1 },
});
