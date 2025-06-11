import React, { useCallback, useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const ASHTRAY_SIZE = width * 0.6;
const COUNTER_ICON_SIZE = 56; // doubled size
const CIG_BASE_ROT = 90;      // horizontal baseline in degrees

// ‑‑ Assets ------------------------------------------------------------------
const CIG_IMAGES = [
  require('./assets/cigarette1.png'),
  require('./assets/cigarette2.png'),
  require('./assets/cigarette3.png'),
  require('./assets/cigarette4.png'),
  require('./assets/cigarette5.png'),
  require('./assets/cigarette6.png'),
];

const ASH_IMAGES = [
  require('./assets/ashtray1.png'),
  require('./assets/ashtray2.png'),
  require('./assets/ashtray3.png'),
  require('./assets/ashtray4.png'),
  require('./assets/ashtray5.png'),
  require('./assets/ashtray6.png'),
];

const ASH_CHUNK = require('./assets/ash-chunk.png');

// ‑‑ Component ---------------------------------------------------------------
export default function App() {
  /** Puffs hechos sobre el cigarro actual (0‑11) */
  const [puffCount, setPuffCount] = useState(0);
  /** Cuántos cigarros se han terminado desde que inició la app */
  const [totalCigarettes, setTotalCigarettes] = useState(0);
  /** Nivel del cenicero (0‑5) */
  const [ashtrayLevel, setAshtrayLevel] = useState(0);
  /** Cuántos ceniceros llenos van */
  const [totalAshtrays, setTotalAshtrays] = useState(0);

  // Animaciones con Reanimated
  const drop = useSharedValue(0);
  const tilt = useSharedValue(0);

  const chunkStyle = useAnimatedStyle(() => ({
    opacity: drop.value,
    transform: [
      { translateY: drop.value * 120 },
      { scale: 0.8 + 0.2 * drop.value },
    ],
  }));

  const cigStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${CIG_BASE_ROT - 5 * tilt.value}deg` }],
  }));

  // Manejo de click / calada
  const onTap = useCallback(() => {
    // Animación del cigarro
    tilt.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 150 })
    );

    // Animación del trozo de ceniza cada 2 caladas
    const nextPuff = puffCount + 1;
    if (nextPuff % 2 === 0) {
      drop.value = 0;
      drop.value = withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 10 })
      );
    }

    setPuffCount(nextPuff);

    // Si completó 12 caladas -> Se termina el cigarro
    if (nextPuff >= 12) {
      setPuffCount(0);
      setTotalCigarettes((c) => c + 1);

      // Sube un nivel de cenicero
      setAshtrayLevel((lvl) => {
        const newLvl = lvl + 1;
        if (newLvl >= 6) {
          // Cenicero lleno: reinicia y suma contador
          setTotalAshtrays((a) => a + 1);
          return 0;
        }
        return newLvl;
      });
    }
  }, [puffCount]);

  // Índices para las imágenes actuales
  const cigStage = Math.floor(puffCount / 2); // 0‑5
  const currentCigImg = CIG_IMAGES[cigStage];
  const currentAshImg = ASH_IMAGES[ashtrayLevel];

  return (
    <LinearGradient
      colors={['#0f5e2e', '#0b4a25']}
      style={styles.gradient}
    >
      <Pressable style={styles.container} onPress={onTap}>
        {/* Contadores arriba */}
        <View style={styles.counterRow}>
          <View style={styles.counterBox}>
            <Image source={CIG_IMAGES[5]} style={{ width: COUNTER_ICON_SIZE, height: COUNTER_ICON_SIZE, marginRight: 6 }} />
            <Text style={styles.counterText}>{totalCigarettes}</Text>
          </View>
          <View style={styles.counterBox}>
            <Image source={ASH_IMAGES[5]} style={{ width: COUNTER_ICON_SIZE, height: COUNTER_ICON_SIZE, marginRight: 6 }} />
            <Text style={styles.counterText}>{totalAshtrays}</Text>
          </View>
        </View>

        {/* Cigarro */}
        <Animated.Image
          source={currentCigImg}
          style={[styles.cig, cigStyle]}
          resizeMode="contain"
        />

        {/* Trozo de ceniza */}
        <Animated.Image
          source={ASH_CHUNK}
          style={[styles.chunk, chunkStyle]}
          resizeMode="contain"
        />

        {/* Cenicero */}
        <Image
          source={currentAshImg}
          style={styles.ashtray}
          resizeMode="contain"
        />
      </Pressable>
    </LinearGradient>
  );
}

// ‑‑ Estilos -----------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  counterRow: {
    position: 'absolute',
    top: 60,
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    elevation: 2,        // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  counterText: {
    fontSize: 36,
    fontWeight: '600',
  },

  cig: {
    width: ASHTRAY_SIZE * 3.2,
    height: ASHTRAY_SIZE * 0.56,
    marginBottom: 100,
  },
  ashtray: {
    width: ASHTRAY_SIZE,
    height: ASHTRAY_SIZE,
  },
  chunk: {
    position: 'absolute',
    top: '40%',
    width: 80,
    height: 80,
  },
  gradient: { flex: 1 },
});
