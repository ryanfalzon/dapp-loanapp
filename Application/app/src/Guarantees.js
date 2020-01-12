import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import loanManagerContractArtifect from "./ContractArtifects/LoanManager.json";

class Guarantees extends Component {
    constructor(props) {
        super(props);
        this.state = {
            guarantees: []
        };
    };

    async componentDidMount(){
        this.account = (await this.props.web3.eth.getAccounts())[0];

        const loanManagerContractAddress = loanManagerContractArtifect.networks[await this.props.web3.eth.net.getId()].address;
        this.loanManagerContract = new this.props.web3.eth.Contract(loanManagerContractArtifect.abi, loanManagerContractAddress);

        this.updateState();
    }

    async updateState(){
        let guaranteeIds = await this.loanManagerContract.methods.getGuarantorGuarantees(this.account).call();
        let guarantees = [];
        
        var getGuaranteesPromise = new Promise((resolve, reject) => {
            guaranteeIds.forEach(async(guaranteeId, index, array) => {
                let guarantee = await this.loanManagerContract.methods.getGuarantee(guaranteeId).call();
                guarantees.push({
                    id: guarantee[0],
                    guarantor: guarantee[1],
                    interest: guarantee[2],
                    status: guarantee[3]
                });
                
                if(index === array.length - 1) resolve();
            });
        })

        getGuaranteesPromise.then(() => {
            this.setState({guarantees});
        });
    }

    getStatusName = (statusId) => {
        switch (statusId) {
            case '1':
                return 'Awaiting Guarantee Approval'
                
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
            <Card className="card">
                <CardContent>

                    <Typography className="title" color="textPrimary" gutterBottom>
                        Guarantees Currently Provided
                    </Typography>

                    <List className="root">

                        {this.state.guarantees.map((item, index) => (
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
                                                    Interest: {item.interest}LTX
                                                </Typography>
                                                {" - Status: " + this.getStatusName(item.status)}
                                            </React.Fragment>
                                        }
                                    />
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

export default Guarantees;