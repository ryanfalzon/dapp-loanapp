import React, { Component } from 'react';
import Loans from './Loans';
import SubmitLoan from './SubmitLoan';
import Grid from '@material-ui/core/Grid';

class Lender extends Component {

    render() {
        return (
            <Grid container
                direction="row"
                justify="space-between"
                alignItems="flex-start"
                spacing={3}
            >
                <Grid item xs={6}>
                    <SubmitLoan />
                </Grid>
                <Grid item xs={6}>
                    <Loans />
                </Grid>
            </Grid>
        );
    }
}

export default Lender;