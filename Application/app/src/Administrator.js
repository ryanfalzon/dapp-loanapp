import React, { Component } from 'react';
import Guarantors from './Guarantors';
import SubmitGuarantor from './SubmitGuarantor';
import Grid from '@material-ui/core/Grid';

class Administrator extends Component {
    render() {
        return (
            <Grid container
                direction="row"
                justify="space-between"
                alignItems="flex-start"
                spacing={3}
            >
                <Grid item xs={6}>
                    <SubmitGuarantor web3={this.props.web3}/>
                </Grid>
                <Grid item xs={6}>
                    <Guarantors web3={this.props.web3}/>
                </Grid>
            </Grid>
        );
    }
}

export default Administrator;