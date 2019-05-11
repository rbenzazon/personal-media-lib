import React, { Component } from 'react';
import myData from './data.json';
import {AppBar,List,ListItem,ListItemIcon,ListItemText,Toolbar,Typography,ListItemAvatar,Avatar} from '@material-ui/core';
import {Audiotrack,Folder as FolderIcon, ArrowBack as BackIcon} from '@material-ui/icons'
import { withStyles, createMuiTheme,MuiThemeProvider } from '@material-ui/core/styles';
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

    state = {
        currentFolder:tracks,
        parentFolders:[],
        selected:tracks.children.filter(track => !track.children)[0]
    };

    /**
     * @track : undefined, track, track may contain a children array prop
     */
    onListclick = (track) =>{
        if(track === undefined){
            let parents = [...this.state.parentFolders];
            const newCurrent = parents.splice(parents.length-1, 1)[0];
            this.setState({currentFolder:newCurrent,parentFolders:parents});
        }else if(track.children){
            let parents = [...this.state.parentFolders];
            parents.push(this.state.currentFolder);
            this.setState({currentFolder:track,parentFolders:parents});
        }else{
            this.setState({selected:track});
        }
    }

    onNextClick = () =>{
        const {children} = this.state.currentFolder;
        const index = children.indexOf(this.state.selected)+1;
        const boundaries = index === children.length ? 0 : index;
        for(let newIndex = boundaries;newIndex < children.length;newIndex++){
            if(!children[newIndex].children){
                this.setState({selected:children[newIndex]});
                return;
            }
        }
        
    }

    onPrevClick = () =>{
        const {children} = this.state.currentFolder;
        const index = children.indexOf(this.state.selected) -1;
        const boundaries = index < 0 ? children.length-1 : index;
        for(let newIndex = boundaries;newIndex >= 0;newIndex--){
            if(!children[newIndex].children){
                this.setState({selected:children[newIndex]});
                return;
            }
        }
    }

    render(){

        const trackList = this.state.currentFolder.children.map((track) =>
            <ListItem key={track} button selected={this.state.selected === track}>
                <ListItemIcon>
                    {(track.children && <FolderIcon />) || (!track.children && <Audiotrack />)}
                </ListItemIcon>
                {track.imageUrl && <ListItemAvatar>
                    <Avatar src={track.imageUrl} />
                </ListItemAvatar>}
                <ListItemText onClick={() => this.onListclick(track)}>
                    {track.children ? track.title : track.title +" - " +track.album+" - "+track.year+" - "+track.artist+" - "+track.trackNumber}
                </ListItemText>
            </ListItem>
        );
        
        return(
        <MuiThemeProvider theme={theme}>
            <React.Fragment>
                  <AppBar position="static" color="default">
                    <Toolbar>
                    <Typography variant="h6" color="inherit">
                      {this.state.currentFolder.title}
                    </Typography>
                    </Toolbar>
                  </AppBar>
                  <List>
                  {tracks !== this.state.currentFolder && 
                    <ListItem key={'back'} button >
                      <ListItemIcon>
                          <BackIcon/>
                      </ListItemIcon>
                      <ListItemText onClick={() => this.onListclick()}>
                          back to {this.state.parentFolders[this.state.parentFolders.length-1].title}
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