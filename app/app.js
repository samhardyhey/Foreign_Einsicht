//import necessary modules
//express, body-parser, handlebars
const express = require('express');
const hbs = require('hbs');

//import and authenticate newsAPI prototype instance
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('aNewsAPIKeyHere');

//import and authenticate translation API prototype instance 
const translate = require('@google-cloud/translate')({
    projectId: 'aGoogleProjectIDHere',
    keyFilename: '.aGoogleProjectKeyHere'
});

//import and authenticate language API prototype instance
const language = require('@google-cloud/language')({
    projectId: 'aGoogleProjectIDHere',
    keyFilename: '.aGoogleProjectKeyHere'
});

//create express app
const hostname = '0.0.0.0';
const port = 80;
const app = express();

//define view engine
app.set('view engine', 'html');
app.engine('html', hbs.__express);

//lets build a monolithic web app..
app.get('/', function(req, res) {

    //retrieve top ten news articles for source as a JSON object
    let retrieveSourceArticles = function(newsSource) {
        console.log(`retrieving top 10 articles for ${newsSource}..`);

        return newsapi.articles({
                source: newsSource, //query using the provided source
                sortBy: 'top' //retrieve top article listings
            })
            .then(trimArticleList)
            .catch(err => logErr(err))
    }

    //remove clutter from article listing
    function trimArticleList(initialResponse) {
        console.log("Trimming article information..")
        articleList = initialResponse.articles;

        //trim each article object within the "articles" property
        for (let i = 0; i < articleList.length; i++) {
            delete articleList[i].author;
            delete articleList[i].url;
            delete articleList[i].publishedAt;
        }

        //create new object to store all desired data
        return allData = {
            "articles": articleList,
            "germDes": '', //compiled descriptions
            "engDes": '',
            "germSentScore": '', //german analysis
            "germMagScore": '',
            "engSentScore": '', //english analysis
            "engMagScore": '',
        };
    }

    //translate a single source article's title and description (multi-async calls), this won't be pretty..
    let translateSingle = function(articleObj) {
        return translate.translate(articleObj.description, 'en')
            .then(translation => translation[0]) //utilize the first translation returned
            .then(translation => appendDes(translation, articleObj))
            .then(articleObj => translate.translate(articleObj.title, 'en')) //repeat for the article's title
            .then(translation => translation[0])
            .then(translation => appendTitle(translation, articleObj))
            .catch(err => logErr(err));
    }

    //helper function, append translated description to larger object
    let appendDes = function(des, articleObj) {
        articleObj.transDes = des;
        return articleObj;
    }

    //helper function, append translated title to larger object
    let appendTitle = function(title, articleObj) {
        articleObj.transTitle = title;
        return articleObj;
    }

    //translate all source article descriptions, concatenate all descriptions
    let translateArticles = function(allData) {
        console.log("Translating article descriptions and titles..");
        allDataTemp = allData; //placeholder to prevent overwriting entire object

        return Promise.all(allData.articles.map(translateSingle)) //collapse all article translations into single promise
            .then(results => Promise.resolve(results))
            .then(results => concateDescriptions(results, allDataTemp)) //compile descriptions
            .catch(err => logErr(err));
    }

    //concatenate all article descriptions into a single string for analysis, minimize API calls
    function concateDescriptions(allArticles, allData) {
        console.log("Concatenating article descriptions..")
        let allGerm = '';
        let allEng = '';

        //build the total article description
        for (let i = 0; i < allArticles.length; i++) {
            allGerm += allArticles[i].description;
            allEng += allArticles[i].transDes;
        }

        //append the concatenated descriptions to the object
        allData.germDes = allGerm;
        allData.engDes = allEng;
        return allData;
    }

    //helper function, append english analysis onto the main data object
    let appendEngAnalysis = function(analysis, allData) {
        allData.engSentScore = analysis[0].documentSentiment.score.toFixed(2); //sentiment
        allData.engMagScore = analysis[0].documentSentiment.magnitude.toFixed(2); //magnitude of sentiment
        return allData;
    }

    //helper function, append german analysis onto the main data object 
    let appendGermAnalysis = function(analysis, allData) {
        allData.germSentScore = analysis[0].documentSentiment.score.toFixed(2); //sentiment
        allData.germMagScore = analysis[0].documentSentiment.magnitude.toFixed(2); //magnitude of sentiment
        return allData;
    }

    //analyse the concatenated german article descriptions
    let analyseGerm = function(allData) {
        console.log("Analysing German article descriptions..")
        const document = { //feed in the article as a JSON object
            'content': allData.germDes, //the concatenated description
            type: 'PLAIN_TEXT'
        };

        //append to main data object
        return language.analyzeSentiment({ 'document': document })
            .then(results => appendGermAnalysis(results, allData))
            .catch(err => logErr(err));
    }

    //analyse the concatenated english article descriptions
    let analyseEng = function(allData) {
        console.log("Analysing English article descriptions..")
        const document = { //feed in the article as a JSON object
            'content': allData.engDes, //the concatenated description
            type: 'PLAIN_TEXT'
        };

        //append to main data object
        return language.analyzeSentiment({ 'document': document })
            .then(results => appendEngAnalysis(results, allData))
            .catch(err => logErr(err));
    }

    //unpack and render the main data object
    let renderFinal = function(allData) {
        console.log("Unpacking and Rendering all articles and analysis..")
        console.log("Show final data object..");
        console.log(allData)

        //include some useful information about the source
        sourceName = "Der Spiegel";
        sourceOverview = "Der Spiegel is a German weekly news magazine published in Hamburg.\
        It is one of Europe's largest publications of its kind, with a weekly circulation of 840,000.\
        Der Spiegel is known in German-speaking countries mostly for its investigative journalism.\
        It has played a key role in uncovering many political scandals such as the Spiegel scandal in 1962 and the Flick affair in the 1980s.\
        According to The Economist, Der Spiegel is one of continental Europe's most influential magazines";

        //forward elements to rendering template
        res.render('index', {
            sourceName: sourceName,
            sourceOverview: sourceOverview,
            articles: allData.articles,
            germSent: allData.germSentScore,
            germMag: allData.germMagScore,
            engSent: allData.engSentScore,
            engMag: allData.engMagScore
        });
    }

    //log any thrown errors to the console
    let logErr = function(err) {
        console.error(err)
    }

    //pseudo "main" function, currently hardcoded to use der spiegel as input source
    retrieveSourceArticles('spiegel-online') //1. retrieve
        .then(translateArticles) //2. translate
        .then(analyseGerm) //3. analyse
        .then(analyseEng)
        .then(renderFinal) //4. render
        .catch(err => logErr(err)); //catch any errors
});

//listen for requests
app.listen(port, function() {
    console.log(`Express app listening at http://${hostname}:${port}/`);
});