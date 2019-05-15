import React, { Component } from 'react';
import {PlaylistContext} from './PlaylistContext';
import {List,ListItem,ListItemIcon,ListItemText,ListItemAvatar,Avatar} from '@material-ui/core';
import {Audiotrack,Folder as FolderIcon, ArrowBack as BackIcon, Favorite as FavorIcon} from '@material-ui/icons';
import { Link } from "react-router-dom";
import { withStyles, createMuiTheme } from '@material-ui/core/styles';
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
    favoriteDisabled:{
        fill: getGreyColor(theme),
        color: getGreyColor(theme),
        '&:hover': {
        fill: getGreyColor(theme, 0.25),
        color: getGreyColor(theme, 0.25),
        },
    },
});


export class PlayList extends Component {
    static contextType = PlaylistContext;
    static defaultProps = {
        classes: {},
        classNames: {},
    };
    render() {
    const {
        classes,
        classNames: {
            favoriteDisabled,
        },
    } = this.props;
    return (
        <PlaylistContext.Consumer>{(context) => (
            <List>
                {context.parentFolders.length >=1 && !context.favoriteTracks && 
                    <ListItem key={'back'} button key={-1}>
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
                        <ListItem key={'back'} button key="-2">
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
                    <ListItem key={track.id} button selected={context.selected === track}>
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
        )}</PlaylistContext.Consumer>
    )
  }
}
export default withStyles(styles)(PlayList);
