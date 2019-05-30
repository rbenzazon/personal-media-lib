import React, { Component } from 'react'
import {Dialog,DialogActions,DialogContent,DialogTitle,Button} from '@material-ui/core';
import {PlaylistContext} from './PlaylistContext';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import constants from './ContextConstant';

const styles = theme => ({
    input:{
        width:'100%',
        color:theme.palette.secondary.contrastText,
    },
    status:{
        fontSize:'0.9rem !important',
        color:theme.palette.secondary.contrastText,
    },
    errorStatus:{
        fontSize:'0.9rem !important',
        color:theme.palette.secondary.dark,
    },
    cancelButton:{
        color:theme.palette.secondary.contrastText,
    },
});

export class LoginDialog extends Component {
    static defaultProps = {
        classes: {},
    };

    state = {
        email:"",
        password:"",
        error:"",
    }
    
    constructor(props){
        super(props);
        this.login = this.login.bind(this);
        this.onEmailChange = this.onEmailChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
    }
    onEmailChange(newValue){
        this.setState({email:newValue});
    }
    onPasswordChange(newValue){
        this.setState({password:newValue});
    }
    async login(context){
        const res = await fetch(process.env.REACT_APP_SERV_URL+'api/user/login', {
            crossDomain:true,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: this.state.email,
                password: this.state.password,
            })
        })
        
        const jsonBody = await res.json();
        if(res.status >= 400){
            const errorDetail = jsonBody.message ? jsonBody.message : "";
            this.setState({error:"status "+res.status+"\n"+errorDetail});
        }else{
            this.setState({error:""});
            context.onLoggedIn(jsonBody.name,jsonBody.type);
        }
    }
    render() {
        const {
            classes,
        } = this.props;
        return (
            <PlaylistContext.Consumer>{(context) => (
                <Dialog
                    open={context.state.loginOpen}
                    onClose={() => context.onLoginOpenClose(false)}
                    aria-labelledby="login"
                    aria-describedby="login"
                    >
                    <DialogTitle id="alert-dialog-title">Login</DialogTitle>
                    <DialogContent>
                        {!context.state.loggedIn &&
                        <form noValidate autoComplete="off">
                            <TextField 
                                label="email"
                                value={this.state.email}
                                onChange={(e) => this.onEmailChange(e.target.value)}
                                className={classes.input}
                            />
                            <TextField
                                label="password"
                                value={this.state.password}
                                type="password"
                                onChange={(e) => this.onPasswordChange(e.target.value)}
                                style={{width:'100%'}}
                                className={classes.input}
                            />
                        </form>
                        }
                        {context.state.loggedIn &&
                            <p className={classes.status} >Logged in as {context.state.loginName}</p>
                        }
                        {this.state.error != '' &&
                            <p className={classes.errorStatus} >{this.state.error}</p>
                        }
                    </DialogContent>
                    <DialogActions>
                        <Button className={classes.cancelButton} onClick={() => context.onLoginOpenClose(false)} color="secondary">
                        Cancel
                        </Button>
                        <Button onClick={() => this.login(context)} color="primary" autoFocus>
                        Connect
                        </Button>
                    </DialogActions>
                </Dialog>
            )}</PlaylistContext.Consumer>
        )
    }
}
LoginDialog.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(LoginDialog);
