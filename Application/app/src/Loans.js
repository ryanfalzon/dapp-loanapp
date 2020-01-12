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
                    status: loan[2]
                });
                
                if(index === array.length - 1) resolve();
            });
        })

        getLoansPromise.then(() => {
            this.setState({loans});
        });
    }
    
    getStatusName = (statusId) => {
        switch (statusId) {
            case '3':
                return 'Cancelled'

            case '5':
                return 'Awaiting Payment'
        
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
                                            </React.Fragment>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Tooltip title="Withdraw Guarantee">
                                            <IconButton edge="end" aria-label="withdrawGuarantee">
                                                <IconArrowUpward />
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

export default Loans;