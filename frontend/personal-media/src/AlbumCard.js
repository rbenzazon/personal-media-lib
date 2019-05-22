import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Grid} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import css from 'classnames';
import { lighten } from '@material-ui/core/styles/colorManipulator';

const getGreyColor = (theme, opacity) => {
      const greyColor = theme.palette.grey['500'];
    
      if (!opacity) {
        return greyColor;
      }
    
      return lighten(greyColor, opacity);
};

const styles = theme => ({
    albumImage:{
        width:"100%",
    },
    albumGridItem:{
        //maxWidth:"200px",
        padding:"40px !important",
    },
    label:{
        color:getGreyColor(theme),
        fontSize:"13px",
    },
    value:{
        color:theme.palette.secondary.contrastText,
        fontSize:"13px",
        margin:"0 20px 0 10px",
    },
    albumName:{
        fontSize:"24px",
        color:theme.palette.secondary.contrastText,
        
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        'white-space': 'nowrap',
    },
    container:{
        padding:"30px",
    },
    albumDesc:{
        display: "-webkit-box",
        display: "box",
        color:theme.palette.secondary.contrastText,
        transition:'height 300ms cubic-bezier(0.4, 0, 0.2, 1) 150ms',
        fontSize:"13px",
    },
    albumDescContracted:{
        textOverflow:"ellipsis",
        "-webkit-line-clamp":"4",
        "-webkit-box-orient": "vertical",  
        "line-clamp":"4",
        "box-orient": "vertical", 
        maxHeight:"75px",
        overflow: "hidden",
    },
    albumDescMore:{
        cursor:"pointer",
        color:theme.palette.secondary.contrastText,
        fontSize:"13px",
    },
});

export class AlbumCard extends Component {
    static defaultProps = {
        classes: {},
    };
    constructor(props){
        super(props);
        this.state={
            albumName:decodeURIComponent(this.props.match.params.albumName),
            albumData:{},
            albumDescExpanded:false,
        }
        this.onReadMoreDesc = this.onReadMoreDesc.bind(this);
    }
    onReadMoreDesc(){
        this.setState(state=>({albumDescExpanded:!state.albumDescExpanded}));
    }
    async componentWillMount(){
        const res = await fetch("https://theaudiodb.com/api/v1/json/195003/searchalbum.php?a="+this.props.match.params.albumName);
        const albumData = await res.json();
        if(albumData.album === null){
            return;
        }
        console.log(albumData.album[0]);
        this.setState({albumData:albumData.album[0]});
    }
    render() {
        const {
            classes,
        } = this.props;
        return (
            <Grid container className={classes.container}>
                <Grid item xs={12} sm={5} md={4} lg={3} xl={2} className={classes.albumGridItem}>
                    <img src={this.state.albumData.strAlbumThumb} alt={this.state.albumName+" picture"} className={classes.albumImage}/>
                </Grid>
                <Grid item xs={12} sm={7} md={8} lg={9} xl={10} >
                    <p className={classes.albumName} >{this.state.albumName}</p>
                    
                    <p>
                        {this.state.albumData.strArtist && 
                        <React.Fragment><span className={classes.label} >artist</span><span className={classes.value} >{this.state.albumData.strArtist}</span></React.Fragment>
                        }
                        {this.state.albumData.intYearReleased &&
                        <React.Fragment><span className={classes.label} >released in</span><span className={classes.value} >{this.state.albumData.intYearReleased}</span></React.Fragment>
                        }
                    </p>
                    
                    
                    {this.state.albumData.strLabel &&
                    <p  ><span className={classes.label} >label</span>  <span className={classes.value} >{this.state.albumData.strLabel}</span></p>
                    }
                    <p className={css(
                        classes["albumDesc"],
                        {[classes["albumDescContracted"]]:!this.state.albumDescExpanded},
                        )} >{this.state.albumData.strDescriptionEN}</p>
                    <p className={classes.albumDescMore} onClick={this.onReadMoreDesc}>
                        {!this.state.albumDescExpanded && "...read more"}
                        {this.state.albumDescExpanded && "...read less"}
                    </p>
                    
                </Grid>
            </Grid>
        )
    }
}
AlbumCard.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(AlbumCard);
