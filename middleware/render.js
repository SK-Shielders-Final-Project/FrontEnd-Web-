const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { StaticRouter } = require('react-router-dom/server');
const fs = require('fs');
const path = require('path');
const App = require('../src/App').default;
const { deserializeState } = require('./stateParser');

// 빌드된 index.html 파일 경로
const BUILD_INDEX_PATH = path.resolve(__dirname, '../build/index.html');

const handleRender = (req, res) => {
    // 1. 초기 상태 설정
    let preloadedState = {
        isSSR: true,
        user: { name: 'Guest', theme: 'light' }
    };

    const userPrefsCookie = req.cookies.user_prefs;

    if (userPrefsCookie) {
        try {
            // 쿠키 문자열 base64 디코딩
            const decodedStr = Buffer.from(userPrefsCookie, 'base64').toString('utf-8');
            // deserialization
            const customState = deserializeState(decodedStr);
            // 상태 병합
            preloadedState = { ...preloadedState, ...customState };
        } catch (e) {
            console.error('Cookie Parsing Error:', e.message);
        }
    } else {
        // 초기 상태 설정 base64
        const defaultSettings = 'eyB1c2VyOiB7IG5hbWU6ICJHdWVzdCIsIHRoZW1lOiAiZGFyayIgfSB9';
        res.cookie('user_prefs', defaultSettings, { httpOnly: true });
    }     

    // 2. React 컴포넌트 렌더링 (HTML 문자열 생성)
    const context = {};
    let appHtml = '';
    
    try {
        // App을 불러올 때 default가 객체 안에 감싸져 있는 경우가 있어 처리
        const AppComp = App.default || App;
        
        appHtml = ReactDOMServer.renderToString(
            React.createElement(
                StaticRouter,
                { location: req.url, context: context },
                React.createElement(AppComp, { initialData: preloadedState })
            )
        );
    } catch (err) {
        console.error('SSR Render Error:', err);
        return res.status(500).send('Server Rendering Error');
    }

    // 3. 빌드된 index.html을 읽어서 내용 주입 (CSS/JS 자동 해결)
    fs.readFile(BUILD_INDEX_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('Build file not found. Did you run "npm run build"?');
            return res.status(500).send('Build index.html missing');
        }

        // (1) <div id="root"></div> 안에 렌더링된 HTML 끼워 넣기
        let finalHtml = data.replace(
            '<div id="root"></div>', 
            `<div id="root">${appHtml}</div>`
        );

        // (2) 초기 상태(State) 데이터를 스크립트로 주입 (Hydration용)
        // </body> 태그 직전에 넣음
        finalHtml = finalHtml.replace(
            '</body>',
            `<script>window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')};</script></body>`
        );

        res.send(finalHtml);
    });
};

module.exports = { handleRender };