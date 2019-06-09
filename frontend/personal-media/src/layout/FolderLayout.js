import React, { Component} from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {PlaylistContext} from '../PlaylistContext';
import Playlist from './Playlist';
import RouteDispatch from '../RouteDispatch';
import { Route } from "react-router-dom";
import ArtistCard from '../cards/ArtistCard'
import AlbumCard from '../cards/AlbumCard'
import SearchCard from '../cards/SearchCard';
import FolderCard from '../cards/FolderCard';

const styles = theme => ({
});



export class FolderLayout extends Component {
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
                
                
                <Route strict exact path='/folder/*' render={(props) => <FolderCard {...props} />} />
                <Route strict exact path='/favorite' render={(props) => <FolderCard {...props} />} />
                <Route strict exact path='/playlist/:playlistName' render={(props) => <FolderCard {...props} />} />
                <Route strict exact path='/genre/:genreName' render={(props) => <FolderCard {...props} />} />
                <Route strict exact path='/artist/:artistName' render={(props) => <ArtistCard {...props} />} />
                <Route strict exact path='/album/:albumName' render={(props) => <AlbumCard {...props} />} />
                <Route strict exact path='/search/:searchKeyword' render={(props) => <SearchCard {...props} />} />
                <Playlist />
                
                
                
            </React.Fragment>
            )}</PlaylistContext.Consumer>
        );
    }
}
FolderLayout.propTypes = {
    classes: PropTypes.object.isRequired
};
export default withStyles(styles)(FolderLayout);