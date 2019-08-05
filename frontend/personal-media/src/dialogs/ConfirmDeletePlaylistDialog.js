import React, { Component } from 'react';
import {Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,Button} from '@material-ui/core';
import {PlaylistContext} from '../PlaylistContext';

export class ConfirmDeletePlaylistDialog extends Component {

    render() {
        return (
            <PlaylistContext.Consumer>{(context) => (
                <Dialog
                    open={context.state.confirmDeletePlaylistOpen}
                    onClose={() => context.openConfirmDeletePlaylist(false)}
                    aria-labelledby="Confirm"
                    aria-describedby="delete playlist ?"
                    >
                    <DialogTitle id="alert-dialog-title">Confirm</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                        delete playlist {context.state.playlistToDelete != null && context.state.playlistToDelete.title} ?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => context.openConfirmDeletePlaylist(false)} color="primary">
                        Cancel
                        </Button>
                        <Button onClick={()=> context.confirmDeletePlaylist()} color="primary" autoFocus>
                        Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            )}</PlaylistContext.Consumer>
        )
    }
}

export default ConfirmDeletePlaylistDialog
