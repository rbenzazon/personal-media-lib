import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Grid} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import css from 'classnames';

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
        
    },
    artistBioMore:{
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
        const options = {
            method:"get",
            headers:{
              Accept:"application/json",
              "Content-Type":"application/json",
            },
        }
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
            <Grid container spacing="16" className={classes.container}>
                <Grid item xs={12} sm={5} md={4} lg={3} xl={2} className={classes.artistGridItem}>
                    <img src={this.state.artistData.strArtistThumb} className={classes.artistImage}/>
                </Grid>
                <Grid item xs={12} sm={7} md={8} lg={9} xl={10}>
                    <p className={classes.artistName} >{this.state.artistName}</p>
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
