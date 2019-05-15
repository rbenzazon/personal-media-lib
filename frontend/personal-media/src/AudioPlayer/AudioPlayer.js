import { Grid, Paper, Typography,withStyles } from '@material-ui/core';
import { Repeat as LoopStatusIcon, VolumeMute as MuteStatusIcon , SkipNextRounded as SkipNextIcon, SkipPreviousRounded as SkipPrevIcon} from '@material-ui/icons';
import { Slider } from '@material-ui/lab';
import css from 'classnames';
import React, { Fragment } from 'react';
import styles from './styles';
import { attachToEvent, getCurrentTime, getFormattedTime, getIconByPlayerStatus, getPlayerStateFromAction, getProgress, removeFromEvent } from './utils';
import Player from './utils/constants';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';
import {isMobile} from "react-device-detect";
import {PlaylistContext} from '../PlaylistContext';

/*
ts
export interface AudioPlayerClassNameProps {
  player: string;
  loopIcon: string;
  playIcon: string;
  muteIcon: string;
  slider: string;
  track: string;
  thumb: string;
  text: string;
}

export interface AudioPlayerProps {
  src: string;
  width: string;
  height: string;
  classes: object;
  rounded: boolean;
  autoPlay: boolean;
  elevation: number;
  showLoopIcon: boolean;
  classNames: AudioPlayerClassNameProps;
}
export type PROPS_WITH_STYLES = React.Component & AudioPlayerProps & AudioPlayerClassNameProps & WithStyles<"root">;*/

class AudioPlayer extends React.Component {//<PROPS_WITH_STYLES>
  static displayName = "AudioPlayer";
  static contextType = PlaylistContext;

  static defaultProps = {
    elevation: 1,
    rounded: false,
    classes: {},
    classNames: {},
    width: '500px',
    height: '50px',
    showLoopIcon: true,
  };

  player = null;

  state = {
    current: 0,
    progress: 0,
    duration: 0,
    loopStatus: Player.Status.UNLOOP,
    playStatus: Player.Status.PAUSE,
    muteStatus: Player.Status.UNMUTE,
    volume: 100,
  };

  componentDidMount() {
    attachToEvent(this.player, Player.Events.CAN_PLAY, this.handleCanPlay);
    if (this.props.autoPlay) {
      this.triggerAction(Player.Status.PLAY);
    }
  }

  componentWillUnmount() {
    if (this.player) {
      removeFromEvent(
        this.player,
        Player.Events.TIME_UPDATE,
        this.handleTimeUpdate
      );
      removeFromEvent(this.player, Player.Events.CAN_PLAY, this.handleCanPlay);
      this.player = null;
    }
  }

