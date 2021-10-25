import React, { Component } from "react";
import { Input, Button } from "reactstrap";
import { w3cwebsocket } from 'websocket';

class LandingPage extends Component {
    ws = null;
    constructor(props) {
        super(props);
        this.state = {
            dim: 3,
            iter: 100,
            hist: false,
            s0: [1, 0, 0],
            t: [
                [0, 0.5, 0.5],
                [0.5, 0, 0.5],
                [0.5, 0.5, 0]
            ],
            result: []
        };
    }
    componentDidMount() {
        this.ws = new w3cwebsocket(`ws://localhost:8000/ws/calculator/${this.props.location.state.userName}/`)
        this.ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            console.log(data);
            if (data.success) {
                this.setState({
                    result: data.result
                });
            } else {
                alert("Failed");
            }
        }
    }
    componentWillUnmount() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
    renderInitial() {
        return Array.from(Array(this.state.dim).keys()).map((item) => {
            return (
                <td key={item}>
                    {item}<Input />
                </td>
            )
        })
    }
    renderTransition() {
        return Array.from(Array(this.state.dim).keys()).map((i) => {
            return (
                <tr key={i}>
                    {
                        Array.from(Array(this.state.dim).keys()).map((j) => {
                            return (
                                <td key={`${i}-${j}`}>
                                    {`${i}-${j}`}
                                    <Input />
                                </td>
                            )
                        })
                    }
                </tr>
            )
        });
    }
    renderResultHeader() {
        return (
            <thead>
                <tr>
                    <th key={0}>Time</th>
                    {
                        Array.from(Array(this.state.dim).keys()).map((i) => {
                            return (
                                <th key={i + 1}>State {i}</th>
                            )
                        })
                    }
                </tr>
            </thead>
        );
    }
    renderResult() {
        if (this.state.hist) {
            return Array.from(Array(this.state.result.length).keys()).map((i) => {
                return (
                    <tr key={i + 1}>
                        <td>{i + 1}</td>
                        {
                            this.state.result[i].map((item) => {
                                return (
                                    <td>{item}</td>
                                )
                            })
                        }
                    </tr>
                )
            })
        } else {
            if (!this.state.result.length) {
                return (
                    <tr></tr>
                );
            }
            return (
                <tr key={0}>
                    <td key={0}>{this.state.iter}</td>
                    {
                        Array.from(Array(this.state.result.length).keys()).map(
                            (i) => {
                                return (
                                    <td key={i + 1}>{this.state.result[i]}</td>
                                )
                            }
                        )
                    }
                </tr>
            );
        }
    }
    render() {
        let handler = (e) => {
            this.ws.send(JSON.stringify({
                s0: this.state.s0,
                t: this.state.t,
                iter: this.state.iter,
                hist: this.state.hist
            }));
        }
        return (
            <main className="container">
                <h1>Logged in as {this.props.location.state.userName}</h1>
                <div>
                    <h2>Control</h2>
                    <div><Button onClick={handler}>Run</Button></div>
                    <h2>Initial State</h2>
                    <table>
                        <tbody>
                            <tr>
                                { this.renderInitial() }
                            </tr>
                        </tbody>
                    </table>
                    <h2>Transition</h2>
                    <table>
                        <tbody>
                            { this.renderTransition() }
                        </tbody>
                    </table>
                    <h2>Result</h2>
                    <table>
                        { this.renderResultHeader() }
                        <tbody>
                            { this.renderResult() }
                        </tbody>
                    </table>
                </div>
            </main>
        );
    }
}

export default LandingPage;
