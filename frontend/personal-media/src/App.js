import React from 'react';
import FolderLayout from './FolderLayout';
import HomeLayout from './HomeLayout';
import { Route,Switch } from "react-router-dom";
import {PlaylistProvider } from './PlaylistContext';
import APAppBar from './APAppBar';
import PLAppBar from './PLAppBar';
import createHistory from 'history/createBrowserHistory'
import ReactGA from 'react-ga';
import { createMuiTheme,MuiThemeProvider } from '@material-ui/core/styles';
import { Router} from "react-router-dom";

ReactGA.initialize('UA-52487002-2');

const history = createHistory();
history.listen(location => {
	ReactGA.set({ page: location.pathname })
	ReactGA.pageview(location.pathname);
})


const theme = createMuiTheme({
    typography: {
      useNextVariants: true,
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
            <PLAppBar />
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
            <APAppBar />
          </React.Fragment>
        </PlaylistProvider>
      </Router>
    </MuiThemeProvider>
    )
  }
  
}

