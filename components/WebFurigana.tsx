import React from 'react';
import { StyleProp, TextStyle, Platform, View, Text } from 'react-native';

type WebFuriganaProps = {
  furigana: Array<string | [string, string]>;
  style?: StyleProp<TextStyle>;
  rubyStyle?: StyleProp<TextStyle>;
};

/**
 * A component for rendering furigana (reading aids) for Japanese text on web
 * using HTML's native <ruby> element
 */
const WebFurigana: React.FC<WebFuriganaProps> = ({ furigana, style, rubyStyle }) => {
  // Convert React Native style objects to CSS-in-JS style objects for web
  const baseStyle = style as any;
  const rtStyle = rubyStyle as any;
  
  const baseTextStyle = {
    fontSize: baseStyle?.fontSize || 24,
    fontFamily: baseStyle?.fontFamily || 'sans-serif',
    color: baseStyle?.color || 'black',
    lineHeight: baseStyle?.lineHeight || 1.5,
  };
  
  const rubyTextStyle = {
    fontSize: rtStyle?.fontSize || 12,
    fontFamily: rtStyle?.fontFamily || 'sans-serif',
    color: rtStyle?.color || 'gray',
    lineHeight: 1,
    textAlign: 'center',
  };

  if (Platform.OS === 'web') {
    // Map the furigana array to HTML
    const furiganaHTML = furigana.map((item, index) => {
      if (typeof item === 'string') {
        // Regular character (kana)
        return `<span style="font-size:${baseTextStyle.fontSize}px;color:${baseTextStyle.color};font-family:${baseTextStyle.fontFamily}">${item}</span>`;
      } else {
        // Kanji with furigana
        const [kanji, reading] = item;
        return `
          <ruby style="ruby-align:center;font-size:${baseTextStyle.fontSize}px;color:${baseTextStyle.color};font-family:${baseTextStyle.fontFamily};margin:0;padding:0">
            ${kanji}
            <rt style="font-size:${rubyTextStyle.fontSize}px;color:${rubyTextStyle.color};font-family:${rubyTextStyle.fontFamily};line-height:1;text-align:center;margin:0;padding:0">
              ${reading}
            </rt>
          </ruby>
        `;
      }
    }).join('');

    return (
      <div
        style={{ 
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '4px 0',
          margin: 0,
        }}
        dangerouslySetInnerHTML={{ __html: furiganaHTML }}
      />
    );
  }
  
  // Fallback for non-web platforms (shouldn't be used)
  return (
    <View>
      <Text>Furigana not supported on this platform</Text>
    </View>
  );
};

export default WebFurigana;