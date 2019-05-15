import React, { Component } from 'react';
import {PlaylistContext} from './PlaylistContext';
import {Clear as ClearIcon,Search as SearchIcon ,Menu as MenuIcon} from '@material-ui/icons';
import { withStyles,createMuiTheme } from '@material-ui/core/styles';
import {Paper,InputBase,AppBar,Toolbar,Typography,IconButton} from '@material-ui/core';
import { lighten } from '@material-ui/core/styles/colorManipulator';


const theme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
});
const getGreyColor = (theme, opacity) => {
    const greyColor = theme.palette.grey['500'];
  
    if (!opacity) {
      return greyColor;
    }
  
    return lighten(greyColor, opacity);
};
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
});

export class PLAppBar extends Component {
    static contextType = PlaylistContext;
    static defaultProps = {
        classes: {},
        classNames: {},
    };
    render() {
        const {
            classes,
            classNames: {
            },
        } = this.props;
        return (
        <PlaylistContext.Consumer>{(context) => (
            <AppBar position="static" color="default">
                <Toolbar>
                    <IconButton aria-label="Open menu" onClick={() => context.toggleDrawer(true)} >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" color="inherit">
                    {context.favoriteTracks ? 'Favorite tracks' : context.currentFolder.title}
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
                            value={context.searchKeyword}
                            placeholder="Search…"
                            className={classes.input}
                        />
                        <IconButton color="primary"
                            className={classes.searchIcon}
                            aria-label="clear search"
                            onClick={() => context.clearSearch()}
                            disabled={context.searchDisplay == false}
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
