import React, { Component } from 'react'
import {Dialog,DialogActions,DialogContent,DialogTitle,Button} from '@material-ui/core';
import {PlaylistContext} from './PlaylistContext';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

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

export class CreateUserDialog extends Component {
    static defaultProps = {
        classes: {},
    };

    state = {
        name:"",
        email:"",
        password:"",
        confirmPassword:"",
        error:"",
        userId:"",
    }
    
    constructor(props){
        super(props);
        this.createUser = this.createUser.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onEmailChange = this.onEmailChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.onConfirmPasswordChange = this.onConfirmPasswordChange.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
    }
    onNameChange(newValue){
        this.setState({name:newValue});
    }
    onEmailChange(newValue){
        this.setState({email:newValue});
    }
    onPasswordChange(newValue){
        this.setState({password:newValue});
    }
    onConfirmPasswordChange(newValue){
        this.setState({confirmPassword:newValue});
    }
    closeDialog(context){
        context.onCreateUserOpenClose(false);
        this.setState({name:"",email:"",password:"",confirmPassword:"",userId:"",error:""});
    }
    async createUser(context){
        if(this.state.password !== this.state.confirmPassword){
            this.setState({error:"password and confirm password must be identical"});
            return;
        }
        const res = await fetch('/api/user/register', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: this.state.name,
                email: this.state.email,
                password: this.state.password,
                type:1,
            })
        })
        
        const jsonBody = await res.json();
        if(res.status >= 400){
            const errorDetail = jsonBody.message ? jsonBody.message : "";
            this.setState({error:"status "+res.status+"\n"+errorDetail});
        }else{
            this.setState({error:"",userId:jsonBody.user});
            //context.onLoggedIn(jsonBody.name,jsonBody.type);
        }
    }
    render() {
        const {
            classes,
        } = this.props;
        return (
            <PlaylistContext.Consumer>{(context) => (
                <Dialog
                    open={context.state.createUserOpen}
                    onClose={() => this.closeDialog(context)}
                    aria-labelledby="login"
                    aria-describedby="login"
                    >
                    <DialogTitle id="alert-dialog-title">Login</DialogTitle>
                    <DialogContent>
                        
                        <form noValidate autoComplete="off">
                            <TextField 
                                label="name"
                                value={this.state.name}
                                onChange={(e) => this.onNameChange(e.target.value)}
                                className={classes.input}
                            />
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
                            <TextField
                                label="confirm password"
                                value={this.state.confirmPassword}
                                type="password"
                                onChange={(e) => this.onConfirmPasswordChange(e.target.value)}
                                style={{width:'100%'}}
                                className={classes.input}
                            />
                        </form>
                        
                        {(this.state.error === '' && this.state.userId !== '' ) &&
                            <p className={classes.status} >User id : {this.state.userId}</p>
                        }
                        {this.state.error !== '' &&
                            <p className={classes.errorStatus} >{this.state.error}</p>
                        }
                    </DialogContent>
                    <DialogActions>
                        <Button className={classes.cancelButton} onClick={() => this.closeDialog(context)} color="secondary">
                        Cancel
                        </Button>
                        <Button onClick={() => this.createUser(context)} color="primary" autoFocus>
                        Connect
                        </Button>
                    </DialogActions>
                </Dialog>
            )}</PlaylistContext.Consumer>
        )
    }
}
CreateUserDialog.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(CreateUserDialog);
