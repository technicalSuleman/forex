import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';

const { width, height } = Dimensions.get('window');
const CHART_HEIGHT = height * 0.65; // Chart screen ka 65% area lega

// --- TRADINGVIEW COLORS ---
const COLORS = {
  bg: '#000000',
  card: '#131722',
  text: '#D1D4DC',
  green: '#089981', // TradingView Green
  red: '#F23645',   // TradingView Red
  grid: '#2A2E39',
  crosshair: '#787B86'
};

// --- 1. DATA GENERATOR (Random Walk) ---
const generateHistory = (count) => {
  let data = [];
  let prevClose = 1950.00; // Gold/XAU Price example
  
  for (let i = 0; i < count; i++) {
    const move = (Math.random() - 0.5) * 5; 
    const open = prevClose;
    const close = open + move;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;

    data.push({
      id: i,
      open, close, high, low,
      isGreen: close > open
    });
    prevClose = close;
  }
  return data;
};

export default function ManualAnalysisScreen() {
  const router = useRouter();
  const scrollViewRef = useRef(null);

  // --- STATE ---
  const idCounterRef = useRef(1000); // Ensures unique IDs for new candles
  const [history, setHistory] = useState(generateHistory(40)); 
  const [liveCandle, setLiveCandle] = useState({
     open: 1950, close: 1950, high: 1950, low: 1950
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');

  // --- 2. LIVE TICKER SIMULATION ---
  useEffect(() => {
    const interval = setInterval(() => {
      const volatility = (Math.random() - 0.5) * 1.5; // Fast movement
      
      setLiveCandle(prev => {
        const newClose = prev.close + volatility;
        const next = {
          ...prev,
          close: newClose,
          high: Math.max(prev.high, newClose),
          low: Math.min(prev.low, newClose)
        };
        if (Math.random() > 0.95) {
          idCounterRef.current += 1;
          const finished = { ...next, id: idCounterRef.current, isGreen: next.close > next.open };
          setHistory(h => [...h.slice(1), finished]);
          return { open: newClose, close: newClose, high: newClose, low: newClose };
        }
        return next;
      });
    }, 200); // 200ms update speed

    return () => clearInterval(interval);
  }, []);

  // Auto Scroll to end
  useEffect(() => {
     scrollViewRef.current?.scrollToEnd({ animated: false });
  }, [history]);

  // --- 3. SCALE CALCULATIONS ---
  const allData = [...history, liveCandle];
  const allHighs = allData.map(c => c.high);
  const allLows = allData.map(c => c.low);
  const maxPrice = Math.max(...allHighs);
  const minPrice = Math.min(...allLows);
  const range = maxPrice - minPrice || 1;

  const getY = (price) => {
    const percentage = (price - minPrice) / range;
    // Thora padding upar neeche (10%)
    return (CHART_HEIGHT * 0.9) - (percentage * (CHART_HEIGHT * 0.8)) + (CHART_HEIGHT * 0.05);
  };

  const currentPriceColor = liveCandle.close > liveCandle.open ? COLORS.green : COLORS.red;
  const percentChange = ((liveCandle.close - history[0].open) / history[0].open * 100).toFixed(2);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* --- TOP HEADER (Symbol & Price) --- */}
      <View style={styles.header}>
          <View>
            <View style={{flexDirection:'row', alignItems:'center'}}>
                <Text style={styles.symbolText}>XAUUSD</Text>
                <View style={[styles.tag, {backgroundColor: COLORS.grid}]}><Text style={styles.tagText}>FOREX</Text></View>
            </View>
            <View style={{flexDirection:'row', alignItems:'baseline', marginTop: 5}}>
                <Text style={[styles.bigPrice, {color: currentPriceColor}]}>
                    {liveCandle.close.toFixed(2)}
                </Text>
                <Text style={[styles.changeText, {color: currentPriceColor}]}>
                    {percentChange}%
                </Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
             <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
      </View>

      {/* --- MAIN CHART AREA --- */}
      <View style={styles.chartArea}>
          
          {/* FLOATING SELL/BUY BUTTONS (Overlay) */}
          <View style={styles.floatingPanel}>
             <View style={styles.floatBtnBox}>
                <Text style={[styles.floatLabel, {color: COLORS.red}]}>SELL</Text>
                <Text style={styles.floatPrice}>{(liveCandle.close - 0.5).toFixed(2)}</Text>
             </View>
             <View style={styles.floatBtnBox}>
                <Text style={[styles.floatLabel, {color: COLORS.green}]}>BUY</Text>
                <Text style={styles.floatPrice}>{(liveCandle.close + 0.5).toFixed(2)}</Text>
             </View>
          </View>

          {/* GRID LINES */}
          <View style={styles.gridContainer}>
             {[1,2,3,4].map(i => <View key={i} style={[styles.gridLine, {top: i * (CHART_HEIGHT/5)}]} />)}
          </View>

          {/* CANDLESTICKS */}
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingRight: 60}} // Space for live candle
          >
             {history.map((c, idx) => {
                 const yOpen = getY(c.open);
                 const yClose = getY(c.close);
                 const yHigh = getY(c.high);
                 const yLow = getY(c.low);
                 const color = c.isGreen ? COLORS.green : COLORS.red;
                 
                 return (
                    <View key={`candle-${c.id}-${idx}`} style={styles.candleWrapper}>
                       <View style={[styles.wick, { top: yHigh, height: Math.abs(yHigh - yLow), backgroundColor: color }]} />
                       <View style={[styles.body, { top: Math.min(yOpen, yClose), height: Math.max(1, Math.abs(yOpen - yClose)), backgroundColor: color }]} />
                    </View>
                 );
             })}

             {/* LIVE CANDLE */}
             <View key="live-candle" style={styles.candleWrapper}>
                 <View style={[styles.wick, { 
                    top: getY(liveCandle.high), 
                    height: Math.abs(getY(liveCandle.high) - getY(liveCandle.low)), 
                    backgroundColor: currentPriceColor 
                 }]} />
                 <View style={[styles.body, { 
                    top: Math.min(getY(liveCandle.open), getY(liveCandle.close)), 
                    height: Math.max(1, Math.abs(getY(liveCandle.open) - getY(liveCandle.close))), 
                    backgroundColor: currentPriceColor 
                 }]} />
                 
                 {/* DOTTED PRICE LINE (Current Price) */}
                 <View style={[styles.priceLine, {top: getY(liveCandle.close), borderColor: currentPriceColor}]}>
                    <View style={[styles.priceTag, {backgroundColor: currentPriceColor}]}>
                        <Text style={styles.priceTagText}>{liveCandle.close.toFixed(2)}</Text>
                    </View>
                 </View>
             </View>
          </ScrollView>

          {/* RIGHT SCALE (Y-Axis) */}
          <View style={styles.rightScale}>
              <Text style={styles.scaleText}>{maxPrice.toFixed(1)}</Text>
              <Text style={styles.scaleText}>{((maxPrice+minPrice)/2).toFixed(1)}</Text>
              <Text style={styles.scaleText}>{minPrice.toFixed(1)}</Text>
          </View>
      </View>

      {/* --- TIMEFRAME SELECTOR --- */}
      <View style={styles.timeframeBar}>
         {['1m', '5m', '15m', '1H', '4H', '1D'].map((tf) => (
             <TouchableOpacity key={tf} onPress={() => setSelectedTimeframe(tf)} style={[styles.tfBtn, selectedTimeframe === tf && styles.tfBtnActive]}>
                 <Text style={[styles.tfText, selectedTimeframe === tf && styles.tfTextActive]}>{tf}</Text>
             </TouchableOpacity>
         ))}
         <View style={styles.vertLine} />
         <TouchableOpacity style={styles.iconBtn}><MaterialCommunityIcons name="pencil-outline" size={20} color="#888" /></TouchableOpacity>
         <TouchableOpacity style={styles.iconBtn}><MaterialCommunityIcons name="cog-outline" size={20} color="#888" /></TouchableOpacity>
      </View>

      {/* --- BOTTOM NAV --- */}
      <BottomNavBar activeRoute="/manual-analysis" />
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // HEADER
  header: {
     flexDirection: 'row', justifyContent:'space-between', alignItems:'flex-start',
     paddingTop: Platform.OS === 'android' ? 40 : 50,
     paddingHorizontal: 16, paddingBottom: 10,
     borderBottomWidth: 1, borderBottomColor: COLORS.grid
  },
  symbolText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginRight: 8 },
  tag: { borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  tagText: { color: '#888', fontSize: 10, fontWeight: 'bold' },
  bigPrice: { fontSize: 28, fontWeight: 'bold', marginRight: 10 },
  changeText: { fontSize: 14, fontWeight: '600' },
  closeBtn: { padding: 5, backgroundColor: COLORS.card, borderRadius: 20 },

  // CHART AREA
  chartArea: { height: CHART_HEIGHT, width: '100%', position:'relative' },
  gridContainer: { ...StyleSheet.absoluteFillObject },
  gridLine: { position: 'absolute', width: '100%', height: 1, backgroundColor: COLORS.grid, opacity: 0.5 },
  
  // Floating Panel
  floatingPanel: {
     position: 'absolute', top: 10, left: 15, zIndex: 20,
     flexDirection: 'row', gap: 5
  },
  floatBtnBox: {
     backgroundColor: 'rgba(19, 23, 34, 0.9)', 
     paddingVertical: 6, paddingHorizontal: 10,
     borderRadius: 6, borderWidth: 1, borderColor: COLORS.grid,
     alignItems:'center'
  },
  floatLabel: { fontSize: 10, fontWeight: 'bold' },
  floatPrice: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Candles
  candleWrapper: { width: 16, height: '100%', marginHorizontal: 3, position: 'relative' },
  wick: { width: 1.5, position: 'absolute', left: 7.25 }, // Center align
  body: { width: 10, position: 'absolute', left: 3, borderRadius: 1 },
  
  // Price Line
  priceLine: {
     position: 'absolute', right: -1000, width: 2000, height: 0,
     borderTopWidth: 1, borderStyle: 'dotted', zIndex: 10
  },
  priceTag: {
     position: 'absolute', right: 940, top: -10, // Adjust to stick to right side
     paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4
  },
  priceTagText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Right Scale
  rightScale: {
     position: 'absolute', right: 0, top: 0, bottom: 0, width: 50,
     justifyContent: 'space-between', paddingVertical: 20,
     backgroundColor: COLORS.bg, borderLeftWidth: 1, borderLeftColor: COLORS.grid
  },
  scaleText: { color: '#888', fontSize: 10, textAlign: 'center' },

  // Timeframe Bar
  timeframeBar: {
     flexDirection: 'row', alignItems: 'center', height: 45,
     backgroundColor: COLORS.bg, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: COLORS.grid
  },
  tfBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  tfBtnActive: { backgroundColor: COLORS.card },
  tfText: { color: '#666', fontSize: 12, fontWeight: '600' },
  tfTextActive: { color: '#2962FF' },
  vertLine: { width: 1, height: 20, backgroundColor: COLORS.grid, marginHorizontal: 5 },
  iconBtn: { padding: 8 },

});
