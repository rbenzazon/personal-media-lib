import React, { Component} from 'react';
import {List,ListItem,Collapse,ListItemText} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {PlaylistContext} from './PlaylistContext';
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
        this.loadArtists = this.loadArtists.bind(this);
        this.loadAlbum = this.loadAlbum.bind(this);
        this.loadGenre = this.loadGenre.bind(this);
        this.loadArtists();
        this.loadAlbum();
        this.loadGenre();
    }
    async loadArtists(){
        const res = await fetch(process.env.REACT_APP_SERV_URL+'api/getArtistList', {
            crossDomain:true,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        
        if(!res.ok){
            return;
        }else{
            const jsonBody = await res.json();
            this.setState({artists:jsonBody});
        }
    }
    async loadAlbum(){
        const res = await fetch(process.env.REACT_APP_SERV_URL+'api/getAlbumList', {
            crossDomain:true,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        if(!res.ok){
            return;
        }else{
            const jsonBody = await res.json();
            this.setState({albums:jsonBody});
        }
    }
    async loadGenre(){
        const res = await fetch(process.env.REACT_APP_SERV_URL+'api/getGenreList', {
            crossDomain:true,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        if(!res.ok){
            return;
        }else{
            const jsonBody = await res.json();
            this.setState({genres:jsonBody});
        }
    }
    state = {
        albumsOpen:false,
        artistsOpen:false,
        genresOpen:false,
        albums:[],
        artists:[],
        genres:[],
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
                    <ListItem button onClick={this.artistsClick} key={"artists"}>
                        <ListItemText primary="Artists" />
                    </ListItem>
                    <Collapse in={this.state.artistsOpen}>
                        <List component="div" disablepadding="true" >
                            {this.state.artists.sort((a,b)=>a<b?-1:1).map(artist =>
                            <ListItem key={artist} className={classes.nestedItem} button onClick={() => context.linkTo("/artist/"+encodeURIComponent(artist))}>
                                <ListItemText primary={artist} classes={{ primary: classes.nestedText }}/>
                            </ListItem>
                            )}
                        </List>
                    </Collapse>
                    <ListItem button onClick={this.albumsClick} key={"albums"}>
                        <ListItemText primary="Albums" />
                    </ListItem>
                    <Collapse in={this.state.albumsOpen} disablepadding="true">
                        <List component="div" disablepadding="true" >
                            {this.state.albums.sort((a,b)=>a<b?-1:1).map(album =>
                            <ListItem key={album} className={classes.nestedItem} button onClick={() => context.linkTo("/album/"+encodeURIComponent(album))}>
                                <ListItemText primary={album} classes={{ primary: classes.nestedText }} />
                            </ListItem>
                            )}
                        </List>
                    </Collapse>
                    <ListItem button onClick={this.genresClick} >
                        <ListItemText primary="Genre" />
                    </ListItem>
                    <Collapse in={this.state.genresOpen} disablepadding="true">
                        <List component="div" disablepadding="true" >
                            {this.state.genres.sort((a,b)=>a<b?-1:1).map(genre =>
                            <ListItem key={genre} className={classes.nestedItem} button onClick={() => context.linkTo("/genre/"+encodeURIComponent(genre))}>
                                <ListItemText primary={genre} classes={{ primary: classes.nestedText }} />
                            </ListItem>
                            )}
                        </List>
                    </Collapse>
                </List>
                </div>
            </React.Fragment>
            )}</PlaylistContext.Consumer>
        
        
        );
    }
}
HomeLayout.propTypes = {
    classes: PropTypes.object.isRequired
};
export default withStyles(styles)(HomeLayout);