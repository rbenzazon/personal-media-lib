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
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { AudioPlayer } from '@blackbox-vision/mui-audio-player';

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
    render(){
        const trackList = tracks.map((track) =>
            <ListItem button>
                <ListItemIcon>
                    <Audiotrack />
                </ListItemIcon>
                <ListItemText onClick={() => this.onListclick(track)}>
                    {track.artist} - {track.title}
                </ListItemText>
            </ListItem>
        );
        return(
        <MuiThemeProvider>
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
                      autoPlay={true}
                      rounded={true}
                      elevation={1}
                      width="100%"
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