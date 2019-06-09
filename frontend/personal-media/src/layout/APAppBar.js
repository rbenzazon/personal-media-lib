import React,{ Component} from 'react';
import {AppBar} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {PlaylistContext} from '../PlaylistContext';
import AudioPlayer from '../AudioPlayer/AudioPlayer.js';


const styles = theme => ({
    appBar: {
        flexShrink: '0',
        backgroundColor: theme.palette.background.default,
    },
});

class APAppBar extends Component {
    static contextType = PlaylistContext;
    static defaultProps = {
        classes: {},
    };
    render() {
        const {
            classes,
        } = this.props;
        return(
        <PlaylistContext.Consumer>{(context) => (
        <AppBar position="relative" className={classes.appBar}>
            <AudioPlayer
                autoPlay={false}
                rounded={true}
                //elevation={1}
                width="100%"
                showLoopIcon={false}
                onAudioEnd={()=>context.onAudioEnd()}
            />
        </AppBar>
        )}</PlaylistContext.Consumer>
        )
    }
}
APAppBar.propTypes = {
    classes: PropTypes.object.isRequired
};
export default withStyles(styles)(APAppBar);