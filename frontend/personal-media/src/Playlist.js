import React, { Component } from 'react';
import {PlaylistContext} from './PlaylistContext';
import {Grid,Avatar, TableBody,Table,TableRow,TableCell,TableHead} from '@material-ui/core';
import {Audiotrack as TrackIcon,Folder as FolderIcon, ArrowBack as BackIcon, Favorite as FavorIcon, AddCircle as AddIcon} from '@material-ui/icons';
import { Link } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import {isMobile} from "react-device-detect";
import css from 'classnames';
import constants from "./ContextConstant";

const getColor = (theme, type, opacity) => {
  const color =
    theme.palette[type][theme.palette.type === 'light' ? 'main' : 'dark'];

  if (!opacity) {
    return color;
  }

  return lighten(color, opacity);
};

const getGreyColor = (theme, opacity) => {
    const greyColor = theme.palette.grey['500'];
  
    if (!opacity) {
      return greyColor;
    }
  
    return lighten(greyColor, opacity);
};
const styles = theme => ({
    
    cell:{
        cursor: "default",
        padding: "0.7em 0.7em !important",
        color:getGreyColor(theme),
    },
    secondaryColor:{
        color:theme.palette.secondary.dark,
    },
    primaryColor:{
        color:theme.palette.primary.dark,
    },
    imageCell:{
        padding: "0.7em 0.7em !important",
        maxWidth:isMobile?'1em':'2em',
    },
    gridIcons:{
        cursor: "pointer",
        maxWidth: "50px",
    },
    cellspan:{
        cursor: "pointer",
    },
    mainCell:{
        //cursor: "default",
        padding: "0 !important",
        //minWidth:isMobile?'3em':'10em',
        color:theme.palette.secondary.dark,
    },
    artistCell:{
        //cursor: "pointer",
        padding: "0.7em 0.7em !important",
        maxWidth:isMobile?'6em':'8em',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
        overflow: 'hidden',
        color:theme.palette.secondary.contrastText,
    },
    albumCell:{
        //cursor: "pointer",
        padding: "0.7em 0.7em !important",
        maxWidth:isMobile?'5em':'6em',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
        overflow: 'hidden',
        color:theme.palette.secondary.contrastText,
    },
    trackIcon:{
        color:getGreyColor(theme),
        width:'1.2em',
        height:'1.2em',
        margin:'0 10%',
    },
    trackImage:{
        width:'1.5em',
        height:'1.5em',
        margin:'0 10%',
    },
    trackTitle:{
        cursor: "pointer",
        margin:'0.5em 0em 0.5em 0em',
        color:theme.palette.secondary.contrastText,
    },
    trackTitleSelected:{
        color:theme.palette.primary.dark,
    },
    favoriteDisabled:{
        padding:'0.2em 0em 0em 0em',
        width:'1.3em',
        height:'1.3em',
        margin:'0 10%',
        fill: getGreyColor(theme),
        color: getGreyColor(theme),
        '&:hover': {
        fill: getGreyColor(theme, 0.25),
        color: getGreyColor(theme, 0.25),
        },
    },
    button: {
        padding:'0.2em 0em 0em 0em',
        margin:'0 10%',
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
        marginBottom: '4em',
        backgroundColor: theme.palette.background.paper,
    },
    tableHeadTr:{
        height:'2em',
    },
    grow: {
        flexGrow: 1,
    },
    titleGridItem:{
        padding:'0.6em 0em 0.5em 0em',
    },
});