  //map a prop to a state update
  /*componentWillReceiveProps(nextProps) {
    if (nextProps.src !== this.state.src) {
      this.setState({ src: nextProps.src ,playStatus:Player.Status.PLAY});
      this.player.load();
      this.triggerAction(Player.Status.PLAY);
    }
    if (nextProps.title !== this.state.title) {
      this.setState({ title: nextProps.title });
    }
    if (nextProps.artist !== this.state.artist) {
      this.setState({ artist: nextProps.artist });
    }
  }*/
  render() {
    const {
      rounded,
      elevation,
      classes,
      showLoopIcon,
      classNames: {
        player,
        loopIcon,
        playIcon,
        nextIcon,
        prevIcon,
        muteIcon,
        slider,
        track,
        thumb,
        text,
      },
    } = this.props;
    const {
      loopStatus,
      playStatus,
      muteStatus,
      progress,
      current,
      duration,
      volume,
    } = this.state;

    const PlayStatusIcon = getIconByPlayerStatus(playStatus);
    
    const isLoopEnable = loopStatus === Player.Status.LOOP;
    const isMuteEnable = muteStatus === Player.Status.MUTE;
    //{this.player != undefined && this.player.load() && this.player.play() && console.log(context.selected)}
    return (
      <PlaylistContext.Consumer>{(context) => (
      <Fragment>
        <audio
          ref={node => {context.setPlayerRef(node);this.player = node}}
          preload="true"
          controls
          hidden
          volume={volume/100}
        >
          <source src={context.selected.url} />
        </audio>
        
        <Grid className={css(classes['player-container'], player)}  elevation={elevation} rounded={rounded.toString()} component={Paper} alignContent="center" justify="center" alignItems="center" spacing={16} container>
          {showLoopIcon && <Grid xs={1} item>
            <LoopStatusIcon
              className={css(classes['player-icon-disabled'], loopIcon, {
                [classes['player-default-icon']]: isLoopEnable,
              })}
              onClick={() => this.triggerAction(Player.Status.LOOP)}
              focusable="true"
            />
          </Grid>}
          <Grid item xs={isMobile ? 5 : 2} alignContent="center" justify="center" alignItems="center" container >
            <Grid xs={4} item>
              <SkipPrevIcon
                className={css(
                  classes['player-default-icon'],
                  classes['player-main-icon'],
                  prevIcon
                )}
                onClick={() => context.onPrevClick()}
                focusable="true"
              />
            </Grid>
            <Grid xs={4} item>
              <PlayStatusIcon
                className={css(
                  classes['player-default-icon'],
                  classes['player-main-icon'],
                  playIcon
                )}
                onClick={() => this.triggerAction(Player.Status.PLAY)}
                focusable="true"
              />
            </Grid>
            <Grid xs={4} item>
              <SkipNextIcon
                className={css(
                  classes['player-default-icon'],
                  classes['player-main-icon'],
                  nextIcon
                )}
                onClick={() => context.onNextClick()}
                focusable="true"
              />
            </Grid>
          </Grid>
          <Grid item xs={isMobile ? 4 : 8} container  alignContent="center" justify="center" alignItems="center" >
            <Grid item xs={12} container alignContent="center" justify="flex-start" alignItems="flex-start"  >
              <Grid xs={isMobile?12:6} item>
                <Typography
                    className={css(classes['player-text'], text)}
                    
                    noWrap
                  >
                  {context.selected.title}
                </Typography>
              </Grid>
              {!isMobile && <Grid xs={6} item>
                <Typography
                    className={css(classes['player-text'], text)}
                    
                    noWrap
                  >
                  {context.selected.artist}
                </Typography>
              </Grid>}
            </Grid>
            <Grid item xs={12} container justify="flex-start" >
              <Grid xs={isMobile?6:2} item>
                <Typography
                  className={css(classes['player-text'], text)}
                  
                  noWrap
                >
                  {getFormattedTime(current)}
                </Typography>
              </Grid>
              {!isMobile && <Grid xs={8} item>
                <Slider
                  onChange={(_, progress) =>
                    this.handleChange(progress, this.player)
                  }
                  classes={{
                    root: css(classes['player-slider-container'], slider),
                    track: css(classes['player-slider-track'], track),
                    thumb: css(classes['player-slider-thumb'], thumb),
                  }}
                  
                  color="secondary"
                  value={progress}
                />
              </Grid>
              }
              <Grid xs={isMobile ? 6 : 2} item>
                <Typography
                  className={css(classes['player-text'], text)}
                  align="right"
                  noWrap
                >
                  {getFormattedTime(duration)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid xs={isMobile ? 3 : 1} item>
          <Tooltip
          {... isMobile ? {disableHoverListener:true,enterTouchDelay:50}:{}}
          interactive
          placement="left"
          classes={{tooltip: classes.volumeToolTip}}
          title={
            <React.Fragment>
              <div className={classes.sliderContainer}>
                <Slider
                  classes={{
                    root: css(classes['player-slider-container'], slider),
                    track: css(classes['player-slider-track'], track),
                    thumb: css(classes['player-slider-thumb'], thumb),
                  }}
                  className={classes.sliderVol}
                  onChange={this.handleVolumeSliderChange}
                  value={volume}
                  open={true}
                  disableFocusListener
                  disableHoverListener
                  disableTouchListener
                  />
              </div>
            </React.Fragment>
          }>
            <MuteStatusIcon
              className={css(classes['player-icon-disabled'], muteIcon, {
                [classes['player-default-icon']]: isMuteEnable,
              })}
            />
            </Tooltip>
          </Grid>
          
        </Grid>
      </Fragment>
      )}</PlaylistContext.Consumer>
    );
  }

  triggerAction = action => {
    const newState = getPlayerStateFromAction(this.player, action);

    if (newState) {
      this.setState(newState);
    }
  };

  handleCanPlay = player => {
    attachToEvent(player, Player.Events.TIME_UPDATE, this.handleTimeUpdate);

    this.setState({
      duration: player.duration,
    });
  };

  handleTimeUpdate = player => {
    this.setState({
      current: player.currentTime,
      progress: getProgress(player.currentTime, player.duration),
    });
  };

  handleVolumeSliderChange = (e, value) => {
    this.setState({
      volume: value
    });
    if(this.player.volume !== this.state.volume/100){
      this.player.volume = this.state.volume/100;

    }
  };

  handleChange = (progress, player) => {
    if (player) {
      const currentTime = getCurrentTime(progress, player.duration);

      if (!isNaN(currentTime)) {
        player.currentTime = currentTime;
      }

      this.setState({
        progress,
        currentTime,
      });
    }
  };
}
AudioPlayer.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  classes: PropTypes.object,
  rounded: PropTypes.bool,
  autoPlay: PropTypes.bool,
  elevation: PropTypes.number,
  showLoopIcon: PropTypes.bool,
}
export default withStyles(styles, { withTheme: true })(AudioPlayer);
