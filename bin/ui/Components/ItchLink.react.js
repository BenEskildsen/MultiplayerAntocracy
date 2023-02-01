const {
  isElectron
} = require('../../utils/helpers');
const React = require('react');
function ItchLink(props) {
  const {
    campaignLink,
    label
  } = props;

  // NOTE: make sure to also change ItchWidget.react
  const electronLink = "https://beneskildsen.itch.io/antocracy-campaign";
  const webLink = "https://beneskildsen.itch.io/antocracy";
  return /*#__PURE__*/React.createElement("b", null, /*#__PURE__*/React.createElement("a", {
    id: "benhub",
    style: {
      textDecoration: 'none'
    },
    href: isElectron() || campaignLink ? electronLink : webLink,
    target: "_blank"
  }, label != null ? label : "itch.io profile"));
}
module.exports = ItchLink;