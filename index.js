import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, AppState} from 'react-native';

const DEFAULT_DIGIT_STYLE = {backgroundColor: '#FAB913'};
const DEFAULT_DIGIT_TXT_STYLE = {color: '#000'};
const DEFAULT_TIME_LABEL_STYLE = {color: '#000'};
const DEFAULT_SEPARATOR_STYLE = {color: '#000'};
const DEFAULT_TIME_TO_SHOW = ['D', 'H', 'M', 'S'];
const DEFAULT_TIME_LABELS = {
  d: 'Days',
  h: 'Hours',
  m: 'Minutes',
  s: 'Seconds',
};

const formatNumber = (n) => String(Math.floor(n)).padStart(2, '0');

const getTimeLeft = (until, timeToShow) => {
  const s = Math.floor(until);
  return {
    days: Math.floor(s / 86400),
    hours: timeToShow.includes('D')
      ? Math.floor(s / 3600) % 24
      : Math.floor(s / 3600),
    minutes: timeToShow.includes('H')
      ? Math.floor(s / 60) % 60
      : Math.floor(s / 60),
    seconds: timeToShow.includes('M') ? s % 60 : s,
  };
};

const CountDown = ({
  id,
  digitStyle = DEFAULT_DIGIT_STYLE,
  digitTxtStyle = DEFAULT_DIGIT_TXT_STYLE,
  timeLabelStyle = DEFAULT_TIME_LABEL_STYLE,
  separatorStyle = DEFAULT_SEPARATOR_STYLE,
  timeToShow = DEFAULT_TIME_TO_SHOW,
  timeLabels = DEFAULT_TIME_LABELS,
  showSeparator = false,
  size = 15,
  until: untilProp = 0,
  onChange,
  onPress,
  onFinish,
  running = true,
  style,
}) => {
  const [until, setUntil] = useState(() => Math.max(untilProp, 0));
  const wentBackgroundAtRef = useRef(null);
  const onFinishRef = useRef(onFinish);
  const onChangeRef = useRef(onChange);
  const runningRef = useRef(running);

  // Keep callback refs in sync
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  // Reset when `until` prop or `id` changes
  useEffect(() => {
    setUntil(Math.max(untilProp, 0));
  }, [untilProp, id]);

  // Handle AppState changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        nextAppState === 'active' &&
        wentBackgroundAtRef.current != null &&
        runningRef.current
      ) {
        const diff = (Date.now() - wentBackgroundAtRef.current) / 1000.0;
        wentBackgroundAtRef.current = null;
        setUntil((prev) => {
          const next = Math.max(0, prev - diff);
          if (onChangeRef.current) {
            onChangeRef.current(next);
          }
          if (next <= 0 && prev > 0 && onFinishRef.current) {
            setTimeout(() => onFinishRef.current?.(), 0);
          }
          return next;
        });
      }
      if (nextAppState === 'background') {
        wentBackgroundAtRef.current = Date.now();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      if (!runningRef.current) return;

      setUntil((prev) => {
        if (prev <= 0) return 0;
        const next = Math.max(0, prev - 1);

        if (onChangeRef.current) {
          onChangeRef.current(next);
        }

        if (next <= 0 && onFinishRef.current) {
          setTimeout(() => onFinishRef.current?.(), 0);
        }

        return next;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const {days, hours, minutes, seconds} = getTimeLeft(until, timeToShow);
  const formattedTime = [
    formatNumber(days),
    formatNumber(hours),
    formatNumber(minutes),
    formatNumber(seconds),
  ];

  const renderDigit = (d) => (
    <View
      style={[
        styles.digitCont,
        {width: size * 2.3, height: size * 2.6},
        digitStyle,
      ]}>
      <Text style={[styles.digitTxt, {fontSize: size}, digitTxtStyle]}>
        {d}
      </Text>
    </View>
  );

  const renderLabel = (label) => {
    if (!label) return null;
    return (
      <Text style={[styles.timeTxt, {fontSize: size / 1.8}, timeLabelStyle]}>
        {label}
      </Text>
    );
  };

  const renderDoubleDigits = (label, digits) => (
    <View style={styles.doubleDigitCont}>
      <View style={styles.timeInnerCont}>{renderDigit(digits)}</View>
      {renderLabel(label)}
    </View>
  );

  const renderSeparator = () => (
    <View style={{justifyContent: 'center', alignItems: 'center'}}>
      <Text
        style={[styles.separatorTxt, {fontSize: size * 1.2}, separatorStyle]}>
        {':'}
      </Text>
    </View>
  );

  const Component = onPress ? TouchableOpacity : View;

  return (
    <View style={style}>
      <Component style={styles.timeCont} onPress={onPress}>
        {timeToShow.includes('D')
          ? renderDoubleDigits(timeLabels.d, formattedTime[0])
          : null}
        {showSeparator && timeToShow.includes('D') && timeToShow.includes('H')
          ? renderSeparator()
          : null}
        {timeToShow.includes('H')
          ? renderDoubleDigits(timeLabels.h, formattedTime[1])
          : null}
        {showSeparator && timeToShow.includes('H') && timeToShow.includes('M')
          ? renderSeparator()
          : null}
        {timeToShow.includes('M')
          ? renderDoubleDigits(timeLabels.m, formattedTime[2])
          : null}
        {showSeparator && timeToShow.includes('M') && timeToShow.includes('S')
          ? renderSeparator()
          : null}
        {timeToShow.includes('S')
          ? renderDoubleDigits(timeLabels.s, formattedTime[3])
          : null}
      </Component>
    </View>
  );
};

const styles = StyleSheet.create({
  timeCont: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  timeTxt: {
    color: 'white',
    marginVertical: 2,
    backgroundColor: 'transparent',
  },
  timeInnerCont: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitCont: {
    borderRadius: 5,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doubleDigitCont: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitTxt: {
    color: 'white',
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  separatorTxt: {
    backgroundColor: 'transparent',
    fontWeight: 'bold',
  },
});

export default CountDown;
export {CountDown};
