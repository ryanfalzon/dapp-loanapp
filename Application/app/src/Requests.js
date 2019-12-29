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

class Requests extends Component {

    getRequests = () => {
        return [
            { id: '0x00000000000', amount: 10, interest: 1, payUntil: 123456789 },
            { id: '0x00000000001', amount: 10, interest: 1, payUntil: 123456789 },
            { id: '0x00000000002', amount: 10, interest: 1, payUntil: 123456789 },
            { id: '0x00000000003', amount: 10, interest: 1, payUntil: 123456789 }
        ];
    };

    render() {
        return (
            <Card className="card">
                <CardContent>

                    <Typography className="title" color="textPrimary" gutterBottom>
                        Current Loan Requests
                    </Typography>

                    <List className="root">

                        {this.getRequests().map((item, index) => (
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
                                                {" - Interest: " + item.interest + " - Repay By: " + item.payUntil}
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