//import and authenticate newsAPI prototype instance
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('82e95d9b2adb48ec9d19ac90c42c9992');

//import and authenticate translation API prototype instance 
const translate = require('@google-cloud/translate')({
    projectId: 'keytest-178106',
    keyFilename: './server/keys/keytest-3637696ad11b.json'
});

//import and authenticate language API prototype instance
const language = require('@google-cloud/language')({
    projectId: 'keytest-178106',
    keyFilename: './server/keys/keytest-3637696ad11b.json'
});

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

//log any thrown errors to the console
let logErr = function(err) {
    console.error(err)
}

let formatFinal = function(source) {
    //pseudo "main" function, currently hardcoded to use der spiegel as input source
    return retrieveSourceArticles(source) //1. retrieve
        .then(translateArticles) //2. translate
        .then(analyseGerm) //3. analyse
        .then(analyseEng)
        .catch(err => logErr(err)); //catch any errors
}

// exports = formatFinal;

module.exports = {
    formatFinal: formatFinal
};