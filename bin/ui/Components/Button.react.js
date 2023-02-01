const React = require('react');
const {
  useState,
  useEffect
} = React;

// props:
// id: ?string
// label: string
// onClick: () => void
// onMouseDown: optional () => void
// onMouseUp: optional () => void
// disabled: optional boolean
// style: optional Object

function Button(props) {
  const id = props.id || props.label;
  const touchFn = () => {
    if (props.onMouseDown != null) {
      props.onMouseDown();
    } else {
      props.onClick();
    }
  };
  const [intervalID, setIntervalID] = useState(null);
  const depressedStyle = props.depressed ? {
    color: 'rgba(16, 16, 16, 1)',
    backgroundColor: 'rgba(239, 239, 239, 0.3)',
    borderColor: 'rgba(118, 118, 118, 0.3)',
    borderRadius: '2px',
    border: '1px solid',
    paddingTop: '2px',
    paddingBottom: '2px'
  } : {};
  const highlightedStyle = props.highlighted ? {
    color: 'rgba(10, 118, 10, 0.3)',
    borderColor: 'rgba(10, 118, 10, 0.3)',
    borderRadius: '2px',
    border: '2px solid',
    paddingTop: '2px',
    paddingBottom: '2px'
  } : {};
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: {
      touchAction: 'initial',
      fontSize: '18px',
      ...props.style,
      ...depressedStyle,
      ...highlightedStyle
    },
    key: id || label,
    className: props.disabled || props.depressed ? 'buttonDisable' : '',
    id: props.id || id.toUpperCase() + '_button',
    onClick: ev => {
      if (props.disabled) return false;
      ev.preventDefault();
      if (props.onClick) {
        props.onClick(ev);
      }
      return false;
    },
    onTouchStart: ev => {
      ev.preventDefault();
      if (intervalID) {
        console.log("already in interval, clearing");
        clearInterval(intervalID);
        setIntervalID(null);
      }
      touchFn();
      // HACK: if it's any of these 4 buttons, then allow repeating
      if (props.label == 'Bite (E)' || props.label == 'Follow (F)' || props.label == 'Dig (R)' || props.label == 'Alert (F)') {
        const interval = setInterval(touchFn, 120);
        setIntervalID(interval);
      }
    },
    onTouchEnd: ev => {
      ev.preventDefault();
      clearInterval(intervalID);
      setIntervalID(null);
      props.onMouseUp;
    },
    onTouchCancel: ev => {
      clearInterval(intervalID);
      setIntervalID(null);
      props.onMouseUp;
    },
    onTouchMove: ev => {
      ev.preventDefault();
    },
    onMouseDown: ev => {
      ev.preventDefault();
      if (intervalID) {
        console.log("already in interval, clearing");
        clearInterval(intervalID);
        setIntervalID(null);
      }
      if (!props.onMouseDown) return false;
      props.onMouseDown();
      // HACK: if it's any of these 4 buttons, then allow repeating
      if (props.label == 'Bite (E)' || props.label == 'Follow (F)' || props.label == 'Dig (R)' || props.label == 'Alert (F)') {
        const interval = setInterval(props.onMouseDown, 120);
        setIntervalID(interval);
      }
    },
    onMouseUp: ev => {
      clearInterval(intervalID);
      setIntervalID(null);
      if (props.onMouseUp) {
        props.onMouseUp();
      }
    },
    disabled: props.disabled
  }, props.label);
}
module.exports = Button;