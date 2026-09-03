import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { Text, View } from 'react-native';

interface ProfileGroupProps {
  title: string;
  children: ReactNode;
}

// The "everything is a bordered Card" look read as generic/AI-generated —
// per explicit user request, this instead mimics a native Settings app's
// grouped list: a small uppercase label above a soft-elevated (not
// outlined) surface, its ProfileRow children separated by inset dividers
// instead of stacked as separate boxes. Used for every section's read-only
// view; edit mode keeps the Card-based form layout (ProfileSection.tsx) —
// sliders/inputs/radio groups don't fit a compact row.
export function ProfileGroup({ title, children }: ProfileGroupProps) {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <View className="gap-2">
      <Text className="px-1 font-body-semibold text-small uppercase tracking-wide text-secondary-light dark:text-secondary">
        {title}
      </Text>
      <View
        className="overflow-hidden rounded-2xl bg-surface-light dark:bg-surface"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
      >
        {items.map((item, i) => (
          <Fragment key={item.key ?? i}>
            {item}
            {i < items.length - 1 && (
              // Inset to start past the icon column, not full-bleed — the
              // detail that reads as "native list" rather than a plain
              // stack of horizontal rules.
              <View className="h-px bg-border-light dark:bg-border" style={{ marginLeft: 56 }} />
            )}
          </Fragment>
        ))}
      </View>
    </View>
  );
}
