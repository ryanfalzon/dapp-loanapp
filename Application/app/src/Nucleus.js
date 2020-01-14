import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Drawer from "@material-ui/core/Drawer";
import Grid from "@material-ui/core/Grid";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import FingerprintIcon from "@material-ui/icons/Fingerprint";
import LocalGroceryStoreIcon from "@material-ui/icons/LocalGroceryStore";
import CenterFocusStrongIcon from "@material-ui/icons/CenterFocusStrong";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import SendIcon from "@material-ui/icons/Send";
import { Route, Link, BrowserRouter as Router } from "react-router-dom";
import Borrower from './Borrower';
import Guarantor from './Guarantor';
import Lender from './Lender';
import Store from './Store';
import Administrator from './Administrator';
import guarantorManagerContractArtifect from "./ContractArtifects/GuarantorManager.json";
import loanManagerContractArtifect from "./ContractArtifects/LoanManager.json";
import Web3 from 'web3';

const drawerWidth = 240;
const styles = (theme) => ({
    root: {
        display: "flex"
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0
    },
    drawerPaper: {
        width: drawerWidth
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3)
    },
    toolbar: theme.mixins.toolbar
});

class Nucleus extends Component {
    constructor(props) {
        super(props);
        this.sitemap = [
            { Text: "Borrower", Icon: SendIcon },
            { Text: "Guarantor", Icon: FingerprintIcon },
            { Text: "Lender", Icon: CenterFocusStrongIcon },
            { Text: "Store", Icon: LocalGroceryStoreIcon },
            { Text: "Administrator", Icon: SupervisorAccountIcon }
        ];
        this.state = {
            balance: 0,
            address: '',
            isAdmin: false,
            isGuarantor: false
        }
        this.setupWeb3();
    };

    async componentDidMount(){
        const guarantorManagerContractAddress = guarantorManagerContractArtifect.networks[await this.web3.eth.net.getId()].address;
        this.guarantorManagerContract = new this.web3.eth.Contract(guarantorManagerContractArtifect.abi, guarantorManagerContractAddress);

        const loanManagerContractAddress = loanManagerContractArtifect.networks[await this.web3.eth.net.getId()].address;
        this.loanManagerContract = new this.web3.eth.Contract(loanManagerContractArtifect.abi, loanManagerContractAddress);

        let address = (await this.web3.eth.getAccounts())[0];
        this.setState({address});

        let balance = (await this.web3.eth.getBalance(address))/1000000000000000000;
        this.setState({balance});

        let isAdmin = (await this.loanManagerContract.methods.administrator().call()) == this.state.address;
        this.setState({isAdmin});

        let isGuarantor = await this.guarantorManagerContract.methods.isGuarantor(this.state.address).call();
        this.setState({isGuarantor});
    }

    setupWeb3 = () => {
        if(window.ethereum){
            window.ethereum.autoRefreshOnNetworkChange = false;
            this.web3 = new Web3(window.ethereum);
            try{
                window.ethereum.enable().then(function(){
                console.info('User has allowed account access to dApp');
                });
            }
            catch(e){
                console.info('User has denied account access to dApp');
            }
        }
        else if(window.web3){
            this.web3 = new Web3(window.web3.currentProvider);
        }
        else{
            alert('You have to install MetaMask!');
        }
    }

    render () {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <CssBaseline />
                <Router>
                    <AppBar position="fixed" className={classes.appBar}>
                        <Toolbar>
                            <Grid container direction="row" justify="space-between" alignItems="center">
                                <Typography variant="h6" noWrap>
                                    Loan dApp
                                </Typography>
                                <Typography variant="caption" noWrap>
                                    ETH: {this.state.balance}ETH | Address: {this.state.address}
                                </Typography>
                            </Grid>
                        </Toolbar>
                    </AppBar>
                    <Drawer className={classes.drawer} variant="permanent" classes={{paper: classes.drawerPaper}}>
                        <div className={classes.toolbar} />
                        <List>
                            {this.sitemap.map((object, index) => (
                                <Link key={index} className={classes.menuLink} to={() => { return '/' + object.Text }}>
                                    <ListItem button key={index}>
                                        <ListItemIcon><object.Icon /></ListItemIcon>
                                        <ListItemText primary={object.Text} />
                                    </ListItem>
                                </Link>
                            ))}
                        </List>
                        <Divider />
                    </Drawer>
                    <main className={classes.content}>
                        <div className={classes.toolbar} />
                        <div>
                            <Route
                                exact path="/"
                                render={(props) => <Borrower web3={this.web3} />}
                            />
                            <Route
                                path="/Borrower"
                                render={(props) => <Borrower web3={this.web3} />}
                            />
                            <Route
                                path="/Guarantor"
                                render={(props) => <Guarantor web3={this.web3} />}
                            />
                            <Route
                                path="/Lender"
                                render={(props) => <Lender web3={this.web3} />}
                            />
                            <Route
                                path="/Store"
                                render={(props) => <Store web3={this.web3} />}
                            />
                            <Route
                                path="/Administrator"
                                render={(props) => <Administrator web3={this.web3} />}
                            />
                        </div>
                    </main>
                </Router>
            </div>
        )
    }
}

export default withStyles(styles, { withTheme: true })(Nucleus);