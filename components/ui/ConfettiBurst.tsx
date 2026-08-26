import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';

import { Colors } from '@/constants/theme';

const PIECE_COUNT = 24;
const COLORS = [Colors.cyanVivid, '#39FF14', '#FFB800', '#FF3B30', '#FFFFFF'];

interface Piece {
  key: number;
  color: string;
  angle: number;
  distance: number;
  rotation: number;
  delay: number;
}

function ConfettiPiece({ piece }: { piece: Piece }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1100,
      delay: piece.delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, piece.delay]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(piece.angle) * piece.distance] });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.sin(piece.angle) * piece.distance + 70],
  });
  const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${piece.rotation}deg`] });
  const opacity = progress.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 1, 0] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 8,
        height: 8,
        borderRadius: 2,
        backgroundColor: piece.color,
        opacity,
        transform: [{ translateX }, { translateY }, { rotate }],
      }}
    />
  );
}

// Pure react-native Animated, no native confetti dependency (nothing here
// needs a rebuild). Renders only while `play` is true — the parent should
// flip it on for ~1.2-1.5s then off, which naturally remounts and
// re-randomizes the burst next time.
function generatePieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    key: i,
    color: COLORS[i % COLORS.length],
    angle: Math.random() * Math.PI * 2,
    distance: 70 + Math.random() * 110,
    rotation: Math.random() * 720 - 360,
    delay: Math.random() * 150,
  }));
}

export function ConfettiBurst({ play }: { play: boolean }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (play) setPieces(generatePieces());
  }, [play]);

  if (!play) return null;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.key} piece={piece} />
      ))}
    </View>
  );
}
