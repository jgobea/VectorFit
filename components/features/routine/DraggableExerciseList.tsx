import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// Custom sortable list built on Gesture Handler + Reanimated — both are
// already linked into the native build (used elsewhere: chat bubbles,
// toasts, the root layout's GestureHandlerRootView), so this needed no new
// native dependency / prebuild, unlike a drag-list library would have.
//
// The dragged row follows the finger continuously (no quantized jumps).
// While active it renders as: a static placeholder left in normal flex
// flow (so it keeps reserving its current slot and neighbors don't
// reflow around a "hole"), plus the real card floating on top of it,
// absolutely positioned and offset by the raw drag translation — the
// "after image" the card will land in if you let go right now.
// Passive neighbors stay in normal flow and get `layout` spring
// transitions, so they visibly slide out of the way like icons being
// rearranged on a phone home screen.

const GAP = 12;
// Springy, not linear — this is what reads as "resistance" rather than a
// mechanical snap when a neighbor slides out of the way.
const LAYOUT_SPRING = LinearTransition.springify().damping(26).stiffness(260);
const RELEASE_SPRING = { damping: 26, stiffness: 260 };

interface DraggableRowProps {
  id: string;
  onReorderPreview: (id: string, steps: number) => void;
  onDragEnd: () => void;
  renderItem: (dragHandle: ReactNode) => ReactNode;
}

function DraggableRow({ id, onReorderPreview, onDragEnd, renderItem }: DraggableRowProps) {
  const translateY = useSharedValue(0);
  // Running total of slot-shifts already committed this gesture. e.translationY
  // is cumulative from gesture start, not a per-frame delta — without
  // subtracting this every frame, a single step gets re-committed on every
  // subsequent onUpdate call (many times a second) instead of once, which is
  // what sent a dragged row rocketing to the bottom of the list.
  const consumed = useSharedValue(0);
  const isActive = useSharedValue(false);
  // This row's own measured height — never another row's, so there's no
  // cross-item reactivity to get wrong. Used to know how far a drag has to
  // travel before it counts as crossing into a neighbor's slot, and to size
  // the placeholder left behind while this row is floating.
  const rowHeight = useSharedValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  const triggerHaptic = useCallback(() => {
    Haptics.selectionAsync();
  }, []);

  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          'worklet';
          consumed.value = 0;
          isActive.value = true;
          runOnJS(setIsDragging)(true);
          runOnJS(triggerHaptic)();
        })
        .onUpdate((e) => {
          'worklet';
          translateY.value = e.translationY - consumed.value;

          const slot = rowHeight.value + GAP;
          if (slot <= 0) return;
          const steps = Math.round(translateY.value / slot);
          if (steps !== 0) {
            consumed.value += steps * slot;
            translateY.value -= steps * slot;
            runOnJS(onReorderPreview)(id, steps);
            runOnJS(triggerHaptic)();
          }
        })
        .onEnd(() => {
          'worklet';
          isActive.value = false;
          translateY.value = withSpring(0, RELEASE_SPRING, (finished) => {
            // Stay in the floating/placeholder branch until the settle
            // animation actually finishes — flipping back to the plain
            // layout mid-spring would swap the native view out from under
            // the animation.
            if (finished) runOnJS(endDrag)();
          });
          runOnJS(onDragEnd)();
        }),
    [id, onReorderPreview, onDragEnd, triggerHaptic, endDrag, translateY, consumed, isActive, rowHeight]
  );

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: withSpring(isActive.value ? 1.02 : 1, RELEASE_SPRING) }],
    zIndex: isActive.value ? 10 : 0,
    shadowColor: '#000',
    shadowOpacity: isActive.value ? 0.3 : 0,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: isActive.value ? 8 : 0,
  }));

  const dragHandle = (
    <GestureDetector gesture={pan}>
      <View
        accessibilityRole="button"
        accessibilityLabel="Drag to reorder"
        hitSlop={8}
        className="h-8 w-8 items-center justify-center rounded-lg active:opacity-70"
      >
        <Feather name="move" size={16} color="#A0A0A8" />
      </View>
    </GestureDetector>
  );

  const handleLayout = (e: LayoutChangeEvent) => {
    rowHeight.value = e.nativeEvent.layout.height;
    setMeasuredHeight(e.nativeEvent.layout.height);
  };

  if (!isDragging) {
    return (
      <Animated.View layout={LAYOUT_SPRING} style={cardStyle} onLayout={handleLayout}>
        {renderItem(dragHandle)}
      </Animated.View>
    );
  }

  return (
    <View style={{ height: measuredHeight ?? undefined }}>
      <View
        className="rounded-2xl border-2 border-dashed border-cyan-vivid/30 bg-cyan-vivid/5"
        style={{ height: measuredHeight ?? '100%' }}
      />
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0 }, cardStyle]} onLayout={handleLayout}>
        {renderItem(dragHandle)}
      </Animated.View>
    </View>
  );
}

interface DraggableExerciseListProps<T extends { id: string }> {
  items: T[];
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T, dragHandle: ReactNode) => ReactNode;
}

export function DraggableExerciseList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: DraggableExerciseListProps<T>) {
  const itemsById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const [order, setOrder] = useState<string[]>(() => items.map((i) => i.id));
  const orderRef = useRef(order);

  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  // Reconciles additions/removals into the existing order instead of
  // resetting it outright, so an in-progress drag's order survives an
  // unrelated field edit elsewhere in the routine (which — see
  // useRoutineExerciseActions — replaces every day's exercises array on
  // every patch, so `items` gets a new reference far more often than its
  // actual id set changes).
  useEffect(() => {
    setOrder((prev) => {
      const validPrev = prev.filter((id) => itemsById.has(id));
      const missing = items.map((i) => i.id).filter((id) => !validPrev.includes(id));
      if (missing.length === 0 && validPrev.length === prev.length) return prev;
      return [...validPrev, ...missing];
    });
  }, [itemsById, items]);

  const handleReorderPreview = useCallback((id: string, steps: number) => {
    setOrder((prev) => {
      const from = prev.indexOf(id);
      if (from === -1) return prev;
      const to = Math.min(Math.max(from + steps, 0), prev.length - 1);
      if (to === from) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, id);
      return next;
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    onReorder(orderRef.current);
  }, [onReorder]);

  return (
    <View style={{ gap: GAP }}>
      {order.map((id) => {
        const item = itemsById.get(id);
        if (!item) return null;
        return (
          <DraggableRow
            key={id}
            id={id}
            onReorderPreview={handleReorderPreview}
            onDragEnd={handleDragEnd}
            renderItem={(dragHandle) => renderItem(item, dragHandle)}
          />
        );
      })}
    </View>
  );
}
