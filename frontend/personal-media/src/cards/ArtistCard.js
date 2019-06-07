import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Grid} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import {Link} from '@material-ui/icons'
import css from 'classnames';
import {PlaylistContext} from '../PlaylistContext';

function Twitter(props) {
    return (
      <SvgIcon {...props}>
        <path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M17.71,9.33C18.19,8.93 18.75,8.45 19,7.92C18.59,8.13 18.1,8.26 17.56,8.33C18.06,7.97 18.47,7.5 18.68,6.86C18.16,7.14 17.63,7.38 16.97,7.5C15.42,5.63 11.71,7.15 12.37,9.95C9.76,9.79 8.17,8.61 6.85,7.16C6.1,8.38 6.75,10.23 7.64,10.74C7.18,10.71 6.83,10.57 6.5,10.41C6.54,11.95 7.39,12.69 8.58,13.09C8.22,13.16 7.82,13.18 7.44,13.12C7.81,14.19 8.58,14.86 9.9,15C9,15.76 7.34,16.29 6,16.08C7.15,16.81 8.46,17.39 10.28,17.31C14.69,17.11 17.64,13.95 17.71,9.33Z" />
      </SvgIcon>
    );
}

function Facebook(props) {
    return (
      <SvgIcon {...props}>
        <path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M18,5H15.5A3.5,3.5 0 0,0 12,8.5V11H10V14H12V21H15V14H18V11H15V9A1,1 0 0,1 16,8H18V5Z" />
      </SvgIcon>
    );
}

const styles = theme => ({
    artistImage:{
        width:"100%",
    },
    artistGridItem:{
        //maxWidth:"200px",
        padding:"40px !important",
    },
    artistBioContainer:{
        width:"100%",
        maxHeight:"150px",
        overflow:"hidden",
    },
    artistBio:{
        display: "-webkit-box",
        color:theme.palette.secondary.contrastText,
        transition:'height 300ms cubic-bezier(0.4, 0, 0.2, 1) 150ms',
        fontSize:"13px",
    },
    artistBioContracted:{
        textOverflow:"ellipsis",
        "-webkit-line-clamp":"6",
        "-webkit-box-orient": "vertical",  
        overflow: "hidden",
        maxHeight:"110px",
    },
    artistBioMore:{
        cursor:"pointer",
        color:theme.palette.secondary.contrastText,
        fontSize:"13px",
    },
    artistName:{
        fontSize:"24px",
        color:theme.palette.secondary.contrastText,
        width:"100%",
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        'white-space': 'nowrap',
    },
    container:{
        padding:"30px",
    },
    links:{
        cursor:"pointer",
        width:"32px",
        height:"32px",
        padding:"0 10px",
    },
});

export class ArtistCard extends Component {
    static defaultProps = {
        classes: {},
    };
    constructor(props){
        super(props);
        this.state={
            artistName:decodeURIComponent(this.props.match.params.artistName),
            artistData:{},
            artistBioExpanded:false,
        }
        this.onReadMoreBio = this.onReadMoreBio.bind(this);
    }
    onReadMoreBio(){
        this.setState(state=>({artistBioExpanded:!state.artistBioExpanded}));
    }
    async componentWillMount(){
        const res = await fetch("https://theaudiodb.com/api/v1/json/195003/search.php?s="+this.props.match.params.artistName);
        const artistData = await res.json();
        if(artistData.artists === null){
            return;
        }
        this.setState({artistData:artistData.artists[0]});
    }
    render() {
        const {
            classes,
        } = this.props;
        return (
            <Grid container className={classes.container}>
                <Grid item xs={12} sm={5} md={4} lg={3} xl={2} className={classes.artistGridItem}>
                    <img src={this.state.artistData.strArtistThumb} alt={this.state.artistName+" picture"} className={classes.artistImage}/>
                </Grid>
                <Grid item xs={12} sm={7} md={8} lg={9} xl={10}>
                    <p className={classes.artistName} >{this.state.artistName}</p>
                    {this.state.artistData.strFacebook &&
                    <Facebook color="primary" className={classes.links} onClick={()=>window.open("http://"+this.state.artistData.strFacebook)}/>
                    }
                    {this.state.artistData.strTwitter &&
                    <Twitter color="primary" className={classes.links} onClick={()=>window.open("http://"+this.state.artistData.strTwitter)}/>
                    }
                    {this.state.artistData.strWebsite &&
                    <Link color="primary" className={classes.links} onClick={()=>window.open("http://"+this.state.artistData.strWebsite)}/>
                    }
                    <p className={css(
                        classes["artistBio"],
                        {[classes["artistBioContracted"]]:!this.state.artistBioExpanded},
                        )} >{this.state.artistData.strBiographyEN}</p>
                    <p className={classes.artistBioMore} onClick={this.onReadMoreBio}>
                        {!this.state.artistBioExpanded && "...read more"}
                        {this.state.artistBioExpanded && "...read less"}
                    </p>
                    
                </Grid>
            </Grid>
        )
    }
}
ArtistCard.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(ArtistCard);
