import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import loanManagerContractArtifect from "./ContractArtifects/LoanManager.json";

class SubmitRequest extends Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: '',
            repayBy: '',
            interest: ''
        };
    };

    async componentDidMount(){
        this.account = (await this.props.web3.eth.getAccounts())[0];

        const loanManagerContractAddress = loanManagerContractArtifect.networks[await this.props.web3.eth.net.getId()].address;
        this.loanManagerContract = new this.props.web3.eth.Contract(loanManagerContractArtifect.abi, loanManagerContractAddress);

        this.updateState();
    }

    async updateState(){

    }

    changeHanlder = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({ [name]: value });
    };

    submitHandler = async (event) => {
        console.log(this.account);
        if(((this.state.amount !== '') && (this.state.amount > 0)) && ((this.state.repayBy !== '') && (this.state.repayBy > 0)) && ((this.state.interest !== '') && (this.state.interest > 0))){
            event.preventDefault();
            try{
                await this.loanManagerContract.methods.submitRequest(this.state.amount, this.state.repayBy, this.state.interest).send({from: this.account});
            }
            catch(e){
                console.log(e);
            }
        }
        else{
            alert('Invalid values');
        }
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

                            <TextField
                                id="repayByField"
                                name="repayBy"
                                type="number"
                                label="Repay By"
                                onChange={this.changeHanlder}
                                value={this.state.repayBy}
                                fullWidth
                            />

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
                                Submit
                            </Button>
                        </form>
                    </Grid>

                </CardContent>
            </Card>
        );
    }
}

export default SubmitRequest;