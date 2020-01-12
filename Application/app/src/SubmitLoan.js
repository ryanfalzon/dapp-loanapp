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

import loanManagerContractArtifect from "./ContractArtifects/LoanManager.json";

class SubmitLoan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRequestDetails: '',
            selectedRequest: '',
            requests: []
        };
    };

    async componentDidMount(){
        this.account = (await this.props.web3.eth.getAccounts())[0];

        const loanManagerContractAddress = loanManagerContractArtifect.networks[await this.props.web3.eth.net.getId()].address;
        this.loanManagerContract = new this.props.web3.eth.Contract(loanManagerContractArtifect.abi, loanManagerContractAddress);

        this.updateState();
    }

    async updateState(){
        let requests = await this.loanManagerContract.methods.getRequests().call();
        this.setState({requests});
    }

    changeHanlder = async (event) => {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({ [name]: value });

        if(name === 'selectedRequest'){
            let requestDetails = await this.loanManagerContract.methods.getRequest(value).call();
            let selectedRequestDetails = {
                id: requestDetails[0],
                borrower: requestDetails[1],
                amount: requestDetails[2],
                repayBy: requestDetails[3],
                interest: requestDetails[4],
                status: requestDetails[5]
            }
            
            this.setState({selectedRequestDetails});
        }
    };

    submitHandler = async (event) => {
        if(this.state.selectedRequest !== ''){
            event.preventDefault();
            try{
                await this.loanManagerContract.methods.submitLoan(this.state.selectedRequest).send({from: this.account});
            }
            catch(e){
                console.log(e);
                alert('An error has occured while submitting loan');
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
                        Submit Loan
                    </Typography>

                    <Grid
                        container
                        direction="column"
                        justify="center"
                        alignItems="flex-start"
                    >
                        <form className="formControl" onSubmit={this.submitHandler}>

                            <FormControl className="formControl">
                                <InputLabel id="requestLabel">Request</InputLabel>
                                <Select
                                    labelId="requestLabel"
                                    id="requestSelect"
                                    name="selectedRequest"
                                    onChange={this.changeHanlder}
                                    value={this.state.selectedRequest}
                                >
                                    {this.state.requests.map((item, index) => (
                                        <MenuItem key={index} value={item}>{item}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {this.state.selectedRequestDetails !== '' &&
                                ('Amount: ' + this.state.selectedRequestDetails.amount +
                                'LTX - Interest: ' + this.state.selectedRequestDetails.interest + 
                                'LTX - Repay By: ' + this.state.selectedRequestDetails.repayBy)
                            }
                            <br></br>

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

export default SubmitLoan;