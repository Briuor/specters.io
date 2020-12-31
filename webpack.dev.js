const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
        game: './client/index.js'
    },
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            templateContent: `
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/3.0.3/socket.io.js"></script>
        <link rel="stylesheet" href="index.css" type="text/css" />
    </head>
      <body>
        <canvas id="canvas"></canvas>
        <ul id="leaderboard"></ul>
        <div class="game-name">
            <img src="/images/gamename.png" />
        </div>
        <form id="play-form">
            <label>Hero Name </label>
            <input id="name" type="text" placeholder="Guest" />
            <div class="play-btn">
            <button id="play" type="submit">Play</button>
            </div>
        </form>
        </body>
    </html>
  `
        })
    ]
}