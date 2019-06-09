import React, { Component } from 'react';
import {PlaylistContext} from '../PlaylistContext';
import {Clear as ClearIcon,Search as SearchIcon ,Menu as MenuIcon,Home as HomeIcon} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import {Paper,InputBase,AppBar,Toolbar,Typography,IconButton} from '@material-ui/core';
import {isMobile} from "react-device-detect";
import css from 'classnames';
import constants from '../ContextConstant'

import { lighten } from '@material-ui/core/styles/colorManipulator';

const getColor = (theme, type, opacity) => {
  const color =
    theme.palette[type][theme.palette.type === 'light' ? 'main' : 'dark'];

  if (!opacity) {
    return color;
  }

  return lighten(color, opacity);
};
const styles = theme => ({
    search: {
        margin: isMobile ? '0rem 0.2rem' : '0rem 0.5rem',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        right: 0,
        minWidth: '7rem',
        maxWidth: '20rem',
        width: isMobile ? '20%' : '20%',
        transition:'width 300ms cubic-bezier(0.4, 0, 0.2, 1) 150ms',
    },
    searchOpen:{
        width: (isMobile ? '80%' : '80%') + '!important',
    },
    grow: {
        flexGrow: 1,
    },
    searchIcon: {
        padding: '0.3rem',
    },
    input: {
        marginLeft: '0.3rem',
        flex: 1,
    },
    menuIcon:{
        //width: isMobile ? '20px' : '27px',
        height: isMobile ? '20px' : '27px',
    },
    menuButton: {
        margin: '0px',
        fill: `${getColor(theme, 'primary')} !important`,
        color: `${getColor(theme, 'primary')} !important`,
        '&:hover': {
            fill: `${getColor(theme, 'primary', 0.25)} !important`,
            color: `${getColor(theme, 'primary', 0.25)} !important`,
        },
    },
    appBarTitle:{
        padding: '0px 0.3rem',
        color:theme.palette.primary.contrastText,
    },
    toolBar:{
        padding: isMobile ? '0rem 0.3rem' : '0em 1rem',
    },
    appBar: {
        flexShrink:0,
        zIndex:'1200',
        boxShadow: 'none',
        backgroundColor: theme.palette.background.default,
    },
});

export class PLAppBar extends Component {
    static contextType = PlaylistContext;
    static defaultProps = {
        classes: {},
    };
    constructor(props){
        super(props);
        this.state = {
            searchKeyword:'',
            searchOpen:false,
        }
        this.onSearchChange = this.onSearchChange.bind(this);
        this.onSearchOpen = this.onSearchOpen.bind(this);
        this.onSearchKeyPress = this.onSearchKeyPress.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
    }
    onSearchChange(value){
        this.setState(state => ({searchKeyword:value}));
    }
    onSearchOpen(value){
        this.setState({searchOpen:value,searchKeyword:''});
    }
    onSearchKeyPress(e){
        if (e.key === 'Enter') {
            this.props.displaySearch(this.state.searchKeyword);
            //e.target.blur();
        }
    }
    clearSearch(){
        this.setState(state => ({
            searchKeyword:'',
            searchOpen:false,
        }));
    }
    render() {
        const {
            classes,
        } = this.props;
        return (
        <PlaylistContext.Consumer>{(context) => (
            <AppBar position="relative" className={classes.appBar} elevation={1}>
                <Toolbar className={classes.toolBar}>
                    <IconButton className={classes.menuButton} aria-label="Open menu" onClick={() => context.openDrawer(true)} >
                        <MenuIcon className={classes.menuIcon}/>
                    </IconButton>
                    <IconButton className={classes.menuButton} aria-label="Home" onClick={() => context.linkTo("/")} >
                        <HomeIcon className={classes.menuIcon}/>
                    </IconButton>
                    <div className={classes.grow} />
                    <Paper className={css(
                        classes['search'],
                        {[classes['searchOpen']]:this.state.searchOpen},
                    )} elevation={1}>
                        <IconButton 
                            className={classes.searchIcon}
                            aria-label="Search"
                            onClick={() => this.props.displaySearch(this.state.searchKeyword)}
                        >
                            <SearchIcon />
                        </IconButton>
                        <InputBase
                            onKeyPress={(e) => this.onSearchKeyPress(e)}
                            onChange={(e) => this.onSearchChange(e.target.value)}
                            onFocus={() => this.onSearchOpen(true)}
                            onBlur={() => this.onSearchOpen(false)}
                            value={this.state.searchKeyword}
                            placeholder="Search…"
                            className={classes.input}
                        />
                        {(this.state.searchOpen && this.state.searchKeyword != '') &&
                            <IconButton color="primary"
                                className={classes.searchIcon}
                                aria-label="clear search"
                                onClick={() => this.clearSearch()}
                            >
                            <ClearIcon />
                        </IconButton>}
                    </Paper>
                </Toolbar>
            </AppBar>
        )}</PlaylistContext.Consumer>
        )
  }
}
export default withStyles(styles)(PLAppBar);
