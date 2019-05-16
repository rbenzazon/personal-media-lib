import React, { Component} from 'react';
import {AppBar} from '@material-ui/core';
import {Select,MenuItem,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,Button} from '@material-ui/core';
import { withStyles, createMuiTheme,MuiThemeProvider } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import AudioPlayer from './AudioPlayer/AudioPlayer.js';
import {PlaylistContext,PlaylistProvider} from './PlaylistContext';
import PLAppBar from './PLAppBar'
import PlayList from './PlayList';
import PLDrawer from './PLDrawer'

function Log(value) {
    console.log(value);
    return null;
}

const theme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
});

const styles = theme => ({
    appBar: {
        top: 'auto',
        bottom: 0,
    },
});

class Dummy extends Component {
    componentDidMount() {
      this.props.onLayoutMount(this.props.match);
    }
    render() {
      return null;
    }
}

export class Layout extends Component {
    static contextType = PlaylistContext;
    static defaultProps = {
        classes: {},
        classNames: {},
    };

    render(){
        const {
            classes,
        } = this.props;
        return(
        
        <MuiThemeProvider theme={theme}>
            <PlaylistContext.Consumer>{(context) => (
            <React.Fragment>
                <Dummy onLayoutMount={context.onLayoutMount} match={this.props.match}/>
                
                <PLAppBar />
                <PlayList />
                <PLDrawer />
                <AppBar position="fixed" className={classes.appBar}>
                    <AudioPlayer
                        autoPlay={false}
                        rounded={true}
                        elevation={1}
                        width="100%"
                        showLoopIcon={false}
                        onAudioEnd={()=>context.onAudioEnd()}
                    />
                </AppBar>
                <Dialog
                    open={context.state.createPlaylistOpen}
                    onClose={() => context.onCreatePlaylistClose()}
                    aria-labelledby="add to playlist"
                    aria-describedby="add this track to a playlist"
                    >
                    <DialogTitle id="alert-dialog-title">Create a playlist</DialogTitle>
                    <DialogContent>
                        <input placeholder="Enter a name" value={context.state.createPlaylistName} onChange={(e) => context.onPlaylistNameChange(e.target.value)}></input>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => context.onCreatePlaylistClose()} color="secondary">
                        Cancel
                        </Button>
                        <Button onClick={() => context.createPlaylist()} color="primary" autoFocus>
                        Create
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={context.state.playlistAddOpen}
                    onClose={() => context.onAddToPlaylistClose()}
                    aria-labelledby="add to playlist"
                    aria-describedby="add this track to a playlist"
                    >
                    <DialogTitle id="alert-dialog-title">Add to playlist</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                        choose a playlist in which to add this track
                        </DialogContentText>
                        {context.state.playLists.length > 0 &&
                        <Select
                            value={context.state.playlistToAdd}
                            onChange={(e) => context.onPlaylistToAddChange(e.target.value)}
                        >
                            {context.state.playLists.map((item)=>{return(
                            <MenuItem selected={context.state.playlistToAdd === item} value={item}>{item.title}</MenuItem>
                            )})}
                        </Select>
                        }
                        {context.state.playLists.length == 0 &&
                            <Button onClick={() => {context.onAddToPlaylistClose();context.onCreatePlaylistOpenClose(true)}} color="primary" autoFocus>
                            Create playlist
                            </Button>
                        }
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => context.onAddToPlaylistClose()} color="secondary">
                        Cancel
                        </Button>
                        <Button onClick={() => context.addToPlaylist()} color="primary" autoFocus>
                        Add
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={context.state.importOpen}
                    onClose={() => context.setImportOpen(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    >
                    <DialogTitle id="alert-dialog-title">Import media</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                        Select files from your local storage
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => context.setImportOpen(false)} color="primary">
                        Cancel
                        </Button>
                        <Button onClick={() => context.setImportOpen(false)} color="primary" autoFocus>
                        Browse
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
            )}</PlaylistContext.Consumer>
        </MuiThemeProvider>
        
        );
    }
}
Layout.propTypes = {
    classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Layout);