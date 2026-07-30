import { Button } from '@mantine/core';
import { PRIMARY_ACTION_LABEL } from "@/entities/auction";
import { Link } from "@tanstack/react-router";

interface AuctionActionsProps {
    item: {
        uuid: string;
        primaryAction: keyof typeof PRIMARY_ACTION_LABEL;
    };
}

export function AuctionActions({ item }: AuctionActionsProps){
    const detailButton = (
        <Button
            size="xs"
            variant="default"
            renderRoot={(props) => (
                <Link
                    {...props}
                    to="/auctions/$auctionUuid"
                    params={{ auctionUuid: item.uuid }}
                    search={{ tab: 'about' }}
                />
            )}
        >
            Подробнее
        </Button>
    );

    if (item.primaryAction === 'SetBet' || item.primaryAction === 'ChangeBet') {
        return (
            <>
                {detailButton}
                <Button
                    size="xs"
                    renderRoot={(props) => (
                        <Link
                            {...props}
                            to="/auctions/$auctionUuid/bet"
                            params={{ auctionUuid: item.uuid }}
                        />
                    )}
                >
                    {PRIMARY_ACTION_LABEL[item.primaryAction]}
                </Button>
            </>
        );
    }

    if (item.primaryAction === 'ViewBets') {
        return (
            <>
                {detailButton}

                <Button
                    size="xs"
                    renderRoot={(props) => (
                        <Link
                            {...props}
                            to="/auctions/$auctionUuid"
                            params={{ auctionUuid: item.uuid }}
                            search={{ tab: 'bets' }}
                        />
                    )}
                >
                    {PRIMARY_ACTION_LABEL.ViewBets}
                </Button>
            </>
        );
    }

    return (
        <>
            {detailButton}
            <Button size="xs" disabled>
                {PRIMARY_ACTION_LABEL.None}
            </Button>
        </>
    );
}
