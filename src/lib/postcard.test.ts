import { describe, expect, it } from 'vitest';
import {
  POSTCARD_MESSAGE_MAX,
  buildPostcardCaption,
  formatGreeting,
  normalizePostcardMessage,
  wrapPostcardText,
} from './postcard';

const widthOf = (text: string) => text.length * 10;

describe('wrapPostcardText', () => {
  it('keeps a line that already fits', () => {
    expect(wrapPostcardText('Chiều nay trời đẹp.', 400, widthOf)).toEqual(['Chiều nay trời đẹp.']);
  });

  it('wraps on spaces and keeps Vietnamese letters whole', () => {
    expect(wrapPostcardText('một hai ba bốn', 100, widthOf)).toEqual(['một hai ba', 'bốn']);
  });

  it('preserves an intentional second line', () => {
    expect(wrapPostcardText('Chiều nay trời đẹp.\nMình nhớ bạn quá.', 400, widthOf)).toEqual([
      'Chiều nay trời đẹp.',
      'Mình nhớ bạn quá.',
    ]);
  });

  it('breaks a token that cannot fit on one line', () => {
    expect(wrapPostcardText('abcdef', 30, widthOf)).toEqual(['abc', 'def']);
  });

  it('returns nothing for blank text', () => {
    expect(wrapPostcardText('   \n  ', 200, widthOf)).toEqual([]);
  });
});

describe('normalizePostcardMessage', () => {
  it('caps the note at 200 characters', () => {
    expect(Array.from(normalizePostcardMessage('à'.repeat(240))).length).toBe(POSTCARD_MESSAGE_MAX);
  });

  it('keeps a line break inside the limit', () => {
    expect(normalizePostcardMessage('  Chiều nay trời đẹp.\r\nMình nhớ bạn quá.  ')).toBe(
      'Chiều nay trời đẹp.\nMình nhớ bạn quá.',
    );
  });
});

describe('formatGreeting', () => {
  it('joins the honorific and the name', () => {
    expect(formatGreeting('  Lan  ')).toBe('Thân gửi Lan');
  });

  it('collapses a line break inside the name', () => {
    expect(formatGreeting('Lan\nAnh')).toBe('Thân gửi Lan Anh');
  });

  it('stands alone when no name is written', () => {
    expect(formatGreeting('   ')).toBe('Thân gửi');
  });
});

describe('buildPostcardCaption', () => {
  const advance = () => 30;
  const gap = () => 0;

  it('writes the sample note with the date beside a short location', () => {
    const lines = buildPostcardCaption({
      recipient: 'Lan',
      message: 'Chiều nay trời đẹp.\nMình nhớ bạn quá.',
      location: 'ka:mon kafe',
      date: '15/11/2026',
      maxWidth: 400,
      measure: widthOf,
      availableHeight: 400,
      lineAdvance: advance,
      roleGap: gap,
    });
    expect(lines).toEqual([
      { role: 'greeting', text: 'Thân gửi Lan' },
      { role: 'message', text: 'Chiều nay trời đẹp.' },
      { role: 'message', text: 'Mình nhớ bạn quá.' },
      { role: 'location', text: 'ka:mon kafe', aside: '15/11/2026' },
    ]);
  });

  it('puts the date on its own line when it does not fit beside the location', () => {
    const lines = buildPostcardCaption({
      recipient: 'Lan',
      message: 'Chào.',
      location: 'ka:mon kafe',
      date: '15/11/2026',
      maxWidth: 400,
      measure: (text, role) => (role === 'date' ? 500 : widthOf(text)),
      availableHeight: 200,
      lineAdvance: advance,
      roleGap: gap,
    });
    expect(lines.map(line => line.role)).toEqual(['greeting', 'message', 'location', 'date']);
    expect(lines.find(line => line.role === 'location')?.aside).toBeUndefined();
    expect(lines.at(-1)).toEqual({ role: 'date', text: '15/11/2026' });
  });

  it('drops the date when the block would overflow and still keeps the note', () => {
    const lines = buildPostcardCaption({
      recipient: 'Lan',
      message: 'Chào.',
      location: 'ka:mon kafe',
      date: '15/11/2026',
      maxWidth: 400,
      measure: (text, role) => (role === 'date' ? 500 : widthOf(text)),
      availableHeight: 50,
      lineAdvance: advance,
      roleGap: gap,
    });
    expect(lines.map(line => line.text)).toEqual(['Thân gửi Lan', 'Chào.', 'ka:mon kafe']);
    expect(lines.some(line => line.role === 'date' || line.aside)).toBe(false);
  });

  it('limits a narrow message and marks the cut', () => {
    const lines = buildPostcardCaption({
      recipient: 'Lan',
      message: 'một hai ba bốn năm sáu',
      location: '',
      date: '',
      maxWidth: 70,
      measure: widthOf,
      availableHeight: 400,
      lineAdvance: advance,
      roleGap: gap,
      maxMessageLines: 2,
    });
    const message = lines.filter(line => line.role === 'message').map(line => line.text);
    expect(message).toEqual(['một hai', 'ba bốn…']);
    expect(widthOf(message[1])).toBeLessThanOrEqual(70);
  });
});
