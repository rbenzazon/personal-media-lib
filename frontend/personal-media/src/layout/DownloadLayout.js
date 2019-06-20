import React, { Component} from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {PlaylistContext} from '../PlaylistContext';
import DownloadList from './DownloadList';
import RouteDispatch from '../RouteDispatch';

const styles = theme => ({
});



export class DownloadLayout extends Component {
    static contextType = PlaylistContext;
    static defaultProps = {
        classes: {},
        classNames: {},
    };
    render(){
        return(
            <PlaylistContext.Consumer>{(context) => (
            <React.Fragment>
                <RouteDispatch onRouteMount={context.onRouteMount} match={{match:this.props.match,history:this.props.history}}/>
                <DownloadList />
            </React.Fragment>
            )}</PlaylistContext.Consumer>
        );
    }
}
DownloadLayout.propTypes = {
    classes: PropTypes.object.isRequired
};
export default withStyles(styles)(DownloadLayout);