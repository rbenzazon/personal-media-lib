import React, { Component } from 'react';
import {PlaylistContext} from './PlaylistContext';
import {List,ListItem,ListItemIcon,ListItemText,ListItemAvatar,Avatar, TableBody,Table,TableRow,TableCell,TableHead} from '@material-ui/core';
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
    cell:{
        cursor: "pointer",
        padding: "4px 12px !important",
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
            <Table >
                <TableHead>
                    <TableRow>
                        <TableCell className={classes.cell}></TableCell>
                        <TableCell className={classes.cell}>Title / name</TableCell>
                        <TableCell className={classes.cell}>Artist</TableCell>
                        <TableCell className={classes.cell}>Album</TableCell>
                        <TableCell className={classes.cell}>Year</TableCell>
                        <TableCell className={classes.cell}>#</TableCell>
                        <TableCell className={classes.cell}>Fav.</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {context.parentFolders.length >=1 && !context.favoriteTracks && 
                    <TableRow key={'back_folder'} >
                        <TableCell className={classes.cell} button onClick={() => context.navigateUp()}>
                            <BackIcon/>
                        </TableCell>
                        <TableCell className={classes.cell} button onClick={() => context.navigateUp()} colspan="6">
                            back to {context.parentFolders[context.parentFolders.length-1].title}
                        </TableCell>
                    </TableRow>
                }
                {context.favoriteTracks && 
                    <TableRow key={'back_favorite'} hover>
                        <TableCell className={classes.cell}>
                            <Link to="/" style={{ textDecoration: 'none' }}>
                                <BackIcon/>
                            </Link>
                        </TableCell>
                        <TableCell className={classes.cell} colspan="6">
                            <Link to="/" style={{ textDecoration: 'none' }}>
                                back to {context.currentFolder.title}
                            </Link>
                        </TableCell>
                    </TableRow>
                }
                {context.displayedItems.map((track) =>
                    <TableRow key={track.id} selected={context.selected === track} hover>
                        <TableCell className={classes.cell} onClick={() => context.onListClick(track)}>
                        {track.imageUrl &&
                            <Avatar src={track.imageUrl} />}
                        {(track.children && <FolderIcon />)}
                        </TableCell>
                        <TableCell className={classes.cell} onClick={() => context.onListClick(track)} colspan={track.children ? 6 : 1}>
                            {track.title}
                        </TableCell>
                        {track.children === undefined &&<TableCell className={classes.cell}>
                            {track.artist}
                        </TableCell>}
                        {track.children === undefined &&<TableCell className={classes.cell}>
                            {track.album}
                        </TableCell>}
                        {track.children === undefined &&<TableCell className={classes.cell}>
                            {track.year}
                        </TableCell>}
                        {track.children === undefined &&<TableCell className={classes.cell}>
                            {track.trackNumber}
                        </TableCell>}
                        
                        {!track.children && <TableCell className={css(
                            {[classes['favoriteDisabled']]: !track.favorite},
                            classes.cell
                            )} 
                            onClick={() => context.onListFavoriteClick(track)}
                            >
                            <FavorIcon />
                        </TableCell>}
                    </TableRow>)}
                </TableBody>
            </Table>
        )}</PlaylistContext.Consumer>
    )
  }
}
export default withStyles(styles)(PlayList);
