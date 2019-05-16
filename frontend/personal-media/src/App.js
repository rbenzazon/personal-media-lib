import React from 'react';
import Layout from './Layout';
import { Route } from "react-router-dom";
import {PlaylistProvider } from './PlaylistContext';


function App(props) {
  return (
        <PlaylistProvider >
        <React.Fragment>
          <Route exact path='/' render={(props) => <Layout {...props} />} />
          <Route exact path='/favorite' render={(props) => <Layout {...props} />} />
          <Route path='/playlist/:playlistName' render={(props) => <Layout {...props} />} />
        </React.Fragment>
        </PlaylistProvider>
        );
}
export default App;
