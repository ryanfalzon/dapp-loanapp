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
import Grid from '@material-ui/core/Grid';

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

    repayLoanHandler = async (event, item) => {
        event.preventDefault();
        try{
            const loanId = await this.loanManagerContract.methods.getRequestLoan(item.id).call();
            await this.loanManagerContract.methods.repayLoan(loanId).send({
                from: this.account
            });
        }
        catch(e){
            alert('An error has occured while repaying loan');
        }
        finally{
            this.updateState();
        }
    }

    acceptGuaranteeHandler = async (event, item) => {
        event.preventDefault();
        try{
            await this.loanManagerContract.methods.acceptGuarantee(item.id).send({
                from: this.account
            });
        }
        catch(e){
            alert('An error has occured while accepting guarantee');
        }
        finally{
            this.updateState();
        }
    }

    declineGuaranteeHandler = async (event, item) => {
        event.preventDefault();
        try{
            await this.loanManagerContract.methods.declineGuarantee(item.id).send({
                from: this.account
            });
        }
        catch(e){
            alert('An error has occured while declining guarantee');
        }
        finally{
            this.updateState();
        }
    }

    getStatusName = (statusId) => {
        switch (statusId) {
            case '0':
                return 'Awaiting Guarantee'

            case '1':
                return 'Awaiting Guarantee Approval'

            case '2':
                return 'Awaiting Loan'

            case '3':
                return 'Cancelled'

            case '4':
                return 'Completed'

            case '5':
                return 'Awaiting Payment'
    
            default:
                return 'Unknown'
        }
    }

    render() {
        return (
            <Grid
                container
                direction="column"
                justify="space-between"
                alignItems="center"
                spacing={3}
            >
                <Grid className="formControl" item xs={12}>
                    <Card className="card">
                        
                        <CardContent>
                            <Typography className="title" color="textPrimary" gutterBottom>
                                Current Requests
                            </Typography>

                            <List className="root">
                                {this.state.requests.map((item, index) => {
                                    return (item.status === '0' || item.status === '1' || item.status === '2') ?
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
                                                            {" - Interest: " + item.interest + " - Repay By Block: " + item.repayBy + " - Status: " + this.getStatusName(item.status)}
                                                        </React.Fragment>
                                                    }
                                                />
                                                <ListItemSecondaryAction>
                                                    {item.status === '1' &&
                                                        <Tooltip title="Accept Guarantee">
                                                            <IconButton edge="end" aria-label="acceptLoan" onClick={(event) => this.acceptGuaranteeHandler(event, item)}>
                                                                <IconCheck />
                                                            </IconButton>
                                                        </Tooltip>
                                                    }
                                                    {item.status === '1' &&
                                                        <Tooltip title="Decline Guarantee">
                                                            <IconButton edge="end" aria-label="declineGuarantee" onClick={(event) => this.declineGuaranteeHandler(event, item)}>
                                                                <IconClear />
                                                            </IconButton>
                                                        </Tooltip>
                                                    }
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            <Divider component="li" />
                                        </div>
                                    :
                                    null
                                })}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid className="formControl" item xs={12}>
                    <Card className="card">
                        <CardContent>
                            <Typography className="title" color="textPrimary" gutterBottom>
                                Current Loans
                            </Typography>
                            
                            <List className="root">
                                {this.state.requests.map((item, index) => {
                                    return (item.status === '4' || item.status === '5') ?
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
                                                            {" - Interest: " + item.interest + " - Repay By Block: " + item.repayBy + " - Status: " + this.getStatusName(item.status)}
                                                        </React.Fragment>
                                                    }
                                                />
                                                <ListItemSecondaryAction>
                                                    {item.status === '5' &&
                                                        <Tooltip title="Repay Loan">
                                                            <IconButton edge="end" aria-label="repayLoan" onClick={(event) => this.repayLoanHandler(event, item)}>
                                                                <IconCreditCard />
                                                            </IconButton>
                                                        </Tooltip>
                                                    }
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            <Divider component="li" />
                                        </div>
                                    :
                                        null
                                })}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid className="formControl" item xs={12}>
                    <Card className="card">
                        <CardContent>
                            <Typography className="title" color="textPrimary" gutterBottom>
                                Cancelled Requests
                            </Typography>
                            
                            <List className="root">
                                {this.state.requests.map((item, index) => {
                                    return item.status === '3' ?
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
                                                            {" - Interest: " + item.interest + " - Repay By Block: " + item.repayBy + " - Status: " + this.getStatusName(item.status)}
                                                        </React.Fragment>
                                                    }
                                                />
                                            </ListItem>
                                            <Divider component="li" />
                                        </div>
                                    :
                                        null
                                })}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };
}

export default Requests;