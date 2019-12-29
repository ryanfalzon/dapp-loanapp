import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

class SubmitGuarantee extends Component {
    constructor(props) {
        super(props);
        this.state = {
            interest: 0
        };
    };

    changeHanlder = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({ [name]: value });
    };

    submitHandler = (event) => {
        event.preventDefault();
        alert("You are submitting " + this.state.interest);
    };

    render() {
        return (
            <Card className="card">
                <CardContent>

                    <Typography className="title" color="textPrimary" gutterBottom>
                        Submit Guarantee
                    </Typography>

                    <Grid
                        container
                        direction="column"
                        justify="center"
                        alignItems="flex-start"
                    >
                        <form onSubmit={this.submitHandler}>

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

export default SubmitGuarantee;