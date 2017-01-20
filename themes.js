

module.exports = {

    default: {
        name: "Default color theme",
        level: 3, // 16 milion colors
        palette: {
            fg: '#bbb',
            bg: '#1d1f21',
            boxBorderFG: '#888',
            searchFG: '#cc6666',
            listSelectedItemFG: '#c5c8c6',
            listSelectedItemBG: '#373b41',
            focusBorder: '#cc6666'
        }
    },

    tty16Default: {
        name: "TTY 16-color theme",
        level: 1, // 16 colors
        palette: {
            fg: 'white',
            bg: 'black',
            boxBorderFG: 'white',
            searchFG: 'cyan',
            listSelectedItemFG: 'yellow',
            listSelectedItemBG: 'black',
            focusBorder: 'red'
        }
    },

    tty1Default: {
        name: "TTY no color theme",
        level: 0, // 1 color
        palette: {
            fg: 'white',
            bg: 'black',
            boxBorderFG: 'white',
            searchFG: 'white',
            listSelectedItemFG: 'white',
            listSelectedItemBG: 'black',
            focusBorder: 'white'
        }
    }
};

