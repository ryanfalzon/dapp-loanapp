import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';

import loanTokenContractArtifect from "./ContractArtifects/LoanToken.json";
import loanTokenSaleContractArtifect from "./ContractArtifects/LoanTokenSale.json";

class DelegateTokens extends Component {
    constructor(props) {
        super(props);
        this.state = {
            address: '',
            amount: ''
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
        this.setState({ balance })
    }

    changeHanlder = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({ [name]: value });
    };

    submitHandler = async (event) => {
        if(((this.state.address !== '') && (this.state.address > 0)) && ((this.state.amount !== '') && (this.state.amount > 0))){
            event.preventDefault();
            try{
                await this.loanTokenContract.methods.approve(this.state.address, this.state.amount).send({
                    from: this.account,
                });
            }
            catch(e){
                alert('An error has occured while delegating tokens');
            }
        }
        else{
            alert('Invalid values provided');
        }
    };

    render() {
        return (
            <Card className="card">
                <CardContent>

                    <Typography className="title" color="textPrimary" gutterBottom>
                        Delegate Loan Tokens
                    </Typography>

                    <Grid
                        container
                        direction="column"
                        justify="center"
                        alignItems="flex-start"
                    >
                        <form onSubmit={this.submitHandler}>

                            <TextField
                                id="addressField"
                                name="address"
                                type="text"
                                label="Address"
                                onChange={this.changeHanlder}
                                value={this.state.address}
                                fullWidth
                            />

                            <TextField
                                id="amountField"
                                name="amount"
                                type="number"
                                label="Amount"
                                onChange={this.changeHanlder}
                                value={this.state.amount}
                                fullWidth
                            />

                            <Button className="submitButton" type="submit" variant="contained" color="primary">
                                Delegate
                            </Button>
                        </form>
                    </Grid>

                </CardContent>
            </Card>
        );
    }
}

export default DelegateTokens;