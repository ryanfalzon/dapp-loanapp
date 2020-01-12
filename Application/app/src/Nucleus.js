import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import LocalGroceryStoreIcon from '@material-ui/icons/LocalGroceryStore';
import CenterFocusStrongIcon from '@material-ui/icons/CenterFocusStrong';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import SendIcon from '@material-ui/icons/Send';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Borrower from './Borrower';
import Guarantor from './Guarantor';
import Lender from './Lender';
import Store from './Store';
import { Grid } from '@material-ui/core';
import { Route, Link, BrowserRouter as Router } from 'react-router-dom'
import Web3 from 'web3';
import Administrator from './Administrator';
var web3;

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    appBar: {
        [theme.breakpoints.up('sm')]: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
        },
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    menuLink: {
        textDecoration: 'none',
        color: 'black',
    }
}));

function setupWeb3(){
    if(window.ethereum){
      window.ethereum.autoRefreshOnNetworkChange = false;
      web3 = new Web3(window.ethereum);
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
      web3 = new Web3(window.web3.currentProvider);
    }
    else{
      alert('You have to install MetaMask!');
    }
  }

function Nucleus(props) {
    setupWeb3();

    const { container } = props;
    const classes = useStyles();
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <div>
            <div className={classes.toolbar} />
            <Divider />
            <List>
                {[
                    { Text: 'Borrower', Icon: SendIcon },
                    { Text: 'Guarantor', Icon: FingerprintIcon },
                    { Text: 'Lender', Icon: CenterFocusStrongIcon },
                    { Text: 'Store', Icon: LocalGroceryStoreIcon },
                    { Text: 'Administrator', Icon: SupervisorAccountIcon }
                ].map((object, index) => (
                    <Link key={index} className={classes.menuLink} to={() => { return '/' + object.Text }}>
                        <ListItem button key={index}>
                            <ListItemIcon><object.Icon /></ListItemIcon>
                            <ListItemText primary={object.Text} />
                        </ListItem>
                    </Link>
                ))}
            </List>
        </div>
    );

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        className={classes.menuButton}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Grid
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="center"
                    >
                        <Typography variant="h6" noWrap>
                            Loan Application
                        </Typography>
                        <Typography variant="subtitle2" noWrap>
                            Available Balance:
                        </Typography>
                    </Grid>
                </Toolbar>
            </AppBar>
            <Router>
                <nav className={classes.drawer} aria-label="mailbox folders">
                    {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                    <Hidden smUp implementation="css">
                        <Drawer
                            container={container}
                            variant="temporary"
                            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                            classes={{
                                paper: classes.drawerPaper,
                            }}
                            ModalProps={{
                                keepMounted: true, // Better open performance on mobile.
                            }}
                        >
                            {drawer}
                        </Drawer>
                    </Hidden>
                    <Hidden xsDown implementation="css">
                        <Drawer
                            classes={{
                                paper: classes.drawerPaper,
                            }}
                            variant="permanent"
                            open
                        >
                            {drawer}
                        </Drawer>
                    </Hidden>
                </nav>
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <div>
                        <Route
                            exact path="/"
                            render={(props) => <Borrower web3={web3} />}
                        />
                        <Route
                            path="/Borrower"
                            render={(props) => <Borrower web3={web3} />}
                        />
                        <Route
                            path="/Guarantor"
                            render={(props) => <Guarantor web3={web3} />}
                        />
                        <Route
                            path="/Lender"
                            render={(props) => <Lender web3={web3} />}
                        />
                        <Route
                            path="/Store"
                            render={(props) => <Store web3={web3} />}
                        />
                        <Route
                            path="/Administrator"
                            render={(props) => <Administrator web3={web3} />}
                        />
                    </div>
                </main>
            </Router>
        </div>
    );
}

export default Nucleus;