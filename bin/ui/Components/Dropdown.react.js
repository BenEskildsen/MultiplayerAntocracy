const React = require('react');

/**
 * Props:
 * options: Array<string>
 * displayOptions: ?Array<string>
 * selected: string // which option is selected
 * onChange: (string) => void
 * style: ?Object
 */
const Dropdown = function (props) {
  const {
    options,
    selected,
    onChange,
    displayOptions,
    style
  } = props;
  const optionTags = options.map((option, i) => {
    const label = displayOptions != null && displayOptions[i] != null ? displayOptions[i] : option;
    return /*#__PURE__*/React.createElement("option", {
      key: 'option_' + option,
      value: option
    }, label);
  });
  return /*#__PURE__*/React.createElement("select", {
    onChange: ev => {
      const val = ev.target.value;
      onChange(val);
    },
    value: selected,
    style: style || {}
  }, optionTags);
};
module.exports = Dropdown;