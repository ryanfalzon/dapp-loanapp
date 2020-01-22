import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import IconArrowUpward from '@material-ui/icons/ArrowUpward';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Tooltip from '@material-ui/core/Tooltip';

import loanManagerContractArtifect from "./ContractArtifects/LoanManager.json";

class Loans extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loans: []
        };
    };

    async componentDidMount(){
        this.account = (await this.props.web3.eth.getAccounts())[0];

        const loanManagerContractAddress = loanManagerContractArtifect.networks[await this.props.web3.eth.net.getId()].address;
        this.loanManagerContract = new this.props.web3.eth.Contract(loanManagerContractArtifect.abi, loanManagerContractAddress);

        this.updateState();
    }

    async updateState(){
        let loanIds = await this.loanManagerContract.methods.getLenderLoans(this.account).call();
        let loans = [];
        
        var getLoansPromise = new Promise((resolve, reject) => {
            loanIds.forEach(async(loanId, index, array) => {
                let loan = await this.loanManagerContract.methods.getLoan(loanId).call();
                loans.push({
                    id: loan[0],
                    lender: loan[1],
                    interest: loan[2],
                    status: loan[3]
                });
                
                if(index === array.length - 1) resolve();
            });
        })

        getLoansPromise.then(() => {
            this.setState({loans});
        });
    }

    withdrawGuaranteeHandler = async (event, item) => {
        event.preventDefault();
        try{
            // const loanId = await this.loanManagerContract.methods.getRequestLoan(item.id).call();
            await this.loanManagerContract.methods.withdrawGuarantee(item.id).send({
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

    
    getStatusName = (statusId) => {
        switch (statusId) {
            case '3':
                return 'Cancelled'

            case '4':
                return 'Completed'

            case '5':
                return 'Awaiting Payment'

            case '6':
                return 'Guarantee Withdrawn'

            case '7':
                return 'Overdue'
        
            default:
                return 'Unknown'
        }
    }

    render() {
        return (
            <Card className="card">
                <CardContent>

                    <Typography className="title" color="textPrimary" gutterBottom>
                        Loans Currently Provided
                    </Typography>

                    <List className="root">

                        {this.state.loans.map((item, index) => (
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
                                                    Status: {this.getStatusName(item.status)}
                                                </Typography>
                                                {" - Interest: " + item.interest}
                                            </React.Fragment>
                                        }
                                    />
                                    {item.status === '5' &&
                                        <ListItemSecondaryAction>
                                            <Tooltip title="Withdraw Guarantee">
                                                <IconButton edge="end" aria-label="withdrawGuarantee" onClick={(event) => this.withdrawGuaranteeHandler(event, item)}>
                                                    <IconArrowUpward />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    }
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

export default Loans;