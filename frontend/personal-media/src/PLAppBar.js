import React, { Component } from 'react';
import {PlaylistContext} from './PlaylistContext';
import {Clear as ClearIcon,Search as SearchIcon ,Menu as MenuIcon} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import {Paper,InputBase,AppBar,Toolbar,Typography,IconButton} from '@material-ui/core';
import {isMobile} from "react-device-detect";
import css from 'classnames';
import constants from './ContextConstant'

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
        margin: isMobile ? '0em 0.2em' : '0em 0.5em',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        right: 0,
        minWidth: '7em',
        maxWidth: '20em',
        width: isMobile ? '20%' : '20%',
        transition:'width 300ms cubic-bezier(0.4, 0, 0.2, 1) 150ms',
    },
    searchOpen:{
        width: isMobile ? '80%' : '80%' + '!important',
    },
    grow: {
        flexGrow: 1,
    },
    searchIcon: {
        padding: '0.3em',
    },
    input: {
        marginLeft: '0.3em',
        flex: 1,
    },
    menuButton: {
        padding: isMobile ? '0em 1.5em' : '0em 1em',
        margin: '0px',
        
        width: isMobile ? '20px' : '27px',
        height: isMobile ? '20px' : '27px',
        fill: `${getColor(theme, 'primary')} !important`,
        color: `${getColor(theme, 'primary')} !important`,
        '&:hover': {
            fill: `${getColor(theme, 'primary', 0.25)} !important`,
            color: `${getColor(theme, 'primary', 0.25)} !important`,
        },
    },
    appBarTitle:{
        padding: '0px 0.3em',
        color:theme.palette.primary.contrastText,
    },
    toolBar:{
        padding: isMobile ? '0em 0.3em' : '0em 1em',
    },
    appBar: {
        zIndex:'2',
        boxShadow: 'none',
        backgroundColor: theme.palette.background.default,
    },
});

export class PLAppBar extends Component {
    static contextType = PlaylistContext;
    static defaultProps = {
        classes: {},
    };
    render() {
        const {
            classes,
        } = this.props;
        return (
        <PlaylistContext.Consumer>{(context) => (
            <AppBar position="static" className={classes.appBar} elevation={1}>
                <Toolbar className={classes.toolBar}>
                    {!context.state.searchOpen && <IconButton className={classes.menuButton} aria-label="Open menu" onClick={() => context.toggleDrawer(true)} >
                        <MenuIcon />
                    </IconButton>}
                    {!context.state.searchOpen && <Typography className={classes.appBarTitle} variant="h6" color="inherit">
                    {context.state.title}
                    </Typography>}
                    <div className={classes.grow} />
                    <Paper className={css(
                        classes['search'],
                        {[classes['searchOpen']]:context.state.searchOpen},
                    )} elevation={1}>
                        <IconButton 
                            className={classes.searchIcon}
                            aria-label="Search"
                            onClick={() => context.displaySearch()}
                        >
                            <SearchIcon />
                        </IconButton>
                        <InputBase
                            onKeyPress={(e) => context.onSearchKeyPress(e)}
                            onChange={(e) => context.onSearchChange(e.target.value)}
                            onFocus={() => context.onSearchOpen(true)}
                            onBlur={() => context.onSearchOpen(false)}
                            value={context.state.searchKeyword}
                            placeholder="Search…"
                            className={classes.input}
                        />
                        {context.state.searchOpen && <IconButton color="primary"
                            className={classes.searchIcon}
                            aria-label="clear search"
                            onClick={() => context.state.displayedItemMode === constants.SEARCH_MODE && context.clearSearch()}
                            disabled={context.state.displayedItemMode !== constants.SEARCH_MODE}
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
