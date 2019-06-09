import React from 'react';
import FolderLayout from './layout/FolderLayout';
import HomeLayout from './layout/HomeLayout';
import { Route,Switch } from "react-router-dom";
import {PlaylistProvider } from './PlaylistContext';
import {PlaylistContext} from './PlaylistContext';
import APAppBar from './layout/APAppBar';
import PLAppBar from './layout/PLAppBar';
import PLDrawer from './layout/PLDrawer';
import createBrowserHistory from 'history/createBrowserHistory'
import ReactGA from 'react-ga';
import { createMuiTheme,MuiThemeProvider } from '@material-ui/core/styles';
import { Router} from "react-router-dom";
import CreatePLDialog from './dialogs/CreatePLDialog';
import AddToPLDialog from './dialogs/AddToPLDialog';
import ImportDialog from './dialogs/ImportDialog';
import LoginDialog from './dialogs/LoginDialog';
import { CreateUserDialog } from './dialogs/CreateUserDialog';

ReactGA.initialize('UA-52487002-2');

const history = createBrowserHistory();
history.listen(location => {
	ReactGA.set({ page: location.pathname })
	ReactGA.pageview(location.pathname);
})


const theme = createMuiTheme({
    typography: {
      useNextVariants: true,
      //htmlFontSize: 16,
    },
    palette: {
        type: 'dark',
        background:{
            paper:'#303030',
            default:'#212121',
        },
        primary:{
            dark:'#baa0ea',
            main:'#baa0ea',
            contrastText:'#e0e0e0',
            light:'#e0e0e0',
        },
        secondary:{
            dark:'#ce9178',
            main:'#baa0ea',
            contrastText:'#e0e0e0',
            light:'#e0e0e0',
        }
    },
});

export default class App extends React.Component{
  componentDidMount() {
		ReactGA.pageview(window.location.pathname)
	}
  
  render(){
    return (
    <MuiThemeProvider theme={theme}>
      <Router history={history} >
        <PlaylistProvider >
          <React.Fragment>
            <div style={{width: '100%',height: '100%',display: 'flex',flexDirection: 'column',flexWrap: 'nowrap'}}>
            
            <div style={{flexGrow: '1',overflow: 'auto',minHeight: '2em'}}>
            <PlaylistContext.Consumer>{(context) => (
            <PLAppBar displaySearch={context.displaySearch} />
            )}</PlaylistContext.Consumer>
            <Switch>
            <Route exact path='/' render={(props) => <HomeLayout {...props} />} />
            <Route exact strict path={[
              "/folder",
              "/folder/",
              '/search/:searchKeyword',
              '/favorite',
              '/playlist/:playlistName',
              '/artist/:artistName',
              '/album/:albumName',
              '/genre/:genreName'
              ]} render={(props) => <FolderLayout {...props} />} />
            
            <Route exact strict path='/folder/*' render={(props) => <FolderLayout {...props} />} />
            </Switch>
            </div>
            <APAppBar />
            </div>
            <PLDrawer />
            <CreateUserDialog />
            <PlaylistContext.Consumer>{(context) => (
              <CreatePLDialog onCreatePlaylistSuccess={context.onCreatePlaylistSuccess}/>
            )}</PlaylistContext.Consumer>
            <LoginDialog />
            <AddToPLDialog />
            <ImportDialog />
          </React.Fragment>
        </PlaylistProvider>
      </Router>
    </MuiThemeProvider>
    )
  }
  
}

