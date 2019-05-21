import React, { Component} from 'react';
import {AppBar} from '@material-ui/core';
import {Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,Button,List,ListItem,Collapse,ListItemText} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {PlaylistContext} from './PlaylistContext';
import PLAppBar from './PLAppBar';
import PLDrawer from './PLDrawer';
import RouteDispatch from './RouteDispatch';

const styles = theme => ({
    nestedItem:{
        paddingLeft:'2rem',
    },
    nestedText:{
        fontSize:'0.9rem !important',
        maxWidth:'100%',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
        overflow: 'hidden',
    },
    list:{
        marginBottom: '4rem',
        backgroundColor: theme.palette.background.paper,
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
        this.genresClick = this.genresClick.bind(this);
    }
    state = {
        albumsOpen:false,
        artistsOpen:false,
        genresOpen:false,
    }
    
    genresClick(){
        this.setState(state=>{return {genresOpen:!state.genresOpen,albumsOpen:false,artistsOpen:false}});
    }

    artistsClick(){
        this.setState(state=>{return {artistsOpen:!state.artistsOpen,albumsOpen:false,genresOpen:false}});
    }
    albumsClick(){
        this.setState(state=>{return {albumsOpen:!state.albumsOpen,artistsOpen:false,genresOpen:false}});
    }

    render(){
        const {
            classes,
        } = this.props;
        return(
        
        
            <PlaylistContext.Consumer>{(context) => (
            <React.Fragment>
                <RouteDispatch onRouteMount={context.onRouteMount} match={{match:this.props.match,history:this.props.history}}/>
                
                <div style={{padding:'20px'}}>
                <List className={classes.list}>
                    <ListItem button onClick={this.artistsClick} >
                        <ListItemText primary="Artists" />
                    </ListItem>
                    <Collapse in={this.state.artistsOpen}>
                        <List component="div" disablePadding >
                            {context.getAllTrackPropValues("artist").map(artist =>
                            <ListItem className={classes.nestedItem} button onClick={() => context.linkTo("/artist/"+encodeURIComponent(artist))}>
                                <ListItemText primary={artist} classes={{ primary: classes.nestedText }}/>
                            </ListItem>
                            )}
                        </List>
                    </Collapse>
                    <ListItem button onClick={this.albumsClick} >
                        <ListItemText primary="Albums" />
                    </ListItem>
                    <Collapse in={this.state.albumsOpen} disablePadding>
                        <List component="div" disablePadding >
                            {context.getAllTrackPropValues("album").map(album =>
                            <ListItem className={classes.nestedItem} button onClick={() => context.linkTo("/album/"+encodeURIComponent(album))}>
                                <ListItemText primary={album} classes={{ primary: classes.nestedText }} />
                            </ListItem>
                            )}
                        </List>
                    </Collapse>
                    <ListItem button onClick={this.genresClick} >
                        <ListItemText primary="Genre" />
                    </ListItem>
                    <Collapse in={this.state.genresOpen} disablePadding>
                        <List component="div" disablePadding >
                            {context.getAllTrackPropValues("genre").map(genre =>
                            <ListItem className={classes.nestedItem} button onClick={() => context.linkTo("/genre/"+encodeURIComponent(genre))}>
                                <ListItemText primary={genre} classes={{ primary: classes.nestedText }} />
                            </ListItem>
                            )}
                        </List>
                    </Collapse>
                </List>
                </div>
                <PLDrawer />
                
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