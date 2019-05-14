import React, { Component,useContext } from 'react';
import myData from './data.json';
import {AppBar,List,ListItem,ListItemIcon,ListItemText,Toolbar,Typography,ListItemAvatar,Avatar,Drawer,IconButton} from '@material-ui/core';
import {Audiotrack,Folder as FolderIcon, ArrowBack as BackIcon, PermMedia as ScanIcon, Favorite as FavorIcon,Menu as MenuIcon} from '@material-ui/icons';
import {Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,Button} from '@material-ui/core';
import { withStyles, createMuiTheme,MuiThemeProvider } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import AudioPlayer from './AudioPlayer/AudioPlayer.js';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import css from 'classnames';
import { Link } from "react-router-dom";
import {PlaylistContext} from './PlaylistContext';


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
    static contextType = PlaylistContext;
    static defaultProps = {
        classes: {},
        classNames: {},
    };

    render(){
        const {
            classes,
            classNames: {
                favoriteDisabled,
            },
        } = this.props;
        return(
        <MuiThemeProvider theme={theme}>
            <PlaylistContext.Consumer>{(context) => (
            <React.Fragment>
                <AppBar position="static" color="default">
                    <Toolbar>
                        <IconButton aria-label="Open menu" onClick={() => context.toggleDrawer(true)} >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" color="inherit">
                        {context.favoriteTracks ? 'Favorite tracks' : context.currentFolder.title}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <List>
                    {context.parentFolders.length >=1 && !context.favoriteTracks && 
                        <ListItem key={'back'} button >
                            <ListItemIcon>
                                <BackIcon/>
                            </ListItemIcon>
                            <ListItemText onClick={() => {context.navigateUp();console.log(context);}}>
                                back to {context.parentFolders[context.parentFolders.length-1].title}
                            </ListItemText>
                        </ListItem>
                    }
                    {context.favoriteTracks && 
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <ListItem key={'back'} button >
                                <ListItemIcon>
                                    <BackIcon/>
                                </ListItemIcon>
                            
                                <ListItemText>
                                    back to {context.currentFolder.title}
                                </ListItemText>
                            </ListItem>
                        </Link>
                    }
                    {context.displayedItems.map((track) =>
                        <ListItem key={track} button selected={context.selected === track}>
                            <ListItemIcon>
                                {(track.children && <FolderIcon />) || (!track.children && <Audiotrack />)}
                            </ListItemIcon>
                            {track.imageUrl && <ListItemAvatar>
                                <Avatar src={track.imageUrl} />
                            </ListItemAvatar>}
                            <ListItemText onClick={() => {context.onListClick(track);console.log(context)}}>
                                {track.children ? track.title : track.title +" - " +track.album+" - "+track.year+" - "+track.artist+" - "+track.trackNumber}
                            </ListItemText>
                            {!track.children && <ListItemIcon className={css({[classes['favoriteDisabled']]: !track.favorite})} onClick={() => context.onListFavoriteClick(track)}>
                                <FavorIcon />
                            </ListItemIcon>}
                        </ListItem>)}
                </List>
                <Drawer open={context.sideDrawer} onClose={() => context.toggleDrawer(false)}>
                    <div
                        tabIndex={0}
                        role="button"
                        onClick={() => context.toggleDrawer(false)}
                        onKeyDown={() => context.toggleDrawer(false)}
                    >
                        <List>
                        {
                            [{text:'Favorite tracks',icon:<FavorIcon />,click:null},{text:'Add media',icon:<ScanIcon/>,click:() => context.setImportOpen(true)}].map((item) => {
                            if(item.click){
                                return (
                                <ListItem button key={item.text} onClick={item.click}>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItem>
                                )
                            }else{
                                return (
                                <Link to="/favorite" style={{ textDecoration: 'none' }}>
                                    <ListItem button key={item.text} onClick={item.click}>
                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.text} />
                                    </ListItem>
                                </Link>
                                )
                            }
                            
                        })
                        }
                        </List>
                    </div>
                </Drawer>
                <AppBar position="fixed" className={this.props.classes.appBar}>
                    <AudioPlayer
                        autoPlay={false}
                        rounded={true}
                        elevation={1}
                        width="100%"
                        showLoopIcon={false}
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
Playlist.propTypes = {
    classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Playlist);