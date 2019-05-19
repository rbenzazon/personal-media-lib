import { lighten } from '@material-ui/core/styles/colorManipulator';

const getColor = (theme, type, opacity) => {
  const color =
    theme.palette[type][theme.palette.type === 'light' ? 'main' : 'dark'];

  if (!opacity) {
    return color;
  }

  return lighten(color, opacity);
};

const getGreyColor = (theme, opacity) => {
  const greyColor = theme.palette.grey['500'];

  if (!opacity) {
    return greyColor;
  }

  return lighten(greyColor, opacity);
};

export default theme => ({
  sliderContainer: {
    width: "100px",
    padding: "10px",
  },
  volumeToolTip: {
    'background-color': getGreyColor(theme, 0.75),
  },
  sliderVol: {
    paddingTop: "10px",
    paddingBottom: "10px"
  },
  'player-container': {
    backgroundColor:'transparent',
    padding: '0',
    borderRadius:'0px !important'
  },
  'player-default-icon': {
    padding: '0px 10px',
    margin: '0px',
    width: '27px',
    height: '27px',
    fill: `${getColor(theme, 'primary')} !important`,
    color: `${getColor(theme, 'primary')} !important`,
    '&:hover': {
      fill: `${getColor(theme, 'primary', 0.25)} !important`,
      color: `${getColor(theme, 'primary', 0.25)} !important`,
    },
  },
  'player-icon-disabled': {
    padding: '0px 10px',
    margin: '0px',
    width: '27px',
    height: '27px',
    fill: getGreyColor(theme),
    color: getGreyColor(theme),
    '&:hover': {
      fill: getGreyColor(theme, 0.25),
      color: getGreyColor(theme, 0.25),
    },
  },
  'player-main-icon': {
    fill: `${getColor(theme, 'secondary')} !important`,
    color: `${getColor(theme, 'secondary')} !important`,
    '&:hover': {
      fill: `${getColor(theme, 'secondary', 0.25)} !important`,
      color: `${getColor(theme, 'secondary', 0.25)} !important`,
    },
  },
  'player-vol-slider-container': {
    
    'background-color': getColor(theme, 'secondary'),
  },
  'player-slider-container': {
    padding: "1em 0px",
    width: 'auto !important',
    'border-radius': '4px',
  },
  'player-slider-track': {
    'background-color': getColor(theme, 'primary'),
  },
  'player-slider-thumb': {
    'background-color': getColor(theme, 'secondary'),
  },
  'player-text': {
    color: theme.palette.secondary.contrastText,
    margin: '5px'
  },
});
