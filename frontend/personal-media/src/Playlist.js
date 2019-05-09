import React, { Component } from 'react';
import myData from './data.json';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import AppBar from '@material-ui/core/AppBar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
//import Divider from '@material-ui/core/Divider';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {Audiotrack} from '@material-ui/icons'
import { withStyles, createMuiTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import AudioPlayer from './AudioPlayer/AudioPlayer.js';


const theme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
  });
const styles = theme => ({
    appBar: {
        top: 'auto',
        bottom: 0,
    }
});


const {tracks} = myData;

export class Playlist extends Component {
    state = {selected:tracks[0]};
    
    onListclick = (track) =>{
        console.log("toto");
        this.setState({selected:track})
    }
    onNextClick = () =>{
        console.log("next")
        const newIndex = tracks.indexOf(this.state.selected)+1;
        this.setState({selected:tracks[newIndex < tracks.length ? newIndex : 0]})
    }
    onPrevClick = () =>{
        console.log("prev")
        const newIndex = tracks.indexOf(this.state.selected)-1;
        this.setState({selected:tracks[newIndex >= 0 ? newIndex : tracks.length-1]})
    }
    render(){
        const trackList = tracks.map((track) =>
            <ListItem key={track} button selected={this.state.selected == track}>
                <ListItemIcon>
                    <Audiotrack />
                </ListItemIcon>
                <ListItemText onClick={() => this.onListclick(track)}>
                    {track.artist} - {track.title}
                </ListItemText>
            </ListItem>
        );
        return(
        <MuiThemeProvider theme={theme}>
            <React.Fragment>
                  <AppBar position="static" color="default">
                    <Toolbar>
                    <Typography variant="h6" color="inherit">
                      Tracks
                    </Typography>
                    </Toolbar>
                  </AppBar>
                  <List>{trackList}</List>
                  <AppBar position="fixed" className={this.props.classes.appBar}>
                    <AudioPlayer
                      src={this.state.selected.url}
                      title={this.state.selected.title}
                      artist={this.state.selected.artist}
                      autoPlay={false}
                      rounded={true}
                      elevation={1}
                      width="100%"
                      showLoopIcon={false}
                      onPrevClick={() => this.onPrevClick()}
                      onNextClick={() => this.onNextClick()}
                    />
                  </AppBar>
              </React.Fragment>
        </MuiThemeProvider>
        );
    }
}
Playlist.propTypes = {
    classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Playlist);