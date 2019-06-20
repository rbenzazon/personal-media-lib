import React, { Component } from 'react';
import {PlaylistContext} from '../PlaylistContext';
import {Grid,Avatar, TableBody,Table,TableRow,TableCell,TableHead} from '@material-ui/core';
import {Audiotrack as TrackIcon,Folder as FolderIcon, ArrowBack as BackIcon, Favorite as FavorIcon, AddCircle as AddIcon} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import {isMobile} from "react-device-detect";
import { lighten } from '@material-ui/core/styles/colorManipulator';
import css from 'classnames';
import constants from "../ContextConstant";

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

var interval;
export class DownloadList extends Component {
    state={
        downloads:[],
    }
    static contextType = PlaylistContext;
    static defaultProps = {
        classes: {},
        classNames: {},
    };


    constructor(props){
        super(props);
        this.getDownloads = this.getDownloads.bind(this);
        
        
    }

    componentDidMount() {
        interval = setInterval(this.getDownloads,5000);
        this.getDownloads();
    }
    componentWillUnmount() {
        clearInterval(interval);
    }

    async getDownloads(){
        const res = await fetch(process.env.REACT_APP_SERV_URL+'api/getDownloads', {
            method: 'POST',
            credentials:'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
        
        const jsonBody = await res.json();
        if(!res.ok){
            
            console.log("couldn't retrieve downloads");
        }else{
            this.setState({downloads:jsonBody.downloads});
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
                        <TableCell className={classes.headerCell}>Progress</TableCell>
                        <TableCell className={classes.headerCell}>Size</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {this.state.downloads.map((download) =>
                    <TableRow key={download._id} hover>
                        <TableCell className={classes.mainCell} >
                            <Grid alignContent="center" justify="flex-start" alignItems="center" container>
                                <Grid item 
                                xs={2}
                                onClick={()=>context.linkTo(context.getFolderPath(download))}
                                className={classes.gridIcons}
                                >
                                    <FolderIcon className={classes.trackIcon} />
                                </Grid>
                                
                                <Grid item className={classes.titleGrid} xs={10} onClick={()=>context.linkTo(context.getFolderPath(download))}>
                                    <span 
                                        className={css(
                                            classes['trackTitle'],
                                        )} 
                                    >{download.title}</span>
                                </Grid>
                            </Grid>
                        </TableCell>
                        <TableCell className={classes.artistCell} >
                            <span className={classes.cellspan}  >{download.progress}%</span>
                        </TableCell>
                        
                        <TableCell className={classes.albumCell} >
                            <span className={classes.cellspan}  >{download.bytesLoaded} / {download.bytesTotal}</span>
                        </TableCell>
                        
                        
                    </TableRow>)}
                </TableBody>
            </Table>
        )}</PlaylistContext.Consumer>
    )
  }
}
export default withStyles(styles)(DownloadList);
