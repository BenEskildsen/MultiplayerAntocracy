const React = require('react');
const {
  memo,
  useState,
  useEffect,
  useMemo
} = React;
const {
  clamp,
  isIpad
} = require('../utils/helpers');
function JoystickControls(props) {
  const {
    dispatch
  } = props;
  let joyWidth = 30;
  let joyHeight = 25;
  if (isIpad()) {
    joyWidth *= 1.8;
    joyHeight *= 1.8;
  }
  const padWidth = joyWidth * 3;
  const padHeight = joyHeight * 3;
  const [joystickPos, setJoystickPos] = useState({
    x: 0,
    y: 0
  });
  const [joystickTouched, setJoystickTouched] = useState(null);
  useEffect(() => {
    if (joystickPos.x > joyWidth / 5) {
      dispatch({
        type: 'SET_KEY_PRESS',
        key: 'left',
        pressed: false
      });
      dispatch({
        type: 'SET_KEY_PRESS',
        key: 'right',
        pressed: true
      });
    } else if (joystickPos.x < -joyWidth / 5) {
      dispatch({
        type: 'SET_KEY_PRESS',
        key: 'right',
        pressed: false
      });
      dispatch({
        type: 'SET_KEY_PRESS',
        key: 'left',
        pressed: true
      });
    } else {
      dispatch({
        type: 'SET_KEY_PRESS',
        key: 'left',
        pressed: false
      });
      dispatch({
        type: 'SET_KEY_PRESS',
        key: 'right',
        pressed: false
      });
    }
    if (joystickPos.y > joyHeight / 5) {
      dispatch({
        type: 'SET_KEY_PRESS',
        key: 'down',
        pressed: false
      });
      dispatch({
        type: 'SET_KEY_PRESS',
        key: 'up',
        pressed: true
      });
    } else if (joystickPos.y < -joyHeight / 5) {
      dispatch({
        type: 'SET_KEY_PRESS',
        key: 'up',
        pressed: false
      });
      dispatch({
        type: 'SET_KEY_PRESS',
        key: 'down',
        pressed: true
      });
    } else {
      dispatch({
        type: 'SET_KEY_PRESS',
        key: 'down',
        pressed: false
      });
      dispatch({
        type: 'SET_KEY_PRESS',
        key: 'up',
        pressed: false
      });
    }
  }, [joystickPos]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      marginTop: 20,
      marginRight: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: padWidth,
      height: padHeight,
      opacity: '0.4',
      backgroundColor: 'lightgray',
      borderRadius: '25%'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: joyWidth,
      height: joyHeight,
      display: 'inline-block',
      border: '1px solid black',
      borderRadius: '50%',
      boxShadow: '1px 1px',
      backgroundColor: 'steelblue',
      position: 'absolute',
      top: (padHeight - joyHeight) / 2 + joystickPos.y - 1,
      left: (padWidth - joyWidth) / 2 + joystickPos.x - 1,
      touchAction: 'manipulation'
    },
    onMouseDown: ev => {
      setJoystickTouched({
        x: ev.clientX,
        y: ev.clientY
      });
    },
    onMouseUp: ev => {
      setJoystickTouched(null);
      setJoystickPos({
        x: 0,
        y: 0
      });
    },
    onMouseMove: ev => {
      if (joystickTouched != null) {
        setJoystickPos({
          x: clamp(ev.clientX - joystickTouched.x, -padWidth / 2, padWidth / 2),
          y: clamp(ev.clientY - joystickTouched.y, -padHeight / 2, padHeight / 2)
        });
      }
    },
    onTouchStart: ev => {
      ev.preventDefault();
      setJoystickTouched({
        x: ev.touches[0].clientX,
        y: ev.touches[0].clientY
      });
    },
    onTouchEnd: ev => {
      setJoystickTouched(null);
      setJoystickPos({
        x: 0,
        y: 0
      });
    },
    onTouchMove: ev => {
      ev.preventDefault(); // try to prevent pinch zoom
      // if (ev.scale != 1) ev.preventDefault(); // try to prevent pinch zoom
      if (joystickTouched != null) {
        setJoystickPos({
          x: clamp(ev.touches[0].clientX - joystickTouched.x, -padWidth / 2, padWidth / 2),
          y: clamp(ev.touches[0].clientY - joystickTouched.y, -padHeight / 2, padHeight / 2)
        });
      }
    }
  }));
}
module.exports = memo(JoystickControls);