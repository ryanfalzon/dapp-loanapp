import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import IconDelete from '@material-ui/icons/Delete';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Tooltip from '@material-ui/core/Tooltip';

import guarantorManagerContractArtifect from "./ContractArtifects/GuarantorManager.json";

class Requests extends Component {
    constructor(props) {
        super(props);
        this.state = {
            guarantors: []
        }
    };

    async componentDidMount(){
        this.account = (await this.props.web3.eth.getAccounts())[0];

        const guarantorManagerContractAddress = guarantorManagerContractArtifect.networks[await this.props.web3.eth.net.getId()].address;
        this.guarantorManagerContract = new this.props.web3.eth.Contract(guarantorManagerContractArtifect.abi, guarantorManagerContractAddress);

        this.updateState();
    }

    async updateState(){
        let guarantors = await this.guarantorManagerContract.methods.getGuarantors().call();
        this.setState({guarantors});
    }

    render() {
        return (
            <Card className="card">
                <CardContent>

                    <Typography className="title" color="textPrimary" gutterBottom>
                        Guarantors
                    </Typography>

                    <List className="root">

                        {this.state.guarantors.map((item, index) => (
                            <div key={index}>
                                <ListItem alignItems="flex-start">
                                    <ListItemText
                                        primary={item}
                                    />
                                    <ListItemSecondaryAction>
                                        <Tooltip title="Delete Guarantor">
                                            <IconButton edge="end" aria-label="deleteGuarantor">
                                                <IconDelete />
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