export class Playlist extends Component {
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
                    {context.state.displayedItemMode === constants.FOLDER_MODE && context.state.parentFolders.length >=1 &&
                    <TableRow key={'back_folder'} >
                        <TableCell className={classes.cell} colSpan={isMobile?2:3}>
                            <Grid   alignContent="center"
                                    justify="flex-start"
                                    alignItems="center"
                                    container button
                                    onClick={()=>context.linkTo(context.getParentPath())}
                                    >
                                <Grid item xs={isMobile?2:1} >
                                    <BackIcon className={classes.secondaryColor} />
                                </Grid>
                                <Grid item xs={isMobile?10:11} className={classes.primaryColor}>
                                    back to {context.state.parentFolders[context.state.parentFolders.length-1].title}
                                </Grid>
                            </Grid>
                        </TableCell>
                    </TableRow>
                    }
                    {(context.state.displayedItemMode === constants.FAVORITE_MODE  || context.state.displayedItemMode === constants.PLAYLIST_MODE) &&
                    <TableRow key={'back_favorite'} hover>
                        <TableCell className={classes.mainCell} colSpan={isMobile?2:3}>
                                <Grid alignContent="center" justify="flex-start" alignItems="center" container onClick={()=>context.linkTo("/folder")}>
                                    <Grid item xs={isMobile?2:1} >
                                        <BackIcon className={classes.secondaryColor} />
                                    </Grid>
                                    <Grid item xs={isMobile?10:11} style={{ textDecoration: 'none' }} className={classes.primaryColor}>
                                        back to {context.state.currentFolder.title}
                                    </Grid>
                                </Grid>
                        </TableCell>
                    </TableRow>
                    }
                    {context.state.displayedItems.map((track) =>
                    <TableRow key={track.id} selected={context.state.selected === track} hover>
                        <TableCell className={classes.mainCell} colSpan={track.children ? 3 : 1}>
                            <Grid alignContent="center" justify="flex-start" alignItems="center" container>
                                {!track.children && 
                                <Grid item 
                                    xs={2}
                                    onClick={() => context.onListClick(track)}
                                    className={classes.gridIcons}
                                    >
                                    {track.imageUrl &&
                                    <Avatar className={classes.trackImage} src={track.imageUrl} />}
                                    {!track.imageUrl &&
                                    <TrackIcon className={classes.trackIcon} />}
                                </Grid>}
                                {track.children && 
                                <Grid item 
                                xs={2}
                                onClick={()=>context.linkTo(context.getFolderPath(track))}
                                className={classes.gridIcons}
                                >
                                    <FolderIcon className={classes.trackIcon} />
                                </Grid>}
                                {!track.children && 
                                <Grid item xs={2} className={classes.gridIcons}>
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
                                <Grid item xs={2} className={classes.gridIcons}>
                                    <AddIcon className={classes.button} onClick={()=>context.onAddToPlaylist(track)} />
                                </Grid>}
                                {track.children &&
                                <Grid item className={classes.titleGridItem} xs={10} onClick={()=>context.linkTo(context.getFolderPath(track))}>
                                    <span 
                                        className={css(
                                            {[classes['trackTitleSelected']]: context.state.selected === track},
                                            classes['trackTitle'],
                                        )} 
                                    >{track.title}</span>
                                </Grid>}
                                {!track.children &&
                                <Grid item className={classes.titleGridItem} xs={6} onClick={() => context.onListClick(track)} >
                                    <span 
                                        className={css(
                                            {[classes['trackTitleSelected']]: context.state.selected === track},
                                            classes['trackTitle'],
                                        )} 
                                    >{track.title}</span>
                                </Grid>}
                            </Grid>
                        </TableCell>
                        {!track.children &&
                        <TableCell className={classes.artistCell} >
                            <span className={classes.cellspan} onClick={()=>track.artist && context.linkTo("/artist/"+track.artist)} >{track.artist}</span>
                        </TableCell>}
                        {!track.children && !isMobile && 
                        <TableCell className={classes.albumCell} >
                            <span className={classes.cellspan} onClick={()=>track.album && context.linkTo("/album/"+track.album)} >{track.album}</span>
                        </TableCell>}
                        
                        
                    </TableRow>)}
                </TableBody>
            </Table>
        )}</PlaylistContext.Consumer>
    )
  }
}
export default withStyles(styles)(Playlist);
