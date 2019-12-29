import React, { Component } from 'react';
import Requests from './Requests';
import SubmitRequest from './SubmitRequest';
import Grid from '@material-ui/core/Grid';

class Borrower extends Component {

    render() {
        return (
            <Grid container
                direction="row"
                justify="space-between"
                alignItems="flex-start"
                spacing={3}
            >
                <Grid item xs={6}>
                    <SubmitRequest />
                </Grid>
                <Grid item xs={6}>
                    <Requests />
                </Grid>
            </Grid>
        );
    }
}

export default Borrower;