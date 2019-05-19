import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router} from "react-router-dom";
import { createMuiTheme,MuiThemeProvider } from '@material-ui/core/styles';

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

ReactDOM.render(
<MuiThemeProvider theme={theme}>
    <Router>
        <App />
    </Router>
</MuiThemeProvider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
