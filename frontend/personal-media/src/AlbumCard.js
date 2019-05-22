import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Grid} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import css from 'classnames';
import { lighten } from '@material-ui/core/styles/colorManipulator';

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
        }
    }
    async componentWillMount(){
        const options = {
            method:"get",
            headers:{
              Accept:"application/json",
              "Content-Type":"application/json",
            },
        }
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
                    <img src={this.state.albumData.strAlbumThumb} className={classes.albumImage}/>
                </Grid>
                <Grid item xs={12} sm={7} md={8} lg={9} xl={10} >
                    <p className={classes.albumName} >{this.state.albumName}</p>
                    {this.state.albumData.strArtist &&
                    <p  ><span className={classes.label} >artist</span>  <span className={classes.value} >{this.state.albumData.strArtist}</span></p>
                    }
                    {this.state.albumData.intYearReleased &&
                    <p  ><span className={classes.label} >release in</span>  <span className={classes.value} >{this.state.albumData.intYearReleased}</span></p>
                    }
                    {this.state.albumData.strLabel &&
                    <p  ><span className={classes.label} >label</span>  <span className={classes.value} >{this.state.albumData.strLabel}</span></p>
                    }strDescriptionEN
                    
                </Grid>
            </Grid>
        )
    }
}
AlbumCard.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(AlbumCard);
