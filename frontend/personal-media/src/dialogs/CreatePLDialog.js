import React, { Component } from 'react'
import {Dialog,DialogActions,DialogContent,DialogTitle,Button} from '@material-ui/core';
import {PlaylistContext} from '../PlaylistContext';

export class CreatePLDialog extends Component {
    constructor(props){
        super(props);
        this.state={
            createPlaylistName:'',
        }
        this.createPlaylist = this.createPlaylist.bind(this);
        this.onPlaylistNameChange = this.onPlaylistNameChange.bind(this);
    }
    onPlaylistNameChange(name){
        this.setState({createPlaylistName:name});
    }
    async createPlaylist(){
        const config = {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({fileListName:this.state.createPlaylistName})
        }
        const res = await fetch(process.env.REACT_APP_SERV_URL+"api/createFileList",config);
        if(!res.ok) return;
        const succes = await res.json();
        this.props.onCreatePlaylistSuccess(this.state.createPlaylistName);
        this.setState({createPlaylistName:''});
    }
    render() {
        return (
            <PlaylistContext.Consumer>{(context) => (
                <Dialog
                    open={context.state.createPlaylistOpen}
                    onClose={() => context.openCreatePlaylist(false)}
                    aria-labelledby="add to playlist"
                    aria-describedby="add this track to a playlist"
                    >
                    <DialogTitle id="alert-dialog-title">Create a playlist</DialogTitle>
                    <DialogContent>
                        <input placeholder="Enter a name" value={this.state.createPlaylistName} onChange={(e) => this.onPlaylistNameChange(e.target.value)}></input>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => context.openCreatePlaylist(false)} color="secondary">
                        Cancel
                        </Button>
                        <Button onClick={() => this.createPlaylist()} color="primary" autoFocus>
                        Create
                        </Button>
                    </DialogActions>
                </Dialog>
            )}</PlaylistContext.Consumer>
        )
    }
}

export default CreatePLDialog
