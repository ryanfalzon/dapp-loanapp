import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import LinearProgress from '@material-ui/core/LinearProgress';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';

import loanTokenContractArtifect from "./ContractArtifects/LoanToken.json";
import loanTokenSaleContractArtifect from "./ContractArtifects/LoanTokenSale.json";

class BuyTokens extends Component {
    constructor(props) {
        super(props);
        this.state = {
            balance: 0,
            amount: 0,
            percentageSold: 0
        };
    };

    async componentDidMount(){
        this.account = (await this.props.web3.eth.getAccounts())[0];

        const loanTokenContractAddress = loanTokenContractArtifect.networks[await this.props.web3.eth.net.getId()].address;
        this.loanTokenContract = new this.props.web3.eth.Contract(loanTokenContractArtifect.abi, loanTokenContractAddress);

        const loanTokenSaleContractAddress = loanTokenSaleContractArtifect.networks[await this.props.web3.eth.net.getId()].address;
        this.loanTokenSaleContract = new this.props.web3.eth.Contract(loanTokenSaleContractArtifect.abi, loanTokenSaleContractAddress);

        this.tokenPrice = await this.loanTokenSaleContract.methods.tokenPrice().call();
        this.updateState();
    }

    async updateState(){
        const balance = await this.loanTokenContract.methods.balanceOf(this.account).call();
        this.setState({ balance });

        const availableTokens = await this.loanTokenContract.methods.balanceOf(this.loanTokenSaleContract._address).call();
        const tokensSold = await this.loanTokenSaleContract.methods.tokensSold().call();
        const percentageSold = (tokensSold * 100) / availableTokens;
        this.setState({ percentageSold });
        
    }

    changeHanlder = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({ [name]: value });
    };

    submitHandler = async (event) => {
        if(this.state.amount > 0){
            event.preventDefault();
            try{
                await this.loanTokenSaleContract.methods.buy(this.state.amount).send({
                    from: this.account,
                    value: (this.state.amount * this.tokenPrice),
                    gas: 100000
                });

                this.updateState();
            }
            catch(e){
                alert('An error has occured while buying tokens');
            }
        }
        else{
            alert('Invalid amount provided');
        }
    };

    render() {
        return (
            <Card className="card">
                <CardContent>

                    <Typography className="title" color="textPrimary" gutterBottom>
                        Buy Loan Tokens
                    </Typography>

                    <Grid
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="flex-start"
                        spacing={3}
                    >
                        <Grid item xs={6}>
                            <Grid
                                container
                                direction="column"
                                justify="center"
                                alignItems="flex-start"
                            >
                                <form onSubmit={this.submitHandler}>

                                    <TextField
                                        id="buyAmountField"
                                        name="amount"
                                        type="number"
                                        label="Amount"
                                        onChange={this.changeHanlder}
                                        value={this.state.amount}
                                        fullWidth
                                    />

                                    <Button className="submitButton" type="submit" variant="contained" color="primary">
                                        Buy
                                    </Button>
                                </form>
                                
                            </Grid>
                        </Grid>
                        
                        <Grid item xs={6}>
                            <Grid
                                container
                                direction="row"
                                justify="space-between"
                                alignItems="flex-start"
                            >
                                <div>
                                    <Typography variant="subtitle2" color="textPrimary" gutterBottom>
                                        Current Balance: {this.state.balance}LTX
                                    </Typography>
                                    <Typography variant="subtitle2" color="textPrimary" gutterBottom>
                                        Token Price: {this.tokenPrice / 1000000000000000000}ETH
                                    </Typography>
                                    <Typography variant="subtitle2" color="textPrimary" gutterBottom>
                                        Total Price: {this.state.amount * (this.tokenPrice / 1000000000000000000)}ETH
                                    </Typography>
                                </div>
                            </Grid>
                        </Grid>
                        
                    </Grid>

                </CardContent>

                <LinearProgress variant="determinate" value={this.state.percentageSold} color="secondary" />
            </Card>
        );
    }
}

export default BuyTokens;