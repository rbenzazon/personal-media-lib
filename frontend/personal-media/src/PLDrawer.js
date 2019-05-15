import React, { Component } from 'react';
import {List,ListItem,ListItemIcon,ListItemText,Drawer} from '@material-ui/core';
import { PermMedia as ScanIcon, Favorite as FavorIcon} from '@material-ui/icons';
import { withStyles, createMuiTheme } from '@material-ui/core/styles';
import { Link } from "react-router-dom";
import {PlaylistContext} from './PlaylistContext';

const theme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
});

const styles = theme => ({
    appBar: {
        top: 'auto',
        bottom: 0,
    },
});

export class PLDrawer extends Component {
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
            <Drawer open={context.sideDrawer} onClose={() => context.toggleDrawer(false)}>
                <div
                    tabIndex={0}
                    role="button"
                    onClick={() => context.toggleDrawer(false)}
                    onKeyDown={() => context.toggleDrawer(false)}
                >
                    <List>
                    {
                        [{text:'Favorite tracks',icon:<FavorIcon />,click:null},{text:'Add media',icon:<ScanIcon/>,click:() => context.setImportOpen(true)}].map((item) => {
                        if(item.click){
                            return (
                            <ListItem button key={item.text} onClick={item.click}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                            )
                        }else{
                            return (
                            <Link to="/favorite" style={{ textDecoration: 'none' }}>
                                <ListItem button key={item.text} onClick={item.click}>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItem>
                            </Link>
                            )
                        }
                        
                    })
                    }
                    </List>
                </div>
            </Drawer>
        )}</PlaylistContext.Consumer>
    )
  }
}
export default withStyles(styles)(PLDrawer);
