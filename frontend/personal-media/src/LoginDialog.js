import React, { Component } from 'react'
import {Dialog,DialogActions,DialogContent,DialogTitle,Button} from '@material-ui/core';
import {PlaylistContext} from './PlaylistContext';
import TextField from '@material-ui/core/TextField';

export class LoginDialog extends Component {
    state = {
        email:"",
        password:"",
        message:"",
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
    async login(){
        const res = await fetch('/api/user/login', {
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
        if(res.status >= 400){
            this.setState({message:"login invalid"});
        }else{
            this.setState({message:"logged in"});
        }
    }
    render() {
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
                        <form noValidate autoComplete="off">
                            <TextField label="email" value={this.state.email} onChange={(e) => this.onEmailChange(e.target.value)} />
                            <TextField label="password" value={this.state.password} onChange={(e) => this.onPasswordChange(e.target.value)} />
                        </form>
                        {this.state.message}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => context.onLoginOpenClose(false)} color="secondary">
                        Cancel
                        </Button>
                        <Button onClick={() => this.login()} color="primary" autoFocus>
                        Connect
                        </Button>
                    </DialogActions>
                </Dialog>
            )}</PlaylistContext.Consumer>
        )
    }
}

export default LoginDialog
