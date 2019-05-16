import React, { Component } from 'react';
import {PlaylistContext} from './PlaylistContext';
import {Avatar, TableBody,Table,TableRow,TableCell,TableHead} from '@material-ui/core';
import {Folder as FolderIcon, ArrowBack as BackIcon, Favorite as FavorIcon, AddCircle as AddIcon} from '@material-ui/icons';
import { Link } from "react-router-dom";
import { withStyles, createMuiTheme } from '@material-ui/core/styles';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import css from 'classnames';

const getColor = (theme, type, opacity) => {
  const color =
    theme.palette[type][theme.palette.type === 'light' ? 'main' : 'dark'];

  if (!opacity) {
    return color;
  }

  return lighten(color, opacity);
};

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
        padding: "4px 12px !important",
        width: '18px',
        height: '18px',
        fill: getGreyColor(theme),
        color: getGreyColor(theme),
        '&:hover': {
        fill: getGreyColor(theme, 0.25),
        color: getGreyColor(theme, 0.25),
        },
    },
    cell:{
        cursor: "pointer",
        padding: "0.3em 0.5em !important",
    },
    button: {
        padding: "4px 12px !important",
        width: '18px',
        height: '18px',
        fill: `${getColor(theme, 'primary')} !important`,
        color: `${getColor(theme, 'primary')} !important`,
        '&:hover': {
            fill: `${getColor(theme, 'primary', 0.25)} !important`,
            color: `${getColor(theme, 'primary', 0.25)} !important`,
        },
    },
    table:{
        marginBottom: '5em',
    }
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
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell className={classes.cell}></TableCell>
                        <TableCell className={classes.cell}>Title / name</TableCell>
                        <TableCell className={classes.cell}>Artist</TableCell>
                        <TableCell className={classes.cell}>Album</TableCell>
                        <TableCell className={classes.cell}>Year</TableCell>
                        <TableCell className={classes.cell}>Fav.</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {context.state.parentFolders.length >=1 && !context.state.favoriteTracks && !context.state.playlistTracks &&
                    <TableRow key={'back_folder'} >
                        <TableCell className={classes.cell} button onClick={() => context.navigateUp()}>
                            <BackIcon/>
                        </TableCell>
                        <TableCell className={classes.cell} button onClick={() => context.navigateUp()} colSpan="6">
                            back to {context.state.parentFolders[context.state.parentFolders.length-1].title}
                        </TableCell>
                    </TableRow>
                }
                {(context.state.favoriteTracks || context.state.playlistTracks) &&
                    <TableRow key={'back_favorite'} hover>
                        <TableCell className={classes.cell}>
                            <Link to="/" style={{ textDecoration: 'none' }}>
                                <BackIcon/>
                            </Link>
                        </TableCell>
                        <TableCell className={classes.cell} colSpan="6">
                            <Link to="/" style={{ textDecoration: 'none' }}>
                                back to {context.state.currentFolder.title}
                            </Link>
                        </TableCell>
                    </TableRow>
                }
                {context.state.displayedItems.map((track) =>
                    <TableRow key={track.id} selected={context.state.selected === track} hover>
                        <TableCell className={classes.cell} onClick={() => context.onListClick(track)}>
                        {track.imageUrl &&
                            <Avatar src={track.imageUrl} />}
                        {(track.children && <FolderIcon />)}
                        </TableCell>
                        <TableCell className={classes.cell} onClick={() => context.onListClick(track)} colSpan={track.children ? 5 : 1}>
                            {track.title}
                        </TableCell>
                        {track.children === undefined &&<TableCell className={classes.cell} onClick={() => context.onListClick(track)} >
                            {track.artist}
                        </TableCell>}
                        {track.children === undefined &&<TableCell className={classes.cell} onClick={() => context.onListClick(track)} >
                            {track.album}
                        </TableCell>}
                        {track.children === undefined &&<TableCell className={classes.button} onClick={()=>context.onAddToPlaylist(track)}>
                            <AddIcon />
                        </TableCell>}
                        {!track.children && <TableCell className={css(
                            {[classes['favoriteDisabled']]: !track.favorite},
                            {[classes['button']]: track.favorite},
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
