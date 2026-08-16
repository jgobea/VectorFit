import { Text, View } from 'react-native';

import { parseInline, parseMarkdownBlocks } from '@/lib/markdown';

interface MarkdownProps {
  content: string;
  className?: string;
}

function InlineText({ text, className }: { text: string; className: string }) {
  return (
    <Text className={className}>
      {parseInline(text).map((token, idx) =>
        token.type === 'text' ? (
          token.text
        ) : (
          <Text
            key={idx}
            className={token.type === 'bold' ? 'font-body-semibold' : ''}
            style={token.type === 'italic' ? { fontStyle: 'italic' } : undefined}
          >
            {token.text}
          </Text>
        )
      )}
    </Text>
  );
}

const HEADING_SIZE: Record<number, string> = { 1: 'text-h3', 2: 'text-body', 3: 'text-small' };

// Minimal in-house renderer (parsing lives in lib/markdown.ts) instead of a
// third-party package — keeps full control of styling via our own design
// tokens and avoids a dependency of uncertain compatibility with RN 0.86 /
// React 19 for what Gemini's replies actually use: bold, lists, headings.
export function Markdown({ content, className = '' }: MarkdownProps) {
  return (
    <View className="gap-1.5">
      {parseMarkdownBlocks(content).map((block, idx) => {
        if (block.type === 'heading') {
          return (
            <Text key={idx} className={`font-display ${HEADING_SIZE[block.level] ?? 'text-body'} ${className}`}>
              {block.text}
            </Text>
          );
        }
        if (block.type === 'list') {
          return (
            <View key={idx} className="gap-1">
              {block.items.map((item, itemIdx) => (
                <View key={itemIdx} className="flex-row gap-1.5">
                  <Text className={className}>{block.ordered ? `${itemIdx + 1}.` : '•'}</Text>
                  <InlineText text={item} className={`flex-1 ${className}`} />
                </View>
              ))}
            </View>
          );
        }
        return <InlineText key={idx} text={block.text} className={className} />;
      })}
    </View>
  );
}
