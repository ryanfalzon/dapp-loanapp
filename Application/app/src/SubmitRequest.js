import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';

class SubmitRequest extends Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: 0,
            timestamp: 0,
            interest: 0
        };
    };

    changeHanlder = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({ [name]: value });
    };

    dateHandler = (date) => {
        this.setState({ timestamp: date });
    };

    submitHandler = (event) => {
        event.preventDefault();
        alert("You are submitting " + this.state.amount + " " + this.state.timestamp + " " + this.state.interest);
    };

    render() {
        return (
            <Card className="card">
                <CardContent>

                    <Typography className="title" color="textPrimary" gutterBottom>
                        Submit Loan Request
                    </Typography>

                    <Grid
                        container
                        direction="column"
                        justify="center"
                        alignItems="flex-start"
                    >
                        <form onSubmit={this.submitHandler}>
                            <TextField
                                id="amountField"
                                name="amount"
                                type="number"
                                label="Amount"
                                onChange={this.changeHanlder}
                                value={this.state.amount}
                                fullWidth
                            />

                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    id="timestampField"
                                    name="timestamp"
                                    disableToolbar
                                    variant="inline"
                                    format="MM/dd/yyyy"
                                    margin="normal"
                                    label="Date picker inline"
                                    value={this.state.timestamp}
                                    onChange={this.dateHandler}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                    fullWidth
                                />
                            </MuiPickersUtilsProvider>

                            <TextField
                                id="interestField"
                                name="interest"
                                type="number"
                                label="Interest"
                                onChange={this.changeHanlder}
                                value={this.state.interest}
                                fullWidth
                            />

                            <Button className="submitButton" type="submit" variant="contained" color="primary">
                                Submit Request
                            </Button>
                        </form>
                    </Grid>

                </CardContent>
            </Card>
        );
    }
}

export default SubmitRequest;