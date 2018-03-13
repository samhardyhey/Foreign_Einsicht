//import and authenticate API prototoype instances
const NewsAPI = require("newsapi");
const newsapi = new NewsAPI("82e95d9b2adb48ec9d19ac90c42c9992");

const translate = require("@google-cloud/translate")({
    projectId: "keytest-178106",
    keyFilename: "./server/keys/keytest-3637696ad11b.json"
});

const language = require("@google-cloud/language")({
    projectId: "keytest-178106",
    keyFilename: "./server/keys/keytest-3637696ad11b.json"
});

//source bio information
const sourceDetails = require("./sources.json");

//retrieve top ten news articles for source as a JSON object
function retrieveSourceArticles(newsSource) {
    console.log(`retrieving top 10 articles for ${newsSource}..`);

    return newsapi
        .articles({
            source: newsSource,
            sortBy: "top" //filter on "top" articles
        })
        .then(trimArticleList)
        .then(articleObj => appendBio(articleObj, newsSource))
        .catch(err => logErr(err));
};

function appendBio(articleObj, sourceName) {
    articleObj.sourceName = sourceDetails[sourceName].name;
    articleObj.sourceBio = sourceDetails[sourceName].bio;
    return articleObj;
}

//remove clutter from article listing
function trimArticleList(initialResponse) {
    console.log("Trimming article information..");
    articleList = initialResponse.articles;

    //trim
    articleList.map(function(article) {
        delete article.author;
        delete article.url;
        delete article.publishedAt;
    });

    //create new object to store all desired data
    return (allData = {
        articles: articleList
    });
}

//multi async calls, this won't be pretty..
function translateSingle(articleObj) {
    return translate
        .translate(articleObj.description, "en")
        .then(translation => translation[0]) //utilize the first translation returned
        .then(translation => appendDes(translation, articleObj))
        .then(articleObj => translate.translate(articleObj.title, "en")) //repeat for the article's title
        .then(translation => translation[0])
        .then(translation => appendTitle(translation, articleObj))
        .catch(err => logErr(err));
};

//helper function, append translated description to larger object
function appendDes(des, articleObj) {
    articleObj.transDes = des;
    return articleObj;
};

//helper function, append translated title to larger object
function appendTitle(title, articleObj) {
    articleObj.transTitle = title;
    return articleObj;
};

//translate all source article descriptions, concatenate all descriptions
function translateArticles(allData) {
    console.log("Translating article descriptions and titles..");
    allDataTemp = allData; //placeholder to prevent overwriting entire object

    return Promise.all(allData.articles.map(translateSingle)) //collapse all article translations into single promise
        .then(results => Promise.resolve(results))
        .then(results => concateDescriptions(results, allDataTemp)) //compile descriptions
        .catch(err => logErr(err));
};

function concateDescriptions(allArticles, allData) {
    console.log("Concatenating article descriptions..");
    let allGerm = "";
    let allEng = "";

    //concatenate all descriptions
    allArticles.map(function(article) {
        allGerm += article.description;
        allEng += article.transDes;
    });

    allData.germDes = allGerm;
    allData.engDes = allEng;
    return allData;
}

//helper function, append english analysis onto the main data object
function appendEngAnalysis(analysis, allData) {
    allData.engSentScore = analysis[0].documentSentiment.score.toFixed(2); //sentiment
    allData.engMagScore = analysis[0].documentSentiment.magnitude.toFixed(2); //magnitude of sentiment
    return allData;
};

function appendGermAnalysis(analysis, allData) {
    allData.germSentScore = analysis[0].documentSentiment.score.toFixed(2); //cast to two decimals
    allData.germMagScore = analysis[0].documentSentiment.magnitude.toFixed(2);
    return allData;
};

//the concatenated german descriptions
function analyseGerm(allData) {
    console.log("Analysing German article descriptions..");

    const document = {
        content: allData.germDes, //format request object
        type: "PLAIN_TEXT"
    };

    return language //process, append to main
        .analyzeSentiment({ document: document })
        .then(results => appendGermAnalysis(results, allData))
        .catch(err => logErr(err));
};

//the concatenated english descriptions
function analyseEng(allData) {
    console.log("Analysing English article descriptions..");

    const document = {
        content: allData.engDes,
        type: "PLAIN_TEXT"
    };

    return language
        .analyzeSentiment({ document: document })
        .then(results => appendEngAnalysis(results, allData))
        .catch(err => logErr(err));
};

function formatFinal(source) {
    return retrieveSourceArticles(source) //1. retrieve
        .then(translateArticles) //2. translate
        .then(analyseGerm) //3. analyse
        .then(analyseEng)
        .catch(err => console.log(err)); //catch any errors
};

module.exports = {
    formatFinal: formatFinal
};