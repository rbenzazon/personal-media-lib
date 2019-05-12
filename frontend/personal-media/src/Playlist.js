import React, { Component } from 'react';
import myData from './data.json';
import {AppBar,List,ListItem,ListItemIcon,ListItemText,Toolbar,Typography,ListItemAvatar,Avatar,Drawer,IconButton} from '@material-ui/core';
import {Audiotrack,Folder as FolderIcon, ArrowBack as BackIcon, PermMedia as ScanIcon, Favorite as FavorIcon,Menu as MenuIcon} from '@material-ui/icons'
import { withStyles, createMuiTheme,MuiThemeProvider } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import AudioPlayer from './AudioPlayer/AudioPlayer.js';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import css from 'classnames';

const theme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
});
const getGreyColor = (theme, opacity) => {
    const greyColor = theme.palette.grey['500'];
  
    if (!opacity) {
      return greyColor;
    }
  
    return lighten(greyColor, opacity);
};
const styles = theme => ({
    appBar: {
        top: 'auto',
        bottom: 0,
    },
    favoriteDisabled:{
        fill: getGreyColor(theme),
        color: getGreyColor(theme),
        '&:hover': {
        fill: getGreyColor(theme, 0.25),
        color: getGreyColor(theme, 0.25),
        },
    },
});

const {tracks} = myData;

export class Playlist extends Component {
    static defaultProps = {
        classes: {},
        classNames: {},
    };

    state = {
        currentFolder:tracks,
        parentFolders:[],
        selected:tracks.children.filter(track => !track.children)[0],
        sideDrawer:false,
        favoriteTracks:false,
    };

    /**
     * @track : undefined, track, track may contain a children array prop
     */
    onListclick = (track) =>{
        if(track === undefined){
            let parents = [...this.state.parentFolders];
            const newCurrent = parents.splice(parents.length-1, 1)[0];
            this.setState({currentFolder:newCurrent,parentFolders:parents});
        }else if(track.children){
            let parents = [...this.state.parentFolders];
            parents.push(this.state.currentFolder);
            this.setState({currentFolder:track,parentFolders:parents});
        }else{
            this.setState({selected:track});
        }
    }

    onBackClickFavorite = () =>{
        this.setState({favoriteTracks: false});
    }

    onListFavoriteClick = (track) =>{
        track.favorite = track.favorite ?!track.favorite : true;
        this.setState({currentFolder:this.state.currentFolder});
    }
    onFavoriteClick = () =>{
        this.setState({favoriteTracks: true});
    }

    toggleDrawer = (open) => () => {
        //if(this.state.sideDrawer !== open){
            console.log(open);
            this.setState({sideDrawer: open});
        //}
    };

    onNextClick = () =>{
        const children = this.getListData();
        const index = children.indexOf(this.state.selected)+1;
        const boundaries = index === children.length ? 0 : index;
        for(let newIndex = boundaries;newIndex < children.length;newIndex++){
            if(!children[newIndex].children){
                this.setState({selected:children[newIndex]});
                return;
            }
        }
        
    }

    onPrevClick = () =>{
        const children = this.getListData();
        const index = children.indexOf(this.state.selected) -1;
        const boundaries = index < 0 ? children.length-1 : index;
        for(let newIndex = boundaries;newIndex >= 0;newIndex--){
            if(!children[newIndex].children){
                this.setState({selected:children[newIndex]});
                return;
            }
        }
    }

    mapRecursive = (trackList) =>{
        let output = [];
        trackList.map((track)=>{
            output.push(track);
            if(track.children){
                output = [...this.mapRecursive(track.children)];
            }
        });
        return output;
    }

    getListData = () =>{
        if(this.state.favoriteTracks){
            console.log("favoriteTracks");
            return this.mapRecursive(tracks.children).filter((track)=>track.favorite);
        }else{
            return this.state.currentFolder.children;
        }
    }

    render(){
        const {
            classes,
            classNames: {
                favoriteDisabled,
            },
        } = this.props;
        const trackList = this.getListData().map((track) =>
            <ListItem key={track} button selected={this.state.selected === track}>
                <ListItemIcon>
                    {(track.children && <FolderIcon />) || (!track.children && <Audiotrack />)}
                </ListItemIcon>
                {track.imageUrl && <ListItemAvatar>
                    <Avatar src={track.imageUrl} />
                </ListItemAvatar>}
                <ListItemText onClick={() => this.onListclick(track)}>
                    {track.children ? track.title : track.title +" - " +track.album+" - "+track.year+" - "+track.artist+" - "+track.trackNumber}
                </ListItemText>
                {!track.children && <ListItemIcon className={css({[classes['favoriteDisabled']]: !track.favorite})} onClick={() => this.onListFavoriteClick(track)}>
                    <FavorIcon />
                </ListItemIcon>}
            </ListItem>
        );

        const sideDrawerList = (
            <List>
            {[{text:'Favorite tracks',icon:<FavorIcon />,click:() => this.onFavoriteClick()},{text:'Add media',icon:<ScanIcon/>,click:() => this.onFavoriteClick()}].map((item) => (
                <ListItem button key={item.text} onClick={item.click}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                </ListItem>
            ))}
            </List>
        );
        const {favoriteTracks} = this.state;

        
        return(
        <MuiThemeProvider theme={theme}>
            <React.Fragment>
                <AppBar position="static" color="default">
                    <Toolbar>
                        <IconButton aria-label="Open menu" onClick={this.toggleDrawer(true)} >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" color="inherit">
                        {favoriteTracks ? 'Favorite tracks' : this.state.currentFolder.title}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <List>
                    {(tracks !== this.state.currentFolder || this.state.favoriteTracks) && 
                    <ListItem key={'back'} button >
                        <ListItemIcon>
                            <BackIcon/>
                        </ListItemIcon>
                        {favoriteTracks === false && 
                            <ListItemText onClick={() => this.onListclick()}>
                                back to {this.state.parentFolders[this.state.parentFolders.length-1].title}
                            </ListItemText>
                        }
                        {favoriteTracks && 
                            <ListItemText onClick={() => this.onBackClickFavorite()}>
                                back to {this.state.currentFolder.title}
                            </ListItemText>
                        }
                    </ListItem>}
                    {trackList}
                </List>
                <Drawer open={this.state.sideDrawer} onClose={this.toggleDrawer(false)}>
                    <div
                        tabIndex={0}
                        role="button"
                        onClick={this.toggleDrawer(false)}
                        onKeyDown={this.toggleDrawer(false)}
                    >
                        {sideDrawerList}
                    </div>
                </Drawer>
                <AppBar position="fixed" className={this.props.classes.appBar}>
                    <AudioPlayer
                        src={this.state.selected.url}
                        title={this.state.selected.title}
                        artist={this.state.selected.artist}
                        autoPlay={false}
                        rounded={true}
                        elevation={1}
                        width="100%"
                        showLoopIcon={false}
                        onPrevClick={() => this.onPrevClick()}
                        onNextClick={() => this.onNextClick()}
                    />
                </AppBar>
            </React.Fragment>
        </MuiThemeProvider>
        );
    }
}
Playlist.propTypes = {
    classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Playlist);