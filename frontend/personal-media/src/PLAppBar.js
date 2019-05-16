import React, { Component } from 'react';
import {PlaylistContext} from './PlaylistContext';
import {Clear as ClearIcon,Search as SearchIcon ,Menu as MenuIcon} from '@material-ui/icons';
import { withStyles,createMuiTheme } from '@material-ui/core/styles';
import {Paper,InputBase,AppBar,Toolbar,Typography,IconButton} from '@material-ui/core';

import { lighten } from '@material-ui/core/styles/colorManipulator';

const getColor = (theme, type, opacity) => {
  const color =
    theme.palette[type][theme.palette.type === 'light' ? 'main' : 'dark'];

  if (!opacity) {
    return color;
  }

  return lighten(color, opacity);
};
const theme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
});
const styles = theme => ({
    search: {
        margin: '0em 3em',
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: 400,
    },
    searchIcon: {
        padding: 10,
    },
    input: {
        marginLeft: 8,
        flex: 1,
    },
    menuButton: {
        padding: '0px 10px',
        margin: '0px',
        width: '27px',
        height: '27px',
        fill: `${getColor(theme, 'primary')} !important`,
        color: `${getColor(theme, 'primary')} !important`,
        '&:hover': {
            fill: `${getColor(theme, 'primary', 0.25)} !important`,
            color: `${getColor(theme, 'primary', 0.25)} !important`,
        },
    },
    appBarTitle:{
        padding: '0px 20px',
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
            <AppBar position="static" color="default">
                <Toolbar>
                    <IconButton className={classes.menuButton} aria-label="Open menu" onClick={() => context.toggleDrawer(true)} >
                        <MenuIcon />
                    </IconButton>
                    <Typography className={classes.appBarTitle} variant="h6" color="inherit">
                    {context.state.favoriteTracks ? 'Favorite tracks' : context.state.currentFolder.title}
                    </Typography>
                    <Paper className={classes.search} elevation={1}>
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
                            value={context.state.searchKeyword}
                            placeholder="Search…"
                            className={classes.input}
                        />
                        <IconButton color="primary"
                            className={classes.searchIcon}
                            aria-label="clear search"
                            onClick={() => context.clearSearch()}
                            disabled={context.state.searchDisplay === false}
                        >
                            <ClearIcon />
                        </IconButton>
                    </Paper>
                </Toolbar>
            </AppBar>
        )}</PlaylistContext.Consumer>
        )
  }
}
export default withStyles(styles)(PLAppBar);
