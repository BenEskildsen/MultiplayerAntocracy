// @flow

const React = require('react');
const Button = require('./Button.react');
const {isMobile, isIpad} = require('../../utils/helpers');
const {useState, useEffect, useMemo} = React;

type Props = {
  title: ?string,
  body: ?string,
  buttons: Array<{
    label: string,
    onClick: () => void,
  }>,
  height: ?number,
  noTypeWriter: ?boolean,
};

const smantSrc = 'img/Smant1.png';

function SmantModal(props: Props): React.Node {
  const {title, body, buttons, noTypeWriter} = props;
  const height = props.height ? props.height : 450;

  // Proper positioning
  const rect = useMemo(() => {
    return document.getElementById('container').getBoundingClientRect();
  }, [window.innerWidth, window.innerHeight]);

  const width = props.width ? props.width : Math.min(rect.width * 0.8, 350);
  const smantWidth = 300;
  const smantHeight = 400;
  const smantPadding = 5;
  const numFrames = 4;
  const [frame, setFrame] = useState(0);
  const [leftPos, setLeftPos] = useState(-1 * smantWidth);
  const [bodyIndex, setBodyIndex] = useState(noTypeWriter ? body.length : 0);

  // ease in animation
  useEffect(() => {
    let interval = null;
    if (leftPos < 0) {
      interval = setTimeout(() => setLeftPos(leftPos + 30), 50)
    }
    return () => clearTimeout(interval)
  }, [leftPos]);

  // frame animation
  useEffect(() => {
    if (leftPos < 0) return;
    let interval = setTimeout(() => setFrame((frame + 1) % numFrames), 300);
    return () => clearTimeout(interval)
  }, [leftPos, frame]);

  // typewriter animation
  useEffect(() => {
    if (leftPos < 0) return;
    let interval = null;
    if (bodyIndex < body.length) {
      interval = setTimeout(() => setBodyIndex(bodyIndex + 1), 20)
    }
    return () => clearTimeout(interval)
  }, [leftPos, bodyIndex]);

  const bodyHTML = [];
  for (let i = 0; i < body.length; i++) {
    bodyHTML.push(
      <span
        style={{visibility: i < bodyIndex ? 'inherit' : 'hidden'}}
        key={"body_letter_" + i}
      >
        {body[i]}
      </span>
    );
  }

  const buttonHTML = useMemo(() => {
    if (bodyIndex < body.length) return null;
    return buttons.map(b => {
      return (<Button
        key={"b_" + b.label}
        disabled={!!b.disabled}
        label={b.label} onClick={b.onClick}
      />);
    });
  }, [bodyIndex, buttons]);

  return (
    <span>
    <div
      style={{
        visibility: leftPos < 0 ? 'hidden' : 'visible',
        position: 'absolute',
        backgroundColor: 'whitesmoke',
        border: '1px solid black',
        padding: 4,
        boxShadow: '-2px -2px #666666',
        borderRadius: 3,
        color: '#46403a',
        textAlign: 'center',
        width,
        height: isMobile() && !isIpad() ? Math.min(window.innerHeight, 420) : 'auto',
        top: isMobile() && !isIpad() ? 0 : (rect.height - smantHeight - 200),
        left: (isMobile() && !isIpad()
          ? 0
          : rect.width - smantWidth - width - 20),
        zIndex: 5,
        overflowY: 'scroll',
      }}
    >
      <h3><b>{title}</b></h3>
        {typeof body == 'string' ? bodyHTML : body}
      <div
        style={{

        }}
      >
        {buttonHTML}
      </div>
    </div>
      <div
        style={{
          position: 'absolute',
          width: smantWidth,
          height: smantHeight,
          left: rect.width - (smantWidth + leftPos),
          top: rect.height - smantHeight,
          boxShadow: '-2px -2px #666666',
          borderRadius: '9px 2px 2px 2px',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            overflow: 'hidden',
            width: '100%',
            height: '100%',
          }}
        >
          <img
            style={{
              position: 'absolute',
              top: 0,
              left: -1 * frame * smantWidth,
              height: '100%',
              imageRendering: leftPos < 0 ? 'auto' : 'pixelated',
              background: 'rgba(200,200,200, 0.6)',
              borderRadius: '9px 2px 2px 2px',
              padding: smantPadding,
              zIndex: 3,
            }}
            src={smantSrc}
          />
        </div>
      </div>
    </span>
  );
}

module.exports = SmantModal;
