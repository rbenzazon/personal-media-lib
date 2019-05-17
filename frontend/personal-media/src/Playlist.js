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
    artistCell:{
        cursor: "pointer",
        padding: "0.7em 0.7em !important",
        maxWidth:isMobile?'6em':'8em',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
        overflow: 'hidden',
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
                        <TableCell className={classes.cell}>Title / name</TableCell>
                        <TableCell className={classes.cell}>Artist</TableCell>
                        {!isMobile && 
                        <TableCell className={classes.cell}>Album</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {context.state.parentFolders.length >=1 && !context.state.favoriteTracks && !context.state.playlistTracks &&
                    <TableRow key={'back_folder'} >
                        <TableCell className={classes.cell} >
                            <Grid alignContent="center" justify="flex-start" alignItems="center" container button onClick={() => context.navigateUp()}>
                                <Grid item xs={isMobile?2:1} >
                                    <BackIcon/>
                                </Grid>
                                <Grid item xs={isMobile?10:11} >
                                    back to {context.state.parentFolders[context.state.parentFolders.length-1].title}
                                </Grid>
                            </Grid>
                        </TableCell>
                    </TableRow>
                    }
                    {(context.state.favoriteTracks || context.state.playlistTracks) &&
                    <TableRow key={'back_favorite'} hover>
                        <TableCell className={classes.cell} colSpan={isMobile?2:3}>
                            <Link to="/" >
                                <Grid alignContent="center" justify="flex-start" alignItems="center" container >
                                    <Grid item xs={isMobile?2:1} >
                                        <BackIcon/>
                                    </Grid>
                                    <Grid item xs={isMobile?10:11} style={{ textDecoration: 'none' }}>
                                        back to {context.state.currentFolder.title}
                                    </Grid>
                                </Grid>
                            </Link>
                        </TableCell>
                    </TableRow>
                    }
                    {context.state.displayedItems.map((track) =>
                    <TableRow key={track.id} selected={context.state.selected === track} hover>
                        <TableCell className={classes.cell} colSpan={track.children ? 3 : 1}>
                            <Grid alignContent="center" justify="flex-start" alignItems="center" container >
                                <Grid item xs={isMobile?2:1} onClick={() => context.onListClick(track)}>
                                    {track.imageUrl &&
                                    <Avatar className={classes.trackImage} src={track.imageUrl} />}
                                    {!track.imageUrl && !track.children &&
                                    <TrackIcon />}
                                    {track.children && 
                                    <FolderIcon className={classes.trackIcon} />}
                                </Grid>
                                {!track.children && 
                                <Grid item xs={isMobile?2:1}>
                                    <FavorIcon 
                                        className={css(
                                            {[classes['favoriteDisabled']]: !track.favorite},
                                            {[classes['button']]: track.favorite},
                                        )} 
                                        onClick={() => context.onListFavoriteClick(track)} 
                                    />
                                </Grid>
                                }
                                {!track.children &&
                                <Grid item xs={isMobile?2:1}>
                                    <AddIcon className={classes.button} onClick={()=>context.onAddToPlaylist(track)} />
                                </Grid>}
                                <Grid item xs={track.children?(isMobile?8:9):(isMobile?6:9)} onClick={() => context.onListClick(track)} >
                                    <span className={classes.trackTitle} >{track.title}</span>
                                </Grid>
                            </Grid>
                        </TableCell>
                        {!track.children &&
                        <TableCell className={classes.artistCell} onClick={() => context.onListClick(track)} >
                            {track.artist}
                        </TableCell>}
                        {!track.children && !isMobile && 
                        <TableCell className={css(classes['albumCell']
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
