const React = require('react');
function Divider(props) {
  const additionalStyle = props.style ? props.style : {};
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '0px',
      border: '1px solid black',
      ...additionalStyle
    }
  });
}
module.exports = Divider;