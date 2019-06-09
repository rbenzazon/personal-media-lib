import React, { Component } from 'react';
import {Select,MenuItem,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,Button} from '@material-ui/core';
import {PlaylistContext} from '../PlaylistContext';


export class AddToPLDialog extends Component {
    constructor(props){
        super(props);
        this.state={
            playlistToAdd:null,
        }
        this.onPlaylistToAddChange = this.onPlaylistToAddChange.bind(this);
    }
    onPlaylistToAddChange(value){
        this.setState({playlistToAdd:value});
    }
    render() {
        return (
            <PlaylistContext.Consumer>{(context) => (
                <Dialog
                    open={context.state.playlistAddOpen}
                    onClose={() => context.closeAddToPlaylist()}
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
                            value={this.state.playlistToAdd}
                            onChange={(e) => this.onPlaylistToAddChange(e.target.value)}
                        >
                            {context.state.playLists.map((item)=>{return(
                            <MenuItem key={item.title} selected={this.state.playlistToAdd === item} value={item}>{item.title}</MenuItem>
                            )})}
                        </Select>
                        }
                        {context.state.playLists.length === 0 &&
                            <Button onClick={() => {context.closeAddToPlaylist()}} color="primary" autoFocus>
                            Create playlist
                            </Button>
                        }
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => context.closeAddToPlaylist()} color="secondary">
                        Cancel
                        </Button>
                        <Button onClick={() => context.addToPlaylist(this.state.playlistToAdd)} color="primary" autoFocus>
                        Add
                        </Button>
                    </DialogActions>
                </Dialog>
            )}</PlaylistContext.Consumer>
        )
    }
}

export default AddToPLDialog
