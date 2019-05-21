import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Grid} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import css from 'classnames';

const styles = theme => ({
    albumImage:{
        width:"100%",
    },
    albumGridItem:{
        //maxWidth:"200px",
        padding:"40px !important",
    },

    albumName:{
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
        this.setState({albumData:albumData.album[0]});
    }
    render() {
        const {
            classes,
        } = this.props;
        return (
            <Grid container spacing="16" className={classes.container}>
                <Grid item xs={12} sm={5} md={4} lg={3} xl={2} className={classes.albumGridItem}>
                    <img src={this.state.albumData.strAlbumThumb} className={classes.albumImage}/>
                </Grid>
                <Grid item xs={12} sm={7} md={8} lg={9} xl={10} >
                    <p className={classes.albumName} >{this.state.albumName}</p>
                </Grid>
            </Grid>
        )
    }
}
AlbumCard.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(AlbumCard);
