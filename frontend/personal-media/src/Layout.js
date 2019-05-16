import React, { Component} from 'react';
import {AppBar} from '@material-ui/core';
import {Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,Button} from '@material-ui/core';
import { withStyles, createMuiTheme,MuiThemeProvider } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import AudioPlayer from './AudioPlayer/AudioPlayer.js';
import {PlaylistContext} from './PlaylistContext';
import PLAppBar from './PLAppBar'
import PlayList from './PlayList';
import PLDrawer from './PLDrawer'

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
                    open={context.importOpen}
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