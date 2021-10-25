import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import {
    Button,
    Form,
    FormGroup,
    Input,
    Label,
} from "reactstrap";

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: "",
            loggedIn: false
        };
    }

    render() {
        const login = (e) => {
            e.preventDefault();
            this.setState({loggedIn: true});
        }
        if (this.state.loggedIn) {
            return (
                <Redirect
                    to={{
                        pathname: "/landing",
                        state: {
                            userName: this.state.userName
                        }
                    }}
                />
            )
        }
        return (
            <main className="container">
                <h1>XSS</h1>
                <Form onSubmit={login}>
                    <FormGroup>
                        <Label for="un">User Name</Label>
                        <Input
                            type="text"
                            id="un"
                            placeholder="Enter a user name"
                            onChange={({ target }) => {
                                this.setState({userName: target.value}
                            )}}
                        />
                    </FormGroup>
                    <Button type="submit">Login</Button>
                </Form>
            </main>
        );
    }
}

export default LoginPage;
