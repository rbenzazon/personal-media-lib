import React, { Component} from 'react';
import {AppBar} from '@material-ui/core';
import {Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,Button,List,ListItem,Collapse,ListItemText} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {PlaylistContext} from './PlaylistContext';
import AudioPlayer from './AudioPlayer/AudioPlayer.js';
import PLAppBar from './PLAppBar';
import PLDrawer from './PLDrawer';
import RouteDispatch from './RouteDispatch';

const styles = theme => ({
    appBar: {
        top: 'auto',
        bottom: 0,
        backgroundColor: theme.palette.background.default,
    },
    nestedItem:{
        paddingLeft:'3em',
    },
    nestedText:{
        fontSize:'0.9em !important',
    },
});

export class HomeLayout extends Component {
    static contextType = PlaylistContext;
    static defaultProps = {
        classes: {},
        classNames: {},
    };
    constructor(props){
        super(props);
        this.artistsClick = this.artistsClick.bind(this);
        this.albumsClick = this.albumsClick.bind(this);
    }
    state = {
        albumsOpen:false,
        artistsOpen:false,
    }

    artistsClick(){
        this.setState({artistsOpen:true,albumsOpen:false});
    }
    albumsClick(){
        this.setState({artistsOpen:false,albumsOpen:true});
    }

    render(){
        const {
            classes,
        } = this.props;
        return(
        
        
            <PlaylistContext.Consumer>{(context) => (
            <React.Fragment>
                <RouteDispatch onRouteMount={context.onRouteMount} match={{match:this.props.match,history:this.props.history}}/>
                <PLAppBar />
                <List>
                    <ListItem button onClick={this.artistsClick} >
                        <ListItemText inset primary="Artists" />
                    </ListItem>
                    <Collapse in={this.state.artistsOpen}>
                        <List component="div" disablePadding >
                            {context.getAllTrackPropValues("artist").map(artist =>
                            <ListItem className={classes.nestedItem} button onClick={() => context.linkTo("/artist/"+artist)}>
                                <ListItemText inset primary={artist} classes={{ primary: classes.nestedText }}/>
                            </ListItem>
                            )}
                        </List>
                    </Collapse>
                    <ListItem button onClick={this.albumsClick} >
                        <ListItemText inset primary="Albums" />
                    </ListItem>
                    <Collapse in={this.state.albumsOpen} disablePadding>
                        <List component="div" disablePadding >
                            {context.getAllTrackPropValues("album").map(album =>
                            <ListItem className={classes.nestedItem} button onClick={() => context.linkTo("/album/"+album)}>
                                <ListItemText inset primary={album} classes={{ primary: classes.nestedText }} />
                            </ListItem>
                            )}
                        </List>
                    </Collapse>
                </List>
                <PLDrawer />
                <AppBar position="fixed" className={classes.appBar}>
                    <AudioPlayer
                        autoPlay={false}
                        rounded={true}
                        //elevation={1}
                        width="100%"
                        showLoopIcon={false}
                        onAudioEnd={()=>context.onAudioEnd()}
                    />
                </AppBar>
                <Dialog
                    open={context.state.createPlaylistOpen}
                    onClose={() => context.onCreatePlaylistClose()}
                    aria-labelledby="create playlist"
                    aria-describedby="create a new playlist to store your tracks"
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
        
        
        );
    }
}
HomeLayout.propTypes = {
    classes: PropTypes.object.isRequired
};
export default withStyles(styles)(HomeLayout);