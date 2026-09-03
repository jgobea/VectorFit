import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

interface ChatErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

// Replaces a bare red error string with a proper banner — icon, readable
// copy, and a retry affordance when the failed send is still known.
export function ChatErrorBanner({ message, onRetry }: ChatErrorBannerProps) {
  const { t } = useTranslation();
  return (
    <View className="mx-4 mb-2 flex-row items-center gap-2 rounded-xl border border-error/30 bg-error/10 px-3.5 py-2.5">
      <Feather name="alert-circle" size={16} color="#FF3B30" />
      <Text className="flex-1 font-body text-small text-error">{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('common.retry')}>
          <Text className="font-body-semibold text-small text-error">{t('common.retry')}</Text>
        </Pressable>
      )}
    </View>
  );
}
