const React = require('react');
const {
  config
} = require('../config');
const {
  getQueen
} = require('../selectors/misc');
const {
  isIpad
} = require('../utils/helpers');
const {
  useEffect,
  useState,
  useMemo,
  Component
} = React;
function Canvas(props) {
  const {
    dispatch,
    queen,
    innerWidth,
    innerHeight,
    isExperimental,
    megaColony
  } = props;

  // calculate max canvas width (allows canvas sizing DOWN)
  let maxHeight = Math.min(2000, innerHeight, innerWidth * 1.33);
  let maxWidth = maxHeight * 0.75;
  if (config.useFullScreen && !isExperimental) {
    maxWidth = innerWidth;
    maxHeight = innerHeight;
    let sizeMult = 0.9;
    if (maxWidth < 600 || maxHeight < 800) {
      sizeMult = 0.75;
    }
    if (maxWidth > 1000 || maxHeight > 1000) {
      sizeMult = 1.25;
    }
    if (maxWidth > 1200 || maxHeight > 1200) {
      sizeMult = 1.3;
    }
    if (megaColony) {
      sizeMult *= 0.75;
    }
    if (isIpad()) {
      sizeMult *= 0.85;
    }
    useEffect(() => {
      let viewPos = {
        x: 0,
        y: 0
      };
      const viewWidth = maxWidth / (config.cellWidth * sizeMult);
      const viewHeight = maxHeight / (config.cellHeight * sizeMult);
      if (queen != null) {
        viewPos = {
          x: queen.position.x - viewWidth / 2,
          y: queen.position.y - viewHeight / 2
        };
      }
      dispatch({
        type: 'SET_VIEW_POS',
        viewPos,
        viewWidth,
        viewHeight
      });
    }, [maxWidth, maxHeight, megaColony]);
    if (maxWidth != config.canvasWidth) {
      config.canvasWidth = maxWidth;
    }
    if (maxHeight != config.canvasHeight) {
      config.canvasHeight = maxHeight;
    }
  } else if (isExperimental) {
    // HACK: for when opening up the editor UI in game mode
    config.canvasWidth = Math.min(config.canvasWidth, 1200);
  }
  const defaultStyle = {
    height: '100%',
    width: '100%',
    maxWidth,
    maxHeight,
    margin: 'auto',
    position: 'relative'
  };
  const experimentalStyle = {
    height: config.canvasHeight,
    width: config.canvasWidth,
    maxWidth: config.canvasWidth,
    maxHeight: config.canvasHeight,
    position: 'absolute',
    top: 0,
    left: 500
  };
  return /*#__PURE__*/React.createElement("div", {
    id: "canvasWrapper",
    style: isExperimental ? experimentalStyle : defaultStyle
  }, /*#__PURE__*/React.createElement("canvas", {
    id: "canvas",
    style: {
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    width: config.canvasWidth,
    height: config.canvasHeight
  }));
}
function withPropsChecker(WrappedComponent) {
  return class PropsChecker extends Component {
    componentWillReceiveProps(nextProps) {
      Object.keys(nextProps).filter(key => {
        return nextProps[key] !== this.props[key];
      }).map(key => {
        console.log('changed property:', key, 'from', this.props[key], 'to', nextProps[key]);
      });
    }
    render() {
      return /*#__PURE__*/React.createElement(WrappedComponent, this.props);
    }
  };
}
module.exports = React.memo(Canvas);