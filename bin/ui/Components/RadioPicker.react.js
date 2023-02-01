const React = require('react');

// props:
// options: Array<string>
// selected: string
// onChange: (option) => void

class RadioPicker extends React.Component {
  render() {
    const optionToggles = [];
    for (const option of this.props.options) {
      optionToggles.push( /*#__PURE__*/React.createElement("div", {
        key: 'radioOption_' + option,
        className: "radioOption"
      }, option, /*#__PURE__*/React.createElement("input", {
        type: "radio",
        className: "radioCheckbox",
        value: option,
        checked: option === this.props.selected,
        onChange: () => this.props.onChange(option)
      })));
    }
    return /*#__PURE__*/React.createElement("div", null, optionToggles);
  }
}
module.exports = RadioPicker;