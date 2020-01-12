import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import BuyTokens from './BuyTokens.js'
import DelegateTokens from './DelegateTokens.js'

class Store extends Component {
    render() {
        return (
            <Grid container
                direction="row"
                justify="space-between"
                alignItems="flex-start"
                spacing={3}
            >
                <Grid item xs={6}>
                    <BuyTokens web3={this.props.web3}/>
                </Grid>
                <Grid item xs={6}>
                    <DelegateTokens web3={this.props.web3}/>
                </Grid>
            </Grid>
        );
    }
}

export default Store;