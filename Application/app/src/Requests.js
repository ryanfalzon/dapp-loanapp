import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import IconCreditCard from '@material-ui/icons/CreditCard';
import IconCheck from '@material-ui/icons/Check';
import IconClear from '@material-ui/icons/Clear';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Tooltip from '@material-ui/core/Tooltip';

import loanManagerContractArtifect from "./ContractArtifects/LoanManager.json";

class Requests extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
        let requestIds = await this.loanManagerContract.methods.getBorrowerRequests(this.account).call();
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
            this.setState({requests});
        });
    }

    render() {
        return (
            <Card className="card">
                <CardContent>

                    <Typography className="title" color="textPrimary" gutterBottom>
                        Current Loan Requests
                    </Typography>

                    <List className="root">
                        {this.state.requests.map((item, index) => (
                            <div key={index}>
                                <ListItem alignItems="flex-start">
                                    <ListItemText
                                        primary={item.id}
                                        secondary={
                                            <React.Fragment>
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    className="inline"
                                                    color="textPrimary"
                                                >
                                                    Amount: {item.amount}
                                                </Typography>
                                                {" - Interest: " + item.interest + " - Repay By Block: " + item.repayBy}
                                            </React.Fragment>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Tooltip title="Repay Loan">
                                            <IconButton edge="end" aria-label="repayLoan">
                                                <IconCreditCard />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Accept Guarantee">
                                            <IconButton edge="end" aria-label="acceptGuarantee">
                                                <IconCheck />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Decline Guarantee">
                                            <IconButton edge="end" aria-label="declineGuarantee">
                                                <IconClear />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Divider component="li" />
                            </div>
                        ))}
                    </List>

                </CardContent>
            </Card>
        );
    };
}

export default Requests;