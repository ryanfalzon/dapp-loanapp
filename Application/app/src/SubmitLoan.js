import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

class SubmitLoan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRequest: ''
        };
    };

    getRequests = () => {
        return ['0x0', '0x1', '0x2'];
    };

    changeHanlder = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({ [name]: value });
    };

    submitHandler = (event) => {
        event.preventDefault();
        alert("You are submitting " + this.state.selectedRequest);
    };

    render() {
        return (
            <Card className="card">
                <CardContent>

                    <Typography className="title" color="textPrimary" gutterBottom>
                        Submit Loan
                    </Typography>

                    <Grid
                        container
                        direction="column"
                        justify="center"
                        alignItems="flex-start"
                    >
                        <form onSubmit={this.submitHandler}>
                            <FormControl className="formControl">
                                <InputLabel id="requestLabel">Request</InputLabel>
                                <Select
                                    labelId="requestLabel"
                                    id="requestSelect"
                                    name="selectedRequest"
                                    onChange={this.changeHanlder}
                                    value={this.state.selectedRequest}
                                >
                                    {this.getRequests().map((item, index) => (
                                        <MenuItem key={index} value={item}>{item}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

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

export default SubmitLoan;