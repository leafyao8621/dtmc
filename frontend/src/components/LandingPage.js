import React, { Component } from "react";
import { Label, Input, Button } from "reactstrap";
import { w3cwebsocket } from 'websocket';
import LineChart from "./LineChart";

class LandingPage extends Component {
    ws = null;
    stale = true;
    valid_s0 = true;
    valid_t = true;
    constructor(props) {
        super(props);
        this.state = {
            dim: 3,
            iter: 100,
            hist: false,
            s0: ["1", "0", "0"],
            t: [
                ["0", "0.5", "0.5"],
                ["0.5", "0", "0.5"],
                ["0.5", "0.5", "0"]
            ],
            result: []
        };
    }
    componentDidMount() {
        this.ws = new w3cwebsocket(`ws://localhost:8000/ws/calculator/${this.props.location.state.userName}/`)
        this.ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            if (data.success) {
                this.stale = false;
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
                    {item}
                    <Input
                        type="number"
                        step="0.0000000000001"
                        value={this.state.s0[item]}
                        onChange={({ target }) => {
                            let s0 = [...this.state.s0];
                            this.valid_s0 =
                                !isNaN(
                                    parseFloat(target.value)
                                );
                            s0[item] = target.value;
                            this.setState({s0: s0});
                        }}
                    />
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
                                    <Input
                                        type="number"
                                        step="0.0000000000001"
                                        value={this.state.t[i][j]}
                                        onChange={({ target }) => {
                                            let t =
                                                JSON.parse(
                                                    JSON.stringify(
                                                        this.state.t
                                                    )
                                                );
                                            this.valid_t =
                                                !isNaN(
                                                    parseFloat(target.value)
                                                );
                                            t[i][j] = target.value;
                                            this.setState({t: t});
                                        }}
                                    />
                                </td>
                            );
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
        if (this.stale) {
            return (
                <tr></tr>
            )
        }
        if (this.state.hist) {
            return Array.from(Array(this.state.result.length).keys()).map((i) => {
                return (
                    <tr key={i + 1}>
                        <td key={0}>{i + 1}</td>
                        {
                            Array.from(
                                Array(this.state.result[i].length).keys()
                            ).map((j) => {
                                return (
                                    <td key={j + 1}>{this.state.result[i][j]}</td>
                                )
                            })
                        }
                    </tr>
                )
            })
        } else {
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
            if (this.valid_s0 && this.valid_t) {
                let s0 = this.state.s0.map((item) => parseFloat(item));
                let t = this.state.t.map((i) => {
                    return i.map((j) => {
                        return parseFloat(j);
                    });
                });
                this.ws.send(JSON.stringify({
                    s0: s0,
                    t: t,
                    iter: this.state.iter,
                    hist: this.state.hist
                }));
            } else {
                alert("invalid!");
            }
        }
        return (
            <main className="container">
                <h1>Logged in as {this.props.location.state.userName}</h1>
                <div>
                    <h2>Control</h2>
                    <div>
                        <Label>Dimension</Label>
                        <Input
                            key="dim"
                            min={1}
                            max={10}
                            onChange={({ target }) => {
                                this.stale = true;
                                let len = parseInt(target.value)
                                if (len > this.state.dim) {
                                    this.setState({
                                        s0: [...this.state.s0, 0],
                                        t: this.state.t.map((item) => {
                                            return [...item, 0];
                                        }).concat([Array(len).fill(0)]),
                                        dim: len
                                    });
                                } else {
                                    this.setState({
                                        s0: this.state.s0.slice(0, len),
                                        t: this.state.t.map((item) => {
                                            return item.slice(0, len);
                                        }).slice(0, len),
                                        dim: len
                                    });
                                }
                            }}
                            value={this.state.dim}
                            type="number"
                        />
                    </div>
                    <div>
                        <Label>Iterations</Label>
                        <Input
                            key="iter"
                            onChange={({ target }) => {
                                this.stale = true;
                                this.setState({iter: parseInt(target.value)}
                            )}}
                            value={this.state.iter}
                            type="number"
                        />
                    </div>
                    <div>
                        <Label>History</Label>
                        <Input
                            key="hist"
                            addon
                            type="checkbox"
                            checked={this.state.hist}
                            onChange={({ target }) => {
                                this.stale = true;
                                this.setState({hist: target.checked})
                            }}
                        />
                    </div>
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
                    <div>
                        <LineChart
                            stale={this.stale}
                            hist={this.state.hist}
                            data={this.state.result}
                        />
                    </div>
                    <div>
                        <table className="table">
                            { this.renderResultHeader() }
                            <tbody>
                                { this.renderResult() }
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        );
    }
}

export default LandingPage;
