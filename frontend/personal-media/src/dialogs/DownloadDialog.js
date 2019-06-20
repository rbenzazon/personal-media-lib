import React, { Component } from 'react';
import {Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,Button} from '@material-ui/core';
import {PlaylistContext} from '../PlaylistContext';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const styles = theme => ({
    input:{
        width:'100%',
        color:theme.palette.secondary.contrastText,
    },
    status:{
        fontSize:'0.9rem !important',
        color:theme.palette.secondary.contrastText,
    },
    errorStatus:{
        fontSize:'0.9rem !important',
        color:theme.palette.secondary.dark,
    },
    cancelButton:{
        color:theme.palette.secondary.contrastText,
    },
});

export class DownloadDialog extends Component {
    state = {
        magnet:"",
    }

    static defaultProps = {
        classes: {},
    };

    constructor(props){
        super(props);
        this.onMagnetChange = this.onMagnetChange.bind(this);
    }

    onMagnetChange(newValue){
        this.setState({magnet:newValue});
    }

    async sendDownloadIntent(context){
        const res = await fetch(process.env.REACT_APP_SERV_URL+'api/addDownload', {
            method: 'POST',
            credentials:'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({
                magnet:this.state.magnet,
            }),
        })
        
        const jsonBody = await res.json();
        if(!res.ok){
            
            console.log("couldn't add download");
        }else{
            this.setState({magnet:""});
            context.openDownload(false);
            context.linkTo("/download");
        }
    }
    render() {
        const {
            classes,
        } = this.props;
        return (
            <PlaylistContext.Consumer>{(context) => (
                <Dialog
                    open={context.state.downloadOpen}
                    onClose={() => context.openDownload(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    >
                    <DialogTitle id="alert-dialog-title">Add download</DialogTitle>
                    
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                        Paste here the magnet link
                        </DialogContentText>
                        <form noValidate autoComplete="off">
                            <TextField 
                                label="magnet"
                                value={this.state.magnet}
                                onChange={(e) => this.onMagnetChange(e.target.value)}
                                className={classes.input}
                            />
                        </form> 
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => context.openDownload(false)} color="primary">
                        Cancel
                        </Button>
                        <Button onClick={() => this.sendDownloadIntent(context)} color="primary" autoFocus>
                        Browse
                        </Button>
                    </DialogActions>
                </Dialog>
            )}</PlaylistContext.Consumer>
        )
    }
}

DownloadDialog.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(DownloadDialog);
