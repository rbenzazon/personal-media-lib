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
import {Audiotrack,Folder as FolderIcon, ArrowBack as BackIcon} from '@material-ui/icons'
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
let currentFolder = tracks;
let parentFolders = [];

export class Playlist extends Component {
    state = {selected:currentFolder.children[0]};
    
    onListclick = (track) =>{
        console.log("toto");
        if(track === undefined){
            currentFolder = parentFolders.pop();
            if(currentFolder.children.length >=1){
                this.setState({selected:currentFolder.children[0]})
            }else{
                this.setState({selected:null})
            }
        }else if(track.children){
            parentFolders.push(currentFolder);
            currentFolder = track;
            if(currentFolder.children.length >=1){
                this.setState({selected:currentFolder.children[0]})
            }else{
                this.setState({selected:null})
            }
        }else{
            this.setState({selected:track})
        }
    }
    onNextClick = () =>{
        console.log("next")
        const newIndex = currentFolder.indexOf(this.state.selected)+1;
        this.setState({selected:currentFolder[newIndex < currentFolder.length ? newIndex : 0]})
    }
    onPrevClick = () =>{
        console.log("prev")
        const newIndex = currentFolder.indexOf(this.state.selected)-1;
        this.setState({selected:currentFolder[newIndex >= 0 ? newIndex : currentFolder.length-1]})
    }
    render(){
        const trackList = currentFolder.children.map((track) =>
            <ListItem key={track} button selected={this.state.selected == track}>
                <ListItemIcon>
                    {track.children && <FolderIcon />}
                    {!track.children && <Audiotrack />}
                </ListItemIcon>
                <ListItemText onClick={() => this.onListclick(track)}>
                    {track.children ? track.title : track.title +" - " +track.album+" - "+track.artist}
                </ListItemText>
            </ListItem>
        );
        return(
        <MuiThemeProvider theme={theme}>
            <React.Fragment>
                  <AppBar position="static" color="default">
                    <Toolbar>
                    <Typography variant="h6" color="inherit">
                      {currentFolder.title}
                    </Typography>
                    </Toolbar>
                  </AppBar>
                  <List>
                  {tracks !== currentFolder && 
                    <ListItem key={'back'} button >
                      <ListItemIcon>
                          <BackIcon/>
                      </ListItemIcon>
                      <ListItemText onClick={() => this.onListclick()}>
                          back to {parentFolders[parentFolders.length-1].title}
                      </ListItemText>
                  </ListItem>}
                  {trackList}</List>
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