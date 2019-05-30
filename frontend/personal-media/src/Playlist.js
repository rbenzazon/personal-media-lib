import React, { Component } from 'react';
import {PlaylistContext} from './PlaylistContext';
import {Grid,Avatar, TableBody,Table,TableRow,TableCell,TableHead} from '@material-ui/core';
import {Audiotrack as TrackIcon,Folder as FolderIcon, ArrowBack as BackIcon, Favorite as FavorIcon, AddCircle as AddIcon} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import {isMobile} from "react-device-detect";
import { lighten } from '@material-ui/core/styles/colorManipulator';
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
    
    headerCell:{
        cursor: "default",
        padding: "0.6rem 0.6rem !important",
        color:getGreyColor(theme),
    },
    gridIcons:{
        cursor: "pointer",
        maxWidth: "3rem",
    },
    cellspan:{
        cursor: "pointer",
    },
    mainCell:{
        padding: "0 0 0 0.5rem !important",
        color:theme.palette.secondary.dark,
    },
    artistCell:{
        padding: "0.6rem 0.6rem !important",
        maxWidth:isMobile?'5rem':'7rem',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
        overflow: 'hidden',
        color:theme.palette.secondary.contrastText,
    },
    albumCell:{
        padding: "0.6rem 0.6rem !important",
        maxWidth:isMobile?'4rem':'5rem',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
        overflow: 'hidden',
        color:theme.palette.secondary.contrastText,
    },
    trackIcon:{
        color:getGreyColor(theme),
        width:'2rem',
        //height:'4rem',
        margin:'0 10%',
    },
    trackImage:{
        width:'1.6rem',
        height:'1.6rem',
        margin:'0 10%',
    },
    trackTitle:{
        cursor: "pointer",
        margin:'0.6rem 0em 0.6rem 0em',
        color:theme.palette.secondary.contrastText,
    },
    trackTitleSelected:{
        color:theme.palette.primary.dark,
    },
    backTitle:{
        cursor: "pointer",
        color:theme.palette.secondary.contrastText,
    },
    favoriteDisabled:{
        padding:'0.3rem 0em 0em 0em',
        width:'1.6rem',
        height:'1.6rem',
        margin:'0 10%',
        fill: getGreyColor(theme),
        color: getGreyColor(theme),
        '&:hover': {
        fill: getGreyColor(theme, 0.25),
        color: getGreyColor(theme, 0.25),
        },
    },
    button: {
        padding:'0.3rem 0em 0em 0em',
        margin:'0 10%',
        width:'1.6rem',
        height:'1.6rem',
        fill: `${getColor(theme, 'primary')} !important`,
        color: `${getColor(theme, 'primary')} !important`,
        '&:hover': {
            fill: `${getColor(theme, 'primary', 0.25)} !important`,
            color: `${getColor(theme, 'primary', 0.25)} !important`,
        },
    },
    table:{
        //marginBottom: '7rem',
        backgroundColor: theme.palette.background.paper,
    },
    tableHeadTr:{
        height:'2rem',
    },
    grow: {
        flexGrow: 1,
    },
    titleGrid:{
        padding:'0.6rem 0rem 0.6rem 0em',
    },
});


export class Playlist extends Component {
    state={
        hideAlbums:false,
    }
    static contextType = PlaylistContext;
    static defaultProps = {
        classes: {},
        classNames: {},
    };
    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
    }
    componentDidUnMount() {
        window.removeEventListener("resize", this.resize);
    }
    
    resize() {
        if(this.state.hideAlbums != (window.innerWidth <= 600)){
            this.setState({hideAlbums: window.innerWidth <= 600});
        }
    }
    render() {
    const {
        classes,
    } = this.props;
    return (
        <PlaylistContext.Consumer>{(context) => (
            <Table className={classes.table}>
                <TableHead >
                    <TableRow className={classes.tableHeadTr}>
                        <TableCell className={classes.headerCell}>Title / name</TableCell>
                        <TableCell className={classes.headerCell}>Artist</TableCell>
                        {!this.state.hideAlbums && 
                        <TableCell className={classes.headerCell}>Album</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {context.state.displayedItemMode === constants.FOLDER_MODE && context.state.parentFolders.length >=2 &&
                    <TableRow key={'back_folder'} >
                        <TableCell className={classes.mainCell} colSpan={this.state.hideAlbums?2:3}>
                            <Grid   alignContent="center"
                                    justify="flex-start"
                                    alignItems="center"
                                    container button="true"
                                    onClick={()=>context.linkTo(context.getParentPath())}
                                    >
                                <Grid item xs={isMobile?2:1} className={classes.gridIcons}>
                                    <BackIcon className={classes.trackIcon} />
                                </Grid>
                                <Grid item xs={isMobile?10:11} className={classes.backTitle}>
                                    back to {context.state.parentFolders[context.state.parentFolders.length-2].title}
                                </Grid>
                            </Grid>
                        </TableCell>
                    </TableRow>
                    }
                    {context.state.displayedItems.sort((a,b) => {
                        if(!a.url && b.url){
                            return -1;
                        }else if(a.url && !b.url){
                            return 1;
                        }else if(!a.url && !b.url){
                            return a.title < b.title ? -1 : 1;
                        }else if(a.album && b.album){
                            return a.album < b.album ? -1 : 1;
                        }
                    }).map((track) =>
                    <TableRow key={track.id} selected={context.state.selected === track} hover>
                        <TableCell className={classes.mainCell} colSpan={!track.url ? (this.state.hideAlbums ? 2:3) : 1}>
                            <Grid alignContent="center" justify="flex-start" alignItems="center" container>
                                {track.url && 
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
                                {!track.url && 
                                <Grid item 
                                xs={2}
                                onClick={()=>context.linkTo(context.getFolderPath(track))}
                                className={classes.gridIcons}
                                >
                                    <FolderIcon className={classes.trackIcon} />
                                </Grid>}
                                {(track.url && !this.state.hideAlbums) &&  
                                <Grid item xs={2} className={classes.gridIcons}>
                                    <FavorIcon 
                                        className={css(
                                            {[classes['favoriteDisabled']]: !context.isFavorite(track._id)},
                                            {[classes['button']]: context.isFavorite(track._id)},
                                        )} 
                                        onClick={() => context.onListFavoriteClick(track)} 
                                    />
                                </Grid>
                                }
                                {track.url &&
                                <Grid item xs={2} className={classes.gridIcons}>
                                    <AddIcon className={classes.button} onClick={()=>context.onAddToPlaylist(track)} />
                                </Grid>}
                                {!track.url &&
                                <Grid item className={classes.titleGrid} xs={10} onClick={()=>context.linkTo(context.getFolderPath(track))}>
                                    <span 
                                        className={css(
                                            {[classes['trackTitleSelected']]: context.state.selected === track},
                                            classes['trackTitle'],
                                        )} 
                                    >{track.title}</span>
                                </Grid>}
                                {track.url &&
                                <Grid item className={classes.titleGrid} xs={6} onClick={() => context.onListClick(track)} >
                                    <span 
                                        className={css(
                                            {[classes['trackTitleSelected']]: context.state.selected === track},
                                            classes['trackTitle'],
                                        )} 
                                    >{track.title}</span>
                                </Grid>}
                            </Grid>
                        </TableCell>
                        {track.url &&
                        <TableCell className={classes.artistCell} >
                            <span className={classes.cellspan} onClick={()=>track.artist && context.linkTo("/artist/"+track.artist)} >{track.artist}</span>
                        </TableCell>}
                        {(track.url && !this.state.hideAlbums ) &&
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
