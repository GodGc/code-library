module.exports = {
    base: "/library",
    title: "Code-library",
    description: "FED, 前端, React, Vue, 小程序, javascript, CSS, HTML",
    themeConfig: {
        logo: "http://www.godrry.com/usr/uploads/2020/01/1224649180.png",
        nav: [
            { text: "Library Home", link: "/" },
            { text: "Blog Home", link: "http://www.godrry.com/" },
        ],
        sidebar: {
            '/main/':[
                '',
                'ES5',
                'ES6',
                'React',
                'React-hook',
                'Diff',
                'Redux',
                'Network',
                'Webpack',
                'Interview',
                'BasicCS'
            ],
            '/JavaScript/': [
                '',
                'es6'
            ],
            '/React/': [
                '',
                'react-hook',
                'diff',
                'redux'
            ],
            '/network/':[
                ''
            ],
            '/webpack/':[
                ''
            ],
            '/interview/':[
                ''
            ],
            '/basicCS/':[
                ''
            ]
        },
        displayAllHeaders: true,
    },
};
