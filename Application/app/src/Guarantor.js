import React, { Component } from 'react';
import Guarantees from './Guarantees';
import SubmitGuarantee from './SubmitGuarantee';
import Grid from '@material-ui/core/Grid';

class Guarantor extends Component {

    render() {
        return (
            <Grid container
                direction="row"
                justify="space-between"
                alignItems="flex-start"
                spacing={3}
            >
                <Grid item xs={6}>
                    <SubmitGuarantee />
                </Grid>
                <Grid item xs={6}>
                    <Guarantees />
                </Grid>
            </Grid>
        );
    }
}

export default Guarantor;