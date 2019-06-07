import React, { Component } from 'react';
import {List,ListItem,ListItemIcon,ListItemText,Drawer} from '@material-ui/core';
import {PersonAdd as AddUserIcon,AccountCircle as LoginIcon,VerifiedUser as UserIcon,Home as HomeIcon,Folder as FilesIcon, PermMedia as ScanIcon, Favorite as FavorIcon,PlaylistPlay as PlaylistIcon, PlaylistAdd as PlaylistAddIcon} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import { Link } from "react-router-dom";
import {PlaylistContext} from '../PlaylistContext';
import Divider from '@material-ui/core/Divider';

const styles = theme => ({
});

export class PLDrawer extends Component {
    static contextType = PlaylistContext;
    static defaultProps = {
        classes: {},
        classNames: {},
    };

    render() {
        
    return (
        <PlaylistContext.Consumer>{(context) => (
            <Drawer open={context.state.sideDrawer} onClose={() => context.toggleDrawer(false)}>
                <div
                    tabIndex={0}
                    role="button"
                    onClick={() => context.toggleDrawer(false)}
                    onKeyDown={() => context.toggleDrawer(false)}
                >
                    <List>
                    {
                        [
                            {text:'Home',icon:<HomeIcon />,click:"/"},
                            {text:'My Files',icon:<FilesIcon />,click:"/folder/"},
                            {text:context.state.loggedIn?'Logoff '+context.state.loginName:"Login",icon:context.state.loggedIn?<UserIcon/>:<LoginIcon/>,click:() => context.onLoginOpenClose(true)},
                        ].map((item) => {
                        if(typeof item.click == "function"){
                            return (
                            <ListItem button key={item.text} onClick={item.click}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                            )
                        }else{
                            return (
                            <Link to={item.click} key={item.text} style={{ textDecoration: 'none' }}>
                                <ListItem button selected={context.isRoute(item.click)}>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItem>
                            </Link>
                            )
                        }
                    })
                    }
                    <Divider />
                    {
                        [
                            {text:'Favorite tracks',icon:<FavorIcon />,click:"/favorite"},
                            {text:'Create playlist',icon:<PlaylistAddIcon/>,click:() => context.onCreatePlaylistOpenClose(true)},
                        ].map((item) => {
                            if(typeof item.click == "function"){
                                return (
                                <ListItem button key={item.text} onClick={item.click} >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItem>
                                )
                            }else{
                                return (
                                <Link to={item.click} key={item.text} style={{ textDecoration: 'none' }} >
                                    <ListItem button selected={context.isRoute(item.click)}>
                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.text} />
                                    </ListItem>
                                </Link>
                                )
                            }
                        })
                    }
                    {context.state.playLists.map(item=>{
                            return (
                            <Link to={"/playlist/"+item.title} key={item.title} style={{ textDecoration: 'none' }} >
                                <ListItem button selected={context.isRoute("/playlist/"+item.title)}>
                                    <ListItemIcon><PlaylistIcon /></ListItemIcon>
                                    <ListItemText primary={item.title} ></ListItemText>
                                </ListItem>
                            </Link>
                            )
                    })}
                    {(context.state.loggedIn && context.state.loginType === 0) &&
                        <Divider />
                    }
                    {(context.state.loggedIn && context.state.loginType === 0) &&
                        [
                            {text:'Create user',icon:<AddUserIcon/>,click:() => context.onCreateUserOpenClose(true)},
                            {text:'Add media',icon:<ScanIcon/>,click:() => context.setImportOpen(true)},
                        ].map((item) => {return (
                                <ListItem button key={item.text} onClick={item.click}>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItem>
                            )})
                    }
                    </List>
                </div>
            </Drawer>
        )}</PlaylistContext.Consumer>
    )
  }
}
export default withStyles(styles)(PLDrawer);
