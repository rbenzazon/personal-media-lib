import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import {PlaylistContext} from '../PlaylistContext';
import css from 'classnames';

const getGreyColor = (theme, opacity) => {
      const greyColor = theme.palette.grey['500'];
    
      if (!opacity) {
        return greyColor;
      }
    
      return lighten(greyColor, opacity);
};

const styles = theme => ({
    label:{
        color:getGreyColor(theme),
        fontSize:"13px",
    },
    value:{
        color:theme.palette.secondary.contrastText,
        fontSize:"13px",
        //margin:"0 20px 0 10px",
    },
    searchKeyword:{
        fontSize:"24px",
        color:theme.palette.secondary.contrastText,
        margin:"0 0.7rem",
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        'white-space': 'nowrap',
    },
    container:{
        padding:"0.1rem 1rem",
    },
});

export class SearchCard extends Component {
    static defaultProps = {
        classes: {},
    };
    constructor(props){
        super(props);
        this.state={
            searchKeyword:decodeURIComponent(this.props.match.params.searchKeyword),
        }
    }
    /*componentWillReceiveProps(nextProps, nextState){
        if(nextProps.match.params.searchKeyword != this.state.searchKeyword){
            this.setState({searchKeyword:nextProps.match.params.searchKeyword});
        }
    }*/
    render() {
        const {
            classes,
        } = this.props;
        return (
            <PlaylistContext.Consumer>{(context) => (
                <div className={classes.container} >
                    <p>
                        <span className={classes.label} >search results for </span>
                        <span className={classes.searchKeyword} >{this.state.searchKeyword}</span>
                        <span className={classes.value} >{context.state.displayedItems.length}</span>
                        <span className={classes.label} > results</span>
                    </p>
                </div>
            )}</PlaylistContext.Consumer>
        )
    }
}
SearchCard.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(SearchCard);
