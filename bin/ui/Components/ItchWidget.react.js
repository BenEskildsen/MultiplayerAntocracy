const React = require('react');
function ItchWidget(props) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      margin: 'auto'
    }
  }, /*#__PURE__*/React.createElement("iframe", {
    frameBorder: "0",
    src: "https://itch.io/embed/1022206?linkback=true",
    width: "552",
    height: "167"
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://beneskildsen.itch.io/antocracy-campaign"
  }, "Antocracy Campaign by Ben Eskildsen")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '8px'
    }
  }, "For the full campaign mode please purchase above or demo for free below:"));
}
module.exports = ItchWidget;