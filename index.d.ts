import {StyleProp, ViewStyle, TextStyle} from 'react-native';

export interface CountDownProps {
  /** Counter id, used to reset the timer when changed */
  id?: string;
  /** Style for the digit containers */
  digitStyle?: StyleProp<ViewStyle>;
  /** Style for the digit text */
  digitTxtStyle?: StyleProp<TextStyle>;
  /** Style for the time labels below each digit */
  timeLabelStyle?: StyleProp<TextStyle>;
  /** Style for the separator between time units */
  separatorStyle?: StyleProp<TextStyle>;
  /** Which time units to display */
  timeToShow?: Array<'D' | 'H' | 'M' | 'S'>;
  /** Custom labels for each time unit */
  timeLabels?: {
    d?: string;
    h?: string;
    m?: string;
    s?: string;
  };
  /** Whether to show colon separators between time units */
  showSeparator?: boolean;
  /** Base font size for the digits */
  size?: number;
  /** Number of seconds to count down */
  until?: number;
  /** Called every second with the remaining time */
  onChange?: (until: number) => void;
  /** Called when the countdown is pressed */
  onPress?: () => void;
  /** Called when the countdown reaches zero */
  onFinish?: () => void;
  /** Whether the countdown is actively running */
  running?: boolean;
  /** Style for the outer container */
  style?: StyleProp<ViewStyle>;
}

declare const CountDown: React.FC<CountDownProps>;

export default CountDown;
export {CountDown};
