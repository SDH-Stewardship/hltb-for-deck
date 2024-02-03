import { Menu, MenuGroup, MenuItem } from 'decky-frontend-lib';
import { VFC } from 'react';
import { L10n } from '../../module';
import useLocalization from '../../hooks/useLocalization';

type SortByMenuProps = {
    setSortBy: (sortBy: number) => void;
};

const SortByMenu: VFC<SortByMenuProps> = ({ setSortBy }) => {
    const lang = useLocalization();

    return (
        <Menu label="">
            <MenuItem onClick={() => setSortBy(1)}>
                {L10n.Localize('#Library_SortByAlphabetical')}
            </MenuItem>
            <MenuItem onClick={() => setSortBy(10)}>
                {L10n.Localize('#Library_SortByFriendsPlaying')}
            </MenuItem>
            <MenuItem onClick={() => setSortBy(2)}>
                {L10n.Localize('#Library_SortByPctAchievementsComplete')}
            </MenuItem>
            <MenuGroup label={lang('hltb')}>
                <MenuItem onClick={() => setSortBy(41)}>
                    {lang('mainStory')}
                </MenuItem>
                <MenuItem onClick={() => setSortBy(42)}>
                    {lang('mainPlusExtras')}
                </MenuItem>
                <MenuItem onClick={() => setSortBy(43)}>
                    {lang('completionist')}
                </MenuItem>
                <MenuItem onClick={() => setSortBy(44)}>
                    {lang('allStyles')}
                </MenuItem>
            </MenuGroup>
            <MenuItem onClick={() => setSortBy(4)}>
                {L10n.Localize('#Library_SortByHoursPlayed')}
            </MenuItem>
            <MenuItem onClick={() => setSortBy(5)}>
                {L10n.Localize('#Library_SortByLastPlayed')}
            </MenuItem>
            <MenuItem onClick={() => setSortBy(6)}>
                {L10n.Localize('#Library_SortByReleaseDate')}
            </MenuItem>
            <MenuItem onClick={() => setSortBy(7)}>
                {L10n.Localize('#Library_SortByAddedToLibrary')}
            </MenuItem>
            <MenuItem onClick={() => setSortBy(8)}>
                {L10n.Localize('#Library_SortBySizeOnDisk')}
            </MenuItem>
            <MenuItem onClick={() => setSortBy(9)}>
                {L10n.Localize('#Library_SortByMetacriticScore')}
            </MenuItem>
            <MenuItem onClick={() => setSortBy(11)}>
                {L10n.Localize('#Library_SortBySteamReview')}
            </MenuItem>
        </Menu>
    );
};

export default SortByMenu;
