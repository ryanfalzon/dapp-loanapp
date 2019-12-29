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

class Loans extends Component {

    getLoans = () => {
        return [
            { id: '0x00000000000', amount: 10, interest: 1, payUntil: 123456789 },
            { id: '0x00000000000', amount: 10, interest: 1, payUntil: 123456789 },
            { id: '0x00000000000', amount: 10, interest: 1, payUntil: 123456789 },
            { id: '0x00000000000', amount: 10, interest: 1, payUntil: 123456789 }
        ];
    };

    render() {
        return (
            <Card className="card">
                <CardContent>

                    <Typography className="title" color="textPrimary" gutterBottom>
                        Loans Currently Provided
                    </Typography>

                    <List className="root">

                        {this.getLoans().map((item, index) => (
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