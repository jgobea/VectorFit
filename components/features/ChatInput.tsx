import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import { GradientPrimary } from '@/constants/theme';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const MIN_HEIGHT = 44;
const MAX_HEIGHT = 96; // DESIGN_SPEC.md §C.4: grows up to ~3-4 lines.

// DESIGN_SPEC.md §C.4: sticky bottom input bar with a growing text field and
// a send button. Sending stays gated behind `disabled` (useChat's
// isSending) so a reply can't be sent while the previous one is in flight.
export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [height, setHeight] = useState(MIN_HEIGHT);
  const canSend = text.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    onSend(text);
    setText('');
    setHeight(MIN_HEIGHT);
  };

  return (
    <View className="flex-row items-end gap-2 border-t border-border-light bg-background-light px-4 py-3 dark:border-border dark:bg-background">
      <View className="flex-1 justify-center rounded-2xl border border-border-light bg-surface-light px-4 dark:border-border dark:bg-surface">
        <TextInput
          value={text}
          onChangeText={setText}
          onContentSizeChange={(e) =>
            setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, e.nativeEvent.contentSize.height)))
          }
          placeholder={t('chat.inputPlaceholder')}
          placeholderTextColor="#A0A0A8"
          multiline
          style={{ height, maxHeight: MAX_HEIGHT, paddingVertical: 10 }}
          className="font-body text-body text-primary-light dark:text-primary"
          accessibilityLabel={t('chat.messageInput')}
        />
      </View>
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel={t('chat.sendMessage')}
        className="active:opacity-70 disabled:opacity-40"
      >
        <LinearGradient
          colors={GradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 44, width: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
        >
          {disabled ? (
            <ActivityIndicator size="small" color="#1C1C1E" />
          ) : (
            <Feather name="send" size={18} color="#1C1C1E" />
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}
