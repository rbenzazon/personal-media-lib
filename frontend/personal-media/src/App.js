import React from 'react';
import Layout from './Layout';
import { Route } from "react-router-dom";
import {PlaylistProvider } from './PlaylistContext';


function App() {
  return (
      
        <React.Fragment>
          <Route exact path='/' render={(props) => <PlaylistProvider {...props} ><Layout  /></PlaylistProvider>} />
          <Route exact path='/favorite' render={(props) => <PlaylistProvider {...props} ><Layout  /></PlaylistProvider>} />
        </React.Fragment>
      
        );
}
export default App;
