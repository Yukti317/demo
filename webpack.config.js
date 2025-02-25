const path = require('path');
const env = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { HotModuleReplacementPlugin, DefinePlugin } = require('webpack');
const fileName = `./src/helper/.env.${process.env.NODE_ENV}`;
const envFile = env.config({ path: fileName }).parsed;
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'dev';
module.exports = {
    entry: './src/index.js',
    mode,
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'specific.bundle.js',
        clean: true,
        publicPath: envFile.PUBLIC_PATH
    },

    devServer: {
        static: path.join(__dirname, 'build'),
        port: 3000,
        compress: true,
        open: true,
        historyApiFallback: true,
        hot: true,
        client: {
            overlay: mode !== 'production',
        },
    },
    resolve: {
        fallback: {
            buffer: false
        },
        extensions: ['*', '.js', '.jsx']
    },
    devtool: 'inline-source-map',
    stats: {
        colors: true,
        modules: true,
        reasons: true,
        errorDetails: true
    },
    performance: {
        hints: false
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/i,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false
                }
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: 'public/index.html'
        }),
        new MiniCssExtractPlugin({
            filename: 'style/[name].css'
        }),
        new HotModuleReplacementPlugin(),
        new ReactRefreshWebpackPlugin(),
        new DefinePlugin({ 'process.env': JSON.stringify(envFile) })
    ],
    optimization: {
        minimizer: [new CssMinimizerPlugin()]
    }
};
