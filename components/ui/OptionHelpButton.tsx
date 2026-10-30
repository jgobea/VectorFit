import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable } from 'react-native';

import { InfoModal } from '@/components/ui/InfoModal';

interface OptionHelpButtonProps {
  title: string;
  message: string;
}

// Small "?" next to a selectable option (e.g. each body type) that explains
// it in an InfoModal. Its own Pressable, so tapping it never selects the
// option it sits on.
export function OptionHelpButton({ title, message }: OptionHelpButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={title}
        hitSlop={8}
        className="h-8 w-8 items-center justify-center rounded-full border border-cyan-vivid/25 active:opacity-70"
      >
        <Feather name="help-circle" size={15} color="#00E5FF" />
      </Pressable>
      <InfoModal visible={open} title={title} message={message} onClose={() => setOpen(false)} />
    </>
  );
}
