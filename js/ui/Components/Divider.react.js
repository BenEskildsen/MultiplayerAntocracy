// @flow

const React = require('react');

type Props = {
  style: ?Object,
};

function Divider(props: Props): React.Node {
  const additionalStyle = props.style ? props.style : {};
  return (
    <div
      style={{
        width: '100%',
        height: '0px',
        border: '1px solid black',
        ...additionalStyle,
      }}
    >
    </div>
  );
}

module.exports = Divider;
