import { Menu, MenuItem, ServerAPI } from 'decky-frontend-lib';
import { VFC } from 'react';
import { useStatPreferences } from '../../hooks/useStatPreferences';
import { patchAppDetails, resetAppDetails } from './appDetails';

type NormalItemProps = {
    setSortBy: (sortBy: number) => void;
    label: string;
    value: number;
};

const NormalItem: VFC<NormalItemProps> = ({
    setSortBy,
    label,
    value: sortBy,
}) => (
    <MenuItem
        onClick={() => {
            resetAppDetails();
            setSortBy(sortBy);
        }}
    >
        {label}
    </MenuItem>
);

type SortByMenuProps = {
    setSortBy: (sortBy: number) => void;
    serverAPI: ServerAPI;
};

const SortByMenu: VFC<SortByMenuProps> = ({ setSortBy, serverAPI }) => {
    const { sortByStat } = useStatPreferences();

    return (
        <Menu label="">
            <NormalItem setSortBy={setSortBy} value={1} label="Alphabetical" />
            <NormalItem
                setSortBy={setSortBy}
                value={10}
                label="Friends Playing"
            />
            <NormalItem
                setSortBy={setSortBy}
                value={2}
                label="% of Achievements Complete"
            />
            <MenuItem
                onClick={() => {
                    patchAppDetails(sortByStat, serverAPI);
                    setSortBy(4);
                }}
            >
                How long to beat
            </MenuItem>
            <NormalItem setSortBy={setSortBy} value={4} label="Hours Played" />
            <NormalItem setSortBy={setSortBy} value={5} label="Last Played" />
            <NormalItem setSortBy={setSortBy} value={6} label="Release Date" />
            <NormalItem
                setSortBy={setSortBy}
                value={7}
                label="Date Added to Library"
            />
            <NormalItem setSortBy={setSortBy} value={8} label="Size on Disk" />
            <NormalItem
                setSortBy={setSortBy}
                value={9}
                label="Metacritic Score"
            />
            <NormalItem setSortBy={setSortBy} value={11} label="Steam Review" />
        </Menu>
    );
};

export default SortByMenu;
