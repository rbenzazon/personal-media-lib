import React, { Component } from 'react';
import {PlaylistContext} from './PlaylistContext';
import {Grid,Avatar, TableBody,Table,TableRow,TableCell,TableHead} from '@material-ui/core';
import {Audiotrack as TrackIcon,Folder as FolderIcon, ArrowBack as BackIcon, Favorite as FavorIcon, AddCircle as AddIcon} from '@material-ui/icons';
import { Link } from "react-router-dom";
import { withStyles, createMuiTheme } from '@material-ui/core/styles';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import {isMobile} from "react-device-detect";
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
        padding:'0.2em 0em 0em 0em',
        width:'1.3em',
        height:'1.3em',
        fill: getGreyColor(theme),
        color: getGreyColor(theme),
        '&:hover': {
        fill: getGreyColor(theme, 0.25),
        color: getGreyColor(theme, 0.25),
        },
    },
    cell:{
        cursor: "pointer",
        padding: "0.7em 0.7em !important",
        
    },
    imageCell:{
        padding: "0.7em 0.7em !important",
        maxWidth:isMobile?'1em':'2em',
    },
    albumCell:{
        cursor: "pointer",
        padding: "0.7em 0.7em !important",
        maxWidth:isMobile?'5em':'8em',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
        overflow: 'hidden',
    },
    trackIcon:{
        width:'1.2em',
        height:'1.2em',
    },
    trackImage:{
        width:'1.5em',
        height:'1.5em',
    },
    trackTitle:{
        margin:'0.5em 0em 0.5em 0em',
    },
    button: {
        padding:'0.2em 0em 0em 0em',
        width:'1.3em',
        height:'1.3em',
        fill: `${getColor(theme, 'primary')} !important`,
        color: `${getColor(theme, 'primary')} !important`,
        '&:hover': {
            fill: `${getColor(theme, 'primary', 0.25)} !important`,
            color: `${getColor(theme, 'primary', 0.25)} !important`,
        },
    },
    table:{
        marginBottom: '5em',
    },
    tableHeadTr:{
        height:'48px',
    },
    grow: {
        flexGrow: 1,
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
            <Table className={classes.table}>
                <TableHead >
                    <TableRow className={classes.tableHeadTr}>
                        <TableCell className={classes.cell}></TableCell>
                        <TableCell className={classes.cell}>Title / name</TableCell>
                        <TableCell className={classes.cell}>Artist</TableCell>
                        {!isMobile && <TableCell className={classes.cell}>Album</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                {context.state.parentFolders.length >=1 && !context.state.favoriteTracks && !context.state.playlistTracks &&
                    <TableRow key={'back_folder'} >
                        <TableCell className={classes.imageCell} button onClick={() => context.navigateUp()}>
                            <BackIcon/>
                        </TableCell>
                        <TableCell className={classes.cell} button onClick={() => context.navigateUp()} colSpan="6">
                            back to {context.state.parentFolders[context.state.parentFolders.length-1].title}
                        </TableCell>
                    </TableRow>
                }
                {(context.state.favoriteTracks || context.state.playlistTracks) &&
                    <TableRow key={'back_favorite'} hover>
                        <TableCell className={classes.imageCell}>
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
                        <TableCell className={classes.imageCell} onClick={() => context.onListClick(track)}>
                        {track.imageUrl &&
                            <Avatar className={classes.trackImage} src={track.imageUrl} />}
                        {!track.imageUrl && !track.children &&
                            <TrackIcon />}
                        {(track.children && <FolderIcon className={classes.trackIcon} />)}
                        </TableCell>
                        <TableCell className={classes.cell} colSpan={track.children ? 5 : 1}>
                        <Grid alignContent="center" justify="center" alignItems="center" container >
                            {!track.children && 
                            <Grid item xs="2"><FavorIcon className={css(
                                {[classes['favoriteDisabled']]: !track.favorite},
                                {[classes['button']]: track.favorite},
                                )} 
                                onClick={() => context.onListFavoriteClick(track)} 
                            /></Grid>
                            }
                            {!track.children &&
                            <Grid item xs="3"><AddIcon className={classes.button} onClick={()=>context.onAddToPlaylist(track)} /></Grid>
                            }
                            <Grid item xs={track.children?12:7} onClick={() => context.onListClick(track)} ><span className={classes.trackTitle} >{track.title}</span></Grid>
                        </Grid>
                        </TableCell>
                        {track.children === undefined &&<TableCell className={classes.cell} onClick={() => context.onListClick(track)} >
                            {track.artist}
                        </TableCell>}
                        {track.children === undefined && !isMobile && 
                        <TableCell className={css(classes['albumCell'],classes['button']
                            )} onClick={() => context.onListClick(track)} >
                            {track.album}
                        </TableCell>}
                        
                        
                    </TableRow>)}
                </TableBody>
            </Table>
        )}</PlaylistContext.Consumer>
    )
  }
}
export default withStyles(styles)(PlayList);
