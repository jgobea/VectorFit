import { Fragment, type ReactNode } from 'react';
import { Text, View } from 'react-native';

// Tiny renderer for the markdown subset used in content/legalContent.ts:
// "### " headings, "* " bullets, and **bold** inline spans. Not a general
// markdown parser — the legal copy is the only thing that goes through it.
function renderInline(text: string, keyPrefix: string): ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <Text key={`${keyPrefix}-${i}`} className="font-body-semibold text-primary-light dark:text-primary">
        {part.slice(2, -2)}
      </Text>
    ) : (
      <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>
    )
  );
}

export function LegalText({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: ReactNode[] = [];
  let bulletBuffer: string[] = [];

  const flushBullets = (key: string) => {
    if (bulletBuffer.length === 0) return;
    const items = bulletBuffer;
    bulletBuffer = [];
    blocks.push(
      <View key={key} className="gap-2">
        {items.map((item, i) => (
          <View key={i} className="flex-row gap-2 pl-1">
            <Text className="font-body text-body text-secondary-light dark:text-secondary">{'•'}</Text>
            <Text className="flex-1 font-body text-body text-secondary-light dark:text-secondary">
              {renderInline(item, `${key}-${i}`)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (line.startsWith('* ')) {
      bulletBuffer.push(line.slice(2));
      return;
    }
    flushBullets(`bullets-${idx}`);

    if (!line) return;

    if (line.startsWith('### ')) {
      blocks.push(
        <Text key={idx} className="mt-2 font-body-semibold text-h3 text-primary-light dark:text-primary">
          {line.slice(4)}
        </Text>
      );
      return;
    }

    blocks.push(
      <Text key={idx} className="font-body text-body text-secondary-light dark:text-secondary">
        {renderInline(line, `p-${idx}`)}
      </Text>
    );
  });
  flushBullets('bullets-end');

  return <View className="gap-3">{blocks}</View>;
}
