import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import loanManagerContractArtifect from "./ContractArtifects/LoanManager.json";

class SubmitGuarantee extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRequest: '',
            selectedRequestDetails: '',
            interest: '',
            requests: [],
        };
    };

    async componentDidMount(){
        this.account = (await this.props.web3.eth.getAccounts())[0];

        const loanManagerContractAddress = loanManagerContractArtifect.networks[await this.props.web3.eth.net.getId()].address;
        this.loanManagerContract = new this.props.web3.eth.Contract(loanManagerContractArtifect.abi, loanManagerContractAddress);

        this.updateState();
    }

    async updateState(){
        let requestIds = await this.loanManagerContract.methods.getRequests().call();
        let requests = [];
        
        var getRequestsPromise = new Promise((resolve, reject) => {
            requestIds.forEach(async(requestId, index, array) => {
                let request = await this.loanManagerContract.methods.getRequest(requestId).call();
                requests.push({
                    id: request[0],
                    borrower: request[1],
                    amount: request[2],
                    repayBy: request[3],
                    interest: request[4],
                    status: request[5]
                });
                if(index === array.length - 1) resolve();
            });
        })
        
        getRequestsPromise.then(() => {
            requests = requests.filter(request => request.status === '0').map(request => request.id);
            this.setState({requests});
        });
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
        if((this.state.selectedRequest !== '') && ((this.state.interest !== '') && (this.state.interest > 0))){
            event.preventDefault();
            try{
                await this.loanManagerContract.methods.submitGuarantee(this.state.selectedRequest, this.state.interest).send({from: this.account});
            }
            catch(e){
                console.log(e);
                alert('An error has occured while submitting guarantee');
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
                        Submit Guarantee
                    </Typography>

                    <form onSubmit={this.submitHandler}>

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

                </CardContent>
            </Card>
        );
    }
}

export default SubmitGuarantee;