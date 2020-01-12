import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';

import guarantorManagerContractArtifect from "./ContractArtifects/GuarantorManager.json";

class SubmitGuarantor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            address: ''
        };
    };

    async componentDidMount(){
        this.account = (await this.props.web3.eth.getAccounts())[0];

        const guarantorManagerContractAddress = guarantorManagerContractArtifect.networks[await this.props.web3.eth.net.getId()].address;
        this.guarantorManagerContract = new this.props.web3.eth.Contract(guarantorManagerContractArtifect.abi, guarantorManagerContractAddress);
    }

    changeHanlder = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({ [name]: value });
    };

    submitHandler = async (event) => {
        if((this.state.address !== '') && (this.state.address > 0)){
            event.preventDefault();
            try{
                await this.guarantorManagerContract.methods.addGuarantor(this.state.address).send({
                    from: this.account,
                });
            }
            catch(e){
                alert('An error has occured while approving guarantor');
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
                        Approve Guarantor
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

                            <Button className="submitButton" type="submit" variant="contained" color="primary">
                                Approve
                            </Button>
                        </form>
                    </Grid>

                </CardContent>
            </Card>
        );
    }
}

export default SubmitGuarantor;