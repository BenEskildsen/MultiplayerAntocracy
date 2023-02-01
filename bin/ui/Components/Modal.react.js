const React = require('react');
const Button = require('./Button.react');
const {
  isMobile,
  isIpad
} = require('../../utils/helpers');
const {
  useState,
  useEffect,
  useMemo
} = React;
function Modal(props) {
  const {
    content,
    title,
    body,
    buttons
  } = props;
  // HACK: this is not actually the height used by the css style
  const height = props.height ? props.height : 450;

  // Proper positioning
  const rect = useMemo(() => {
    return document.getElementById('container').getBoundingClientRect();
  }, [window.innerWidth, window.innerHeight]);
  const buttonHTML = buttons.map(b => {
    return /*#__PURE__*/React.createElement(Button, {
      key: "b_" + b.label,
      disabled: !!b.disabled,
      label: b.label,
      onClick: b.onClick
    });
  });
  const width = props.width ? props.width : Math.min(rect.width * 0.8, 350);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      backgroundColor: 'whitesmoke',
      border: '1px solid black',
      padding: 4,
      boxShadow: '2px 2px #666666',
      borderRadius: 3,
      color: '#46403a',
      textAlign: 'center',
      height: props.height ? props.height : 'auto',
      width,
      top: isMobile() && !isIpad() ? 0 : (rect.height - height) / 2,
      left: isMobile() && !isIpad() ? 0 : (rect.width - width) / 2,
      overflowY: 'scroll',
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("h3", null, /*#__PURE__*/React.createElement("b", null, title)), body, /*#__PURE__*/React.createElement("div", {
    style: {}
  }, buttonHTML));
}
module.exports = Modal;