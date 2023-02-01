
const React = require('react');

function ItchWidget(props) {
  return (
    <div
      style={{
        margin: 'auto',
      }}
    ><iframe
      frameBorder="0"
      src="https://itch.io/embed/1022206?linkback=true"
      width="552" height="167"
    >
      <a href="https://beneskildsen.itch.io/antocracy-campaign">
        Antocracy Campaign by Ben Eskildsen
      </a>
    </iframe>
      <div
        style={{
          marginTop: '8px',
        }}
      >
        For the full campaign mode please purchase above or demo for free below:
      </div>
    </div>
  );
}

module.exports = ItchWidget;
