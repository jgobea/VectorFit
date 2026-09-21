import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { ActivityIndicator, View } from 'react-native';

interface GoogleAuthButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

// The package's own native button, not a hand-drawn "G" — Google's brand
// guidelines require its exact logo/colors/copy, and this is the officially
// sanctioned way to get that right. `dark` matches the app's own theme;
// there's no light/dark-mode swap since VectorFit's auth screens don't
// support light mode themselves (see login.tsx/signup.tsx).
export function GoogleAuthButton({ onPress, loading, disabled }: GoogleAuthButtonProps) {
  return (
    <View className="h-14 items-center justify-center overflow-hidden rounded-xl" style={disabled ? { opacity: 0.4 } : undefined}>
      {loading ? (
        <View className="h-14 w-full items-center justify-center rounded-xl border border-border-light dark:border-border">
          <ActivityIndicator color="#00E5FF" />
        </View>
      ) : (
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={onPress}
          disabled={disabled}
          style={{ width: '100%', height: 56 }}
        />
      )}
    </View>
  );
}
