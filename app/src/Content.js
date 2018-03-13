import React, { Component } from 'react';
import axios from 'axios';

//render functions
const sourceOverview = function(data) {
    return (<table className="table">
            <tbody>
                <tr>
                    <td rowSpan="2">
                        <h2>{data.sourceName}</h2>
                        <p>{data.sourceBio}</p>
                    </td>
                    <td>
                        <h4>German Sentiment: {data.germSentScore}</h4></td>
                    <td>
                        <h4>English Sentiment: {data.engSentScore}</h4></td>
                </tr>
                <tr>
                    <td>
                        <h4>German Magnitude: {data.germMagScore}</h4></td>
                    <td>
                        <h4>English Magnitude: {data.engMagScore}</h4></td>
                </tr>
            </tbody>
        </table>);
}

const singleArticle = function(article) {
    return (
        <div>
        <tr>
        <td rowSpan="2"> <img src={article.urlToImage} className="rounded img-responsive" width="200"/> </td>
        <td><h5>{article.title}</h5></td>
        <td><h5>{article.transTitle}</h5></td>
        </tr>

        <tr>
        <td><p>{article.description}</p>
        </td><td><p>{article.transDes}</p></td>
        </tr>
        </div>
    );
}

const sourceArticles = function(articles) {
    return (<table className="table">
            <tbody>
                {articles.map(singleArticle)}
            </tbody>
        </table>);
}


class Content extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            source: '',
            data: {}
        };
    }

    componentDidMount() {
        axios.get('/source/' + this.props.source)
            .then(res => {
                this.setState({
                    data: res.data,
                    source: this.props.source
                });
            });
    }

    render() {
        if (this.state && this.state.data.articles) {
            return (<div className="container">
                {sourceOverview(this.state.data)}
                {sourceArticles(this.state.data.articles)}
            </div>);
        }
        return <div><h3>Retrieving articles..</h3></div>
    }
}

export default Content;