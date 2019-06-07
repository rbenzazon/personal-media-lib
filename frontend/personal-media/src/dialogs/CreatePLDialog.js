import React, { Component } from 'react'
import {Dialog,DialogActions,DialogContent,DialogTitle,Button} from '@material-ui/core';
import {PlaylistContext} from '../PlaylistContext';

export class CreatePLDialog extends Component {
    render() {
        return (
            <PlaylistContext.Consumer>{(context) => (
                <Dialog
                    open={context.state.createPlaylistOpen}
                    onClose={() => context.onCreatePlaylistOpenClose(false)}
                    aria-labelledby="add to playlist"
                    aria-describedby="add this track to a playlist"
                    >
                    <DialogTitle id="alert-dialog-title">Create a playlist</DialogTitle>
                    <DialogContent>
                        <input placeholder="Enter a name" value={context.state.createPlaylistName} onChange={(e) => context.onPlaylistNameChange(e.target.value)}></input>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => context.onCreatePlaylistOpenClose(false)} color="secondary">
                        Cancel
                        </Button>
                        <Button onClick={() => context.createPlaylist()} color="primary" autoFocus>
                        Create
                        </Button>
                    </DialogActions>
                </Dialog>
            )}</PlaylistContext.Consumer>
        )
    }
}

export default CreatePLDialog